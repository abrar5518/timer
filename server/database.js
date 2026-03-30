const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const db = new Database(path.join(__dirname, 'eventsync.db'));

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    passwordHash TEXT,
    plan TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS rooms (
    code TEXT PRIMARY KEY,
    ownerId TEXT,
    hostKey TEXT,
    faqDoc TEXT,
    brandingJson TEXT,
    createdAt TEXT,
    FOREIGN KEY (ownerId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS agenda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roomCode TEXT,
    title TEXT,
    durationSecs INTEGER,
    remainingSecs INTEGER,
    status TEXT,
    sortOrder INTEGER,
    FOREIGN KEY (roomCode) REFERENCES rooms(code) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roomCode TEXT,
    question TEXT,
    name TEXT,
    timestamp TEXT,
    votes INTEGER,
    status TEXT,
    FOREIGN KEY (roomCode) REFERENCES rooms(code) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    roomCode TEXT,
    question TEXT,
    optionsJson TEXT,
    totalVotes INTEGER,
    active INTEGER,
    expiresAt INTEGER,
    FOREIGN KEY (roomCode) REFERENCES rooms(code) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    userId TEXT,
    expiresAt INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS event_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roomCode TEXT,
    type TEXT,
    data TEXT,
    timestamp TEXT,
    FOREIGN KEY (roomCode) REFERENCES rooms(code) ON DELETE CASCADE
  );
`);

// ──────────────────────────────────────────────
// USER OPERATIONS
// ──────────────────────────────────────────────
const userOps = {
  get: (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id),
  getByEmail: (email) => db.prepare('SELECT * FROM users WHERE email = ?').get(email),
  create: (user) => {
    const stmt = db.prepare('INSERT INTO users (id, name, email, passwordHash, plan, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(user.id, user.name, user.email, user.passwordHash, user.plan, user.createdAt);
  },
  getAll: () => db.prepare('SELECT * FROM users').all(),

  // SESSION OPS
  createSession: (token, userId, expiresAt) => {
    db.prepare('INSERT INTO sessions (token, userId, expiresAt) VALUES (?, ?, ?)').run(token, userId, expiresAt);
  },
  getSession: (token) => db.prepare('SELECT * FROM sessions WHERE token = ?').get(token),
  deleteSession: (token) => db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
};

// ──────────────────────────────────────────────
// ROOM OPERATIONS
// ──────────────────────────────────────────────
const roomOps = {
  get: (code) => {
    const room = db.prepare('SELECT * FROM rooms WHERE code = ?').get(code);
    if (!room) return null;
    
    // Join with components
    room.agenda = db.prepare('SELECT * FROM agenda WHERE roomCode = ? ORDER BY sortOrder ASC').all(code);
    room.questions = db.prepare('SELECT * FROM questions WHERE roomCode = ?').all(code);
    room.polls = db.prepare('SELECT * FROM polls WHERE roomCode = ?').all(code).map(p => ({
      ...p,
      options: JSON.parse(p.optionsJson),
      active: !!p.active
    }));
    room.branding = JSON.parse(room.brandingJson || '{}');
    return room;
  },
  
  create: (room) => {
    const stmt = db.prepare('INSERT INTO rooms (code, ownerId, hostKey, faqDoc, brandingJson, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(room.code, room.ownerId, room.hostKey, room.faqDoc, JSON.stringify(room.branding), room.createdAt);
    
    // Insert agenda
    const agendaStmt = db.prepare('INSERT INTO agenda (roomCode, title, durationSecs, remainingSecs, status, sortOrder) VALUES (?, ?, ?, ?, ?, ?)');
    room.agenda.forEach((item, i) => {
      agendaStmt.run(room.code, item.title, item.durationSecs, item.remainingSecs, item.status, i);
    });
  },

  updateAgenda: (roomCode, agenda) => {
    db.transaction(() => {
      db.prepare('DELETE FROM agenda WHERE roomCode = ?').run(roomCode);
      const stmt = db.prepare('INSERT INTO agenda (roomCode, title, durationSecs, remainingSecs, status, sortOrder) VALUES (?, ?, ?, ?, ?, ?)');
      agenda.forEach((item, i) => {
        stmt.run(roomCode, item.title, item.durationSecs, item.remainingSecs, item.status, i);
      });
    })();
  },

  addQuestion: (roomCode, q) => {
    const stmt = db.prepare('INSERT INTO questions (roomCode, question, name, timestamp, votes, status) VALUES (?, ?, ?, ?, ?, ?)');
    return stmt.run(roomCode, q.question, q.name, q.timestamp, q.votes || 1, q.status || 'approved').lastInsertRowid;
  },

  upvoteQuestion: (id) => {
    db.prepare('UPDATE questions SET votes = votes + 1 WHERE id = ?').run(id);
  },

  updateQuestionStatus: (id, status) => {
    db.prepare('UPDATE questions SET status = ? WHERE id = ?').run(status, id);
  },

  getQuestions: (roomCode) => {
    return db.prepare('SELECT * FROM questions WHERE roomCode = ? ORDER BY votes DESC, timestamp ASC').all(roomCode);
  },

  upsertPoll: (roomCode, poll) => {
    const stmt = db.prepare(`
      INSERT INTO polls (id, roomCode, question, optionsJson, totalVotes, active, expiresAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        optionsJson = excluded.optionsJson,
        totalVotes = excluded.totalVotes,
        active = excluded.active
    `);
    stmt.run(poll.id, roomCode, poll.question, JSON.stringify(poll.options), poll.totalVotes, poll.active ? 1 : 0, poll.expiresAt);
  },

  getByOwner: (ownerId) => {
    return db.prepare('SELECT code, createdAt FROM rooms WHERE ownerId = ? ORDER BY createdAt DESC').all(ownerId);
  },

  // LOGGING
  logEvent: (roomCode, type, data) => {
    const stmt = db.prepare('INSERT INTO event_logs (roomCode, type, data, timestamp) VALUES (?, ?, ?, ?)');
    stmt.run(roomCode, type, JSON.stringify(data), new Date().toISOString());
  },
  getLogs: (roomCode) => {
    return db.prepare('SELECT * FROM event_logs WHERE roomCode = ? ORDER BY timestamp ASC').all(roomCode).map(l => ({
      ...l,
      data: JSON.parse(l.data)
    }));
  }
};

// ──────────────────────────────────────────────
// MIGRATION HELPER
// ──────────────────────────────────────────────
function migrateFromJSON() {
  const usersPath = path.join(__dirname, 'users.json');
  const roomsPath = path.join(__dirname, 'rooms.json');

  if (fs.existsSync(usersPath)) {
    console.log('Migrating users...');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    Object.values(users).forEach(u => {
      try { userOps.create(u); } catch(e) {}
    });
    fs.renameSync(usersPath, usersPath + '.bak');
  }

  if (fs.existsSync(roomsPath)) {
    console.log('Migrating rooms...');
    const roomsData = JSON.parse(fs.readFileSync(roomsPath, 'utf8'));
    Object.values(roomsData).forEach(r => {
      try {
        roomOps.create({
          ...r,
          branding: r.branding || {},
          createdAt: r.createdAt || new Date().toISOString()
        });
        // Questions and Polls migration (optional detail, but good for completeness)
        r.questions?.forEach(q => roomOps.addQuestion(r.code, q));
        r.polls?.forEach(p => roomOps.upsertPoll(r.code, p));
      } catch(e) {
        console.error(`Error migrating room ${r.code}:`, e.message);
      }
    });
    fs.renameSync(roomsPath, roomsPath + '.bak');
  }
}

module.exports = { userOps, roomOps, migrateFromJSON };
