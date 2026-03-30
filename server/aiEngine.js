/**
 * AI Engine — Rule-based Q&A assistant and question clustering
 * No external API required. Simulates intelligent responses.
 */

const CANNED_RESPONSES = [
  // General & Logistics
  { patterns: ['deck', 'slides', 'presentation', 'share', 'send'], answer: 'Yes! The presentation slides will be shared with all attendees via email within 24 hours after the event concludes.' },
  { patterns: ['record', 'recording', 'replay', 'watch later'], answer: 'This event is being recorded. The recording will be available in your company portal within 48 hours.' },
  { patterns: ['q&a', 'questions', 'ask', 'question time'], answer: 'There will be a dedicated Q&A session at the end of each agenda segment. Please submit your questions here.' },
  { patterns: ['when', 'time', 'schedule', 'agenda', 'next'], answer: 'Check the live agenda panel on the left side of your screen. It updates in real-time as the event progresses.' },
  { patterns: ['zoom', 'link', 'join', 'access', 'reconnect'], answer: 'If you were disconnected, simply refresh this page. Your session will be restored automatically.' },
  { patterns: ['feedback', 'survey', 'rating', 'how was'], answer: 'A post-event survey will be sent to your email. Your feedback is critical in improving future events.' },
  
  // Finance & Strategy
  { patterns: ['revenue', 'profit', 'earnings', 'financial', 'numbers', 'q1', 'q2', 'q3', 'q4'], answer: 'Detailed financial figures will be covered by the CFO in the Financial Update segment. Please stay tuned.' },
  { patterns: ['growth', 'market', 'competitor', 'strategy', 'goal', 'target'], answer: 'Our strategic roadmap for the coming year addresses market growth and competitive positioning. This will be discussed in the Vision segment.' },
  
  // HR & People
  { patterns: ['headcount', 'hiring', 'layoff', 'restructure', 'team', 'staff'], answer: 'Organizational and culture updates will be addressed by the People Operations team during their designated agenda slot.' },
  { patterns: ['remote', 'office', 'hybrid', 'work from', 'policy'], answer: 'The updated workplace policy will be detailed during the HR update. Please hold specific policy questions for that session.' },
  
  // Product & Engineering
  { patterns: ['product', 'roadmap', 'feature', 'launch', 'release', 'demo'], answer: 'The product roadmap segment is coming up shortly. We will be showcasing several new features and the upcoming release timeline.' },
  { patterns: ['api', 'integration', 'technical', 'developer', 'docs'], answer: 'Technical documentation and API guides are available on our developer portal. Direct technical queries to the engineering team in the deep-dive session.' },
  { patterns: ['security', 'privacy', 'data', 'gdpr', 'compliance'], answer: 'We maintain the highest security standards. Compliance and data privacy details are available in the event handout or security whitepaper.' },

  // Creative & Event Specific
  { patterns: ['speaker', 'presenter', 'guest', 'bio'], answer: 'Speaker bios and background information are available in the event program. All speakers will be available for questions at the end.' },
  { patterns: ['music', 'video', 'sound', 'audio', 'volume'], answer: 'If you are experiencing audio issues, please check your local output settings or try refreshing the browser.' }
];

const FALLBACK_RESPONSES = [
  'Great question! This will be addressed during the live Q&A segment. The speaker will receive your question shortly.',
  'Thank you for asking. Your question has been logged and grouped with similar queries. The speaker will tackle the most popular topics in the Q&A segment.',
  "This question has been added to the speaker's digest. If several attendees ask similar things, it will be prioritized in the Q&A session.",
  "Our team is tracking this question. It'll be surfaced to the presenter if it gains traction. Keep it coming!",
  'Your question has been received. The AI Q&A engine has noted it and will route it to the appropriate speaker during the discussion.'
];

/**
 * Processes a question and returns an AI-generated response.
 * Checks FAQ doc first, then falls back to canned responses, then generic fallback.
 */
function processQuestion(question, faqDoc = '') {
  const q = question.toLowerCase();

  // 1. Check FAQ doc for keyword match (simple line-by-line search)
  if (faqDoc && faqDoc.trim().length > 0) {
    const lines = faqDoc.split('\n');
    for (const line of lines) {
      const words = q.split(' ').filter(w => w.length > 3);
      const hasMatch = words.some(word => line.toLowerCase().includes(word));
      if (hasMatch && line.includes(':')) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          return parts.slice(1).join(':').trim();
        }
        return line.trim();
      }
    }
  }

  // 2. Match against canned patterns
  for (const item of CANNED_RESPONSES) {
    const matched = item.patterns.some(p => q.includes(p));
    if (matched) return item.answer;
  }

  // 3. Fallback
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

/**
 * Groups similar questions by extracting key noun/topic words.
 * Returns top 5 grouped questions sorted by vote count + occurrence.
 */
function groupQuestions(questions) {
  if (!questions || questions.length === 0) return [];

  // Simple keyword extraction (3+ chars, ignore stop words)
  const stopWords = new Set(['what', 'when', 'where', 'will', 'that', 'this', 'with', 'have', 'from', 'they', 'about', 'your', 'more']);

  const extractKeywords = (text) =>
    text.toLowerCase().split(/\W+/)
      .filter(w => w.length > 3 && !stopWords.has(w));

  const groups = {};

  questions.forEach(q => {
    const keywords = extractKeywords(q.question);
    let matched = false;
    for (const key of Object.keys(groups)) {
      const groupKeywords = extractKeywords(key);
      const shared = keywords.filter(k => groupKeywords.includes(k));
      if (shared.length >= 1) {
        groups[key].count++;
        groups[key].votes += q.votes || 1;
        groups[key].questions.push(q.question);
        matched = true;
        break;
      }
    }
    if (!matched) {
      groups[q.question] = {
        representative: q.question,
        count: 1,
        votes: q.votes || 1,
        questions: [q.question]
      };
    }
  });

  return Object.values(groups)
    .sort((a, b) => (b.votes + b.count) - (a.votes + a.count))
    .slice(0, 5)
    .map(g => ({
      representative: g.representative,
      count: g.count,
      votes: g.votes
    }));
}

/**
 * Analyzes the overall sentiment of a list of questions.
 * Returns { label: string, score: number, color: string }
 */
function analyzeSentiment(questions) {
  if (!questions || questions.length === 0) return { label: 'Neutral', score: 50, color: 'var(--c-text-muted)' };

  const negativeTones = ['not', 'bad', 'issue', 'problem', 'fail', 'error', 'slow', 'expensive', 'why', 'how dare', 'broken', 'difficult', 'annoying', 'hate'];
  const inquisitiveTones = ['how', 'when', 'will', 'what', 'can', 'should', 'future', 'roadmap', 'details', 'tell us', 'explain'];
  const positiveTones = ['great', 'good', 'love', 'amazing', 'happy', 'excited', 'nice', 'wow', 'thanks', 'thank', 'awesome', 'brilliant'];

  let neg = 0, pos = 0, inq = 0;

  questions.forEach(q => {
    const text = q.question.toLowerCase();
    const weight = q.votes || 1;
    
    // Check for "Stop" markers or "But" transitions
    const isContradictory = text.includes('but') || text.includes('however');
    
    if (negativeTones.some(t => text.includes(t))) neg += weight * (isContradictory ? 1.5 : 1);
    if (inquisitiveTones.some(t => text.includes(t))) inq += weight;
    if (positiveTones.some(t => text.includes(t))) pos += weight;
  });

  const total = neg + pos + inq || 1;
  const nP = neg / total;
  const pP = pos / total;
  const iP = inq / total;

  if (nP > pP && nP > 0.25) return { label: 'Concerned', score: Math.round(nP * 100), color: '#e63946' };
  if (pP > nP && pP > 0.4) return { label: 'Enthusiastic', score: Math.round(pP * 100), color: '#2a9d8f' };
  if (iP > 0.5) return { label: 'Curious', score: Math.round(iP * 100), color: '#457b9d' };
  
  return { label: 'Engaged', score: 60, color: '#f4a261' };
}

/**
 * Generates a draft event structure from a natural language prompt.
 * Parses keywords for duration and titles to create a suggested agenda.
 */
function generateDraft(prompt) {
  const p = prompt.toLowerCase();
  
  // 0. Pre-defined specialized templates
  const templates = {
    webinar: {
      title: 'Industry Insights Webinar',
      agenda: [
        { title: 'Welcome & Speaker Intro', durationMins: 5 },
        { title: 'Market Trends 2024', durationMins: 15 },
        { title: 'Case Study Deep Dive', durationMins: 20 },
        { title: 'Live Audience Q&A', durationMins: 15 },
        { title: 'Closing Remarks', durationMins: 5 }
      ],
      faqDoc: 'Q: Will there be a recording?\nA: Yes, it will be emailed to all registrants.\nQ: Can I share the slides?\nA: Yes, the PDF link will be provided at the end.'
    },
    sync: {
      title: 'Team Weekly Sync',
      agenda: [
        { title: 'Last Week Roundup', durationMins: 10 },
        { title: 'Blockers & Help Needed', durationMins: 15 },
        { title: 'Next Week Priorities', durationMins: 5 }
      ],
      faqDoc: 'Goal: Keep it fast and efficient.'
    },
    workshop: {
      title: 'Product Strategy Workshop',
      agenda: [
        { title: 'Goal Setting', durationMins: 10 },
        { title: 'Ideation Session', durationMins: 30 },
        { title: 'Coffee Break', durationMins: 10 },
        { title: 'Prioritization Matrix', durationMins: 20 },
        { title: 'Action Items', durationMins: 10 }
      ],
      faqDoc: 'Workshop Materials: Miro board link in chat.'
    }
  };

  // Check for template match
  if (p.includes('webinar')) return templates.webinar;
  if (p.includes('sync')) return templates.sync;
  if (p.includes('workshop')) return templates.workshop;

  // Default structure building logic
  const draft = {
    title: 'Custom Event',
    agenda: [],
    faqDoc: 'Q: Will there be a recording?\nA: Yes, it will be available within 24 hours.'
  };

  // 1. Try to guess a better title
  if (p.includes('meeting')) draft.title = 'Team Meeting';
  if (p.includes('presentation')) draft.title = 'Project Presentation';
  if (p.includes('party')) draft.title = 'Celebration Event';
  if (p.includes('conference')) draft.title = 'Industry Conference';

  // 2. Simple regex to find "X minute Y" or "Y for X mins"
  const timeRegex = /(\d+)\s*(min|minute|mins|minutes)/g;
  let match;
  let lastIndex = 0;

  while ((match = timeRegex.exec(p)) !== null) {
    const mins = parseInt(match[1]);
    let segmentTitle = 'New Segment';
    const context = p.substring(Math.max(0, lastIndex), match.index).trim();
    if (context.length > 2) {
      const words = context.split(' ');
      segmentTitle = words.slice(-2).join(' ');
    }
    draft.agenda.push({
      title: segmentTitle.charAt(0).toUpperCase() + segmentTitle.slice(1),
      durationMins: mins
    });
    lastIndex = match.index + match[0].length;
  }

  // 3. Fallback
  if (draft.agenda.length === 0) {
    draft.agenda = [
      { title: 'Introduction', durationMins: 5 },
      { title: 'Primary Content', durationMins: 20 },
      { title: 'Conclusion & Q&A', durationMins: 5 }
    ];
  }

  return draft;
}

module.exports = { processQuestion, groupQuestions, analyzeSentiment, generateDraft };
