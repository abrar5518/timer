const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { processQuestion, groupQuestions, analyzeSentiment } = require('./aiEngine');
const { generateReport } = require('./analytics');
const { userOps, roomOps } = require('./database');
const { hashPassword, comparePassword, generateToken } = require('./authDb');
const { sanitize, filterProfanity } = require('./utils');

const app = express();
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// NEW: Simple Rate Limiter (Professional Hardening)
const rateLimitStore = {};
app.use('/api/', (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  if (!rateLimitStore[ip]) rateLimitStore[ip] = { count: 0, reset: now + 60000 };
  
  if (now > rateLimitStore[ip].reset) {
    rateLimitStore[ip] = { count: 1, reset: now + 60000 };
  } else {
    rateLimitStore[ip].count++;
  }

  if (rateLimitStore[ip].count > 100) { // 100 reqs per minute
    return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
  }
  next();
});

// ──────────────────────────────────────────────

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// In-memory rooms cache (initialized from DB)
const rooms = {};

// Load all rooms from DB on boot and start intervals if needed
const ALL_ROOMS = userOps.getAll().map(u => roomOps.getByOwner(u.id)).flat();
// Note: We'll simplify this by just fetching all codes first if needed, 
// for now let's just initialize rooms when joined or tick needed.
// Better yet: Initialize all rooms from DB
db_init_rooms();

function db_init_rooms() {
  const users = userOps.getAll();
  users.forEach(u => {
    const userRooms = roomOps.getByOwner(u.id);
    userRooms.forEach(r => {
      const fullRoom = roomOps.get(r.code);
      rooms[r.code] = { 
        ...fullRoom, 
        participantCount: 0, 
        interval: null,
        running: false,
        currentIndex: 0,
        startedAt: null,
        lastRemaining: 0,
        questions: fullRoom.questions || [],
        polls: fullRoom.polls || []
      };
    });
  });
}

function createRoom(code, agenda, faqDoc, branding = {}, ownerId) {
  // Generate a private Host Key
  const hostKey = Math.random().toString(36).substring(2, 10).toUpperCase();

  const room = {
    code,
    ownerId,
    hostKey,
    agenda: agenda.map((item, i) => ({
      title: sanitize(item.title),
      durationSecs: (item.durationMins || 5) * 60,
      remainingSecs: (item.durationMins || 5) * 60,
      status: i === 0 ? 'active' : 'pending'
    })),
    faqDoc: sanitize(faqDoc) || '',
    branding: {
      logoUrl: sanitize(branding.logoUrl) || '',
      primaryColor: sanitize(branding.primaryColor) || '#e63946'
    },
    createdAt: new Date().toISOString()
  };

  roomOps.create(room);
  
  // Cache in memory for intervals
  rooms[code] = {
    ...room,
    running: false,
    currentIndex: 0,
    startedAt: null,
    lastRemaining: 0,
    interval: null,
    questions: [],
    polls: [],
    participantCount: 0
  };

  return rooms[code];
}

function generateCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function tickRoom(code) {
  const room = rooms[code];
  if (!room || !room.running || !room.startedAt) return;

  const item = room.agenda[room.currentIndex];
  if (!item) { room.running = false; return; }

  // REFACTORED: Calculate elapsed since startedAt
  const elapsed = Math.floor((Date.now() - room.startedAt) / 1000);
  item.remainingSecs = Math.max(0, room.lastRemaining - elapsed);

  if (item.remainingSecs <= 0) {
    item.status = 'done';
    room.currentIndex += 1;
    if (room.currentIndex < room.agenda.length) {
      room.agenda[room.currentIndex].status = 'active';
      room.startedAt = Date.now();
      room.lastRemaining = room.agenda[room.currentIndex].durationSecs;
      roomOps.logEvent(code, 'SEGMENT_CHANGE', { index: room.currentIndex, title: room.agenda[room.currentIndex].title });
    } else {
      room.running = false;
      room.startedAt = null;
      if (room.interval) clearInterval(room.interval);
      io.to(code).emit('event:ended');
    }
  }

  const activePoll = room.polls?.find(p => p.active);
  
  io.to(code).emit('timer:tick', {
    agenda: room.agenda,
    currentIndex: room.currentIndex,
    running: room.running,
    branding: room.branding,
    activePoll: activePoll || null
  });
}

// ──────────────────────────────────────────────
// AUTHENTICATION API
// ──────────────────────────────────────────────

app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const cleanEmail = email.toLowerCase().trim();
  if (userOps.getByEmail(cleanEmail)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const userId = 'usr_' + Math.random().toString(36).substring(2, 9);
  const user = {
    id: userId,
    name: sanitize(name),
    email: cleanEmail,
    passwordHash: await hashPassword(password),
    plan: 'Starter',
    createdAt: new Date().toISOString()
  };
  userOps.create(user);

  const token = generateToken();
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  userOps.createSession(token, userId, expiresAt);

  res.json({ token, user: { id: userId, name: user.name, email: cleanEmail, plan: 'Starter' } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();

  const user = userOps.getByEmail(cleanEmail);
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken();
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  userOps.createSession(token, user.id, expiresAt);

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
});

app.get('/api/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  const sess = userOps.getSession(token);
  if (!sess || sess.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = userOps.get(sess.userId);
  if (!user) return res.status(401).json({ error: 'User not found' });

  const history = roomOps.getByOwner(user.id);
  res.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan }, history });
});

app.post('/api/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) userOps.deleteSession(token);
  res.json({ ok: true });
});

// ──────────────────────────────────────────────
// ROOM API (With Auth Enforcement)
// ──────────────────────────────────────────────

// REST: Create room
app.post('/api/rooms', (req, res) => {
  const { agenda, faqDoc, branding } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  const sess = token ? userOps.getSession(token) : null;
  
  if (!sess || sess.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Please log in to create an event.' });
  }
  
  const user = userOps.get(sess.userId);
  if (!user) return res.status(401).json({ error: 'User not found.' });

  // Subscription Enforcement Logic
  // Starter tier limitations
  if (user.plan === 'Starter') {
    if (agenda.length > 3) {
      return res.status(403).json({ error: 'Starter plan is limited to 3 agenda items. Please upgrade to Pro.' });
    }
    // Strip branding if they try to pass it on free tier
    branding.logoUrl = '';
    branding.primaryColor = '#8a1538';
  }

  const code = generateCode();
  const room = createRoom(code, agenda, faqDoc, branding, user.id); // user instead of userId

  res.json({ code, hostKey: room.hostKey });
});

// Magic Setup: Generate a draft from a prompt
app.post('/api/magic-setup', (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const { generateDraft } = require('./aiEngine');
    const draft = generateDraft(prompt);
    res.json(draft);
  } catch (err) {
    console.error('Magic Setup Error:', err);
    res.status(500).json({ error: 'Internal Server Error during generation' });
  }
});

// REST: Get room info
app.get('/api/rooms/:code', (req, res) => {
  const room = rooms[req.params.code.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({
    code: room.code,
    agenda: room.agenda,
    currentIndex: room.currentIndex,
    running: room.running,
    participantCount: room.participantCount
  });
});

// NEW: Analytics Report API
app.get('/api/rooms/:code/report', (req, res) => {
  const report = generateReport(req.params.code.toUpperCase());
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json(report);
});

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('room:join', ({ code, role, hostKey }) => {
    const rc = code.toUpperCase();
    const room = rooms[rc];
    if (!room) return socket.emit('error', { msg: 'Room not found' });
    
    // Validate Host Key if role is host
    if (role === 'host' && hostKey !== room.hostKey) {
      return socket.emit('error', { msg: 'Unauthorized: Invalid Host Key' });
    }

    socket.join(rc);
    currentRoom = rc;
    rooms[rc].participantCount++;
    io.to(rc).emit('room:participants', { count: rooms[rc].participantCount });
    
    // REFACTORED: After restart, if room was running, resume the interval
    if (rooms[rc].running && !rooms[rc].interval) {
      rooms[rc].interval = setInterval(() => tickRoom(rc), 1000);
    }

    const activePoll = rooms[rc].polls.find(p => p.active);
    socket.emit('timer:tick', {
      agenda: rooms[rc].agenda,
      currentIndex: rooms[rc].currentIndex,
      running: rooms[rc].running,
      branding: rooms[rc].branding,
      activePoll: activePoll || null
    });
  });

  socket.on('timer:start', ({ code, hostKey }) => {
    const rc = code.toUpperCase();
    const room = rooms[rc];
    if (!room || room.running || hostKey !== room.hostKey) return;
    
    room.running = true;
    room.startedAt = Date.now();
    const item = room.agenda[room.currentIndex];
    room.lastRemaining = item.remainingSecs;
    
    roomOps.logEvent(rc, 'TIMER_START', { item: item.title, remaining: item.remainingSecs });
    roomOps.updateAgenda(rc, room.agenda);
    room.interval = setInterval(() => tickRoom(rc), 1000);
    io.to(rc).emit('timer:tick', {
      agenda: room.agenda,
      currentIndex: room.currentIndex,
      running: room.running
    });
  });

  socket.on('timer:pause', ({ code, hostKey }) => {
    const rc = code.toUpperCase();
    const room = rooms[rc];
    if (!room || hostKey !== room.hostKey) return;
    
    room.running = false;
    // Capture final state
    if (room.startedAt) {
      const elapsed = Math.floor((Date.now() - room.startedAt) / 1000);
      const item = room.agenda[room.currentIndex];
      if (item) item.remainingSecs = Math.max(0, room.lastRemaining - elapsed);
    }
    roomOps.logEvent(rc, 'TIMER_PAUSE', { currentIndex: room.currentIndex });
    room.startedAt = null;
    
    roomOps.updateAgenda(rc, room.agenda);
    if (room.interval) clearInterval(room.interval);
    io.to(rc).emit('timer:tick', {
      agenda: room.agenda,
      currentIndex: room.currentIndex,
      running: false
    });
  });

  socket.on('timer:reset', ({ code, hostKey }) => {
    const rc = code.toUpperCase();
    const room = rooms[rc];
    if (!room || hostKey !== room.hostKey) return;
    room.running = false;
    roomOps.updateAgenda(rc, room.agenda);
    if (room.interval) clearInterval(room.interval);
    room.currentIndex = 0;
    room.agenda.forEach((item, i) => {
      item.remainingSecs = item.durationSecs;
      item.status = i === 0 ? 'active' : 'pending';
    });
    io.to(rc).emit('timer:tick', {
      agenda: room.agenda,
      currentIndex: 0,
      running: false
    });
  });

  socket.on('timer:skip', ({ code, hostKey }) => {
    const rc = code.toUpperCase();
    const room = rooms[rc];
    if (!room || hostKey !== room.hostKey) return;
    const item = room.agenda[room.currentIndex];
    if (item) { item.status = 'done'; item.remainingSecs = 0; }
    room.currentIndex += 1;
    if (room.currentIndex < room.agenda.length) {
      room.agenda[room.currentIndex].status = 'active';
    } else {
      room.running = false;
      if (room.interval) clearInterval(room.interval);
      io.to(rc).emit('event:ended');
    }
    roomOps.updateAgenda(rc, room.agenda);
    io.to(rc).emit('timer:tick', {
      agenda: room.agenda,
      currentIndex: room.currentIndex,
      running: room.running
    });
  });

  // Q&A
  socket.on('qa:submit', async ({ code, question, name }) => {
    const rc = code.toUpperCase();
    const room = rooms[rc];
    if (!room) return;

    const safeQ = filterProfanity(sanitize(question));
    const safeName = sanitize(name) || 'Anonymous';

    const q = {
      id: Date.now(),
      question: safeQ,
      name: safeName,
      timestamp: new Date().toISOString(),
      votes: 1
    };
    roomOps.logEvent(rc, 'QA_SUBMIT', { question: safeQ, name: safeName });
    roomOps.addQuestion(rc, q);
    room.questions.push(q);

    // AI auto-response
    const aiReply = processQuestion(question, room.faqDoc);

    // Emit back to the submitter
    socket.emit('qa:reply', { questionId: q.id, question, answer: aiReply });

    // Broadcast the new question to audience (without AI answer)
    io.to(rc).emit('qa:new', q);

    // Update digest for speaker (grouped top questions)
    const digest = groupQuestions(room.questions);
    const sentiment = analyzeSentiment(room.questions);
    io.to(rc).emit('qa:digest', { digest, sentiment });
  });

  socket.on('qa:upvote', ({ code, questionId }) => {
    const rc = code.toUpperCase();
    const room = rooms[rc];
    if (!room) return;
    const q = room.questions.find(q => q.id === questionId);
    if (q) {
      q.votes++;
      roomOps.logEvent(rc, 'QA_UPVOTE', { questionId });
    }
    const digest = groupQuestions(room.questions);
    const sentiment = analyzeSentiment(room.questions);
    io.to(rc).emit('qa:digest', { digest, sentiment });
  });

  // POLLS
  socket.on('poll:create', ({ code, hostKey, question, options, duration }) => {
    const rc = code.toUpperCase();
    const room = rooms[rc];
    if (!room || hostKey !== room.hostKey) return;
    rooms[code].activePoll = {
      id: Date.now().toString(),
      question,
      options: options.map(o => ({ text: o, votes: 0 })),
      totalVotes: 0,
      active: true,
      expiresAt: duration ? Date.now() + (duration * 1000) : null
    };

    roomOps.logEvent(rc, 'POLL_CREATE', { question, options });
    io.to(code).emit('poll:new', rooms[code].activePoll);

    // Auto-close if duration provided
    if (duration) {
      setTimeout(() => {
        if (rooms[code].activePoll && rooms[code].activePoll.id === rooms[code].activePoll.id) {
          rooms[code].activePoll.active = false;
          io.to(code).emit('poll:update', rooms[code].activePoll);
        }
      }, duration * 1000);
    }
    if (!room.polls) room.polls = [];
    room.polls.push(rooms[code].activePoll);
    roomOps.upsertPoll(rc, rooms[code].activePoll);
  });

  socket.on('poll:vote', ({ code, pollId, optionIndex }) => {
    const rc = code.toUpperCase();
    const room = rooms[rc];
    if (!room) return;
    const poll = room.polls.find(p => p.id === pollId);
    if (poll && poll.active) {
      poll.options[optionIndex].votes++;
      poll.totalVotes++;
      roomOps.logEvent(rc, 'POLL_VOTE', { pollId, optionIndex });
      io.to(rc).emit('poll:update', poll);
    }
  });

  socket.on('poll:close', ({ code, hostKey, pollId }) => {
    const rc = code.toUpperCase();
    const room = rooms[rc];
    if (!room || hostKey !== room.hostKey) return;
    const poll = room.polls.find(p => p.id === pollId);
    if (poll) {
      poll.active = false;
      roomOps.upsertPoll(rc, poll);
      io.to(rc).emit('poll:update', poll);
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].participantCount = Math.max(0, rooms[currentRoom].participantCount - 1);
      io.to(currentRoom).emit('room:participants', { count: rooms[currentRoom].participantCount });
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`EventSync AI Server running on http://localhost:${PORT}`);
});
 
