const { roomOps } = require('./database');

function generateReport(code) {
  const room = roomOps.get(code);
  if (!room) return null;

  // 1. Basic Stats
  const totalPlannedSecs = room.agenda.reduce((s, i) => s + i.durationSecs, 0);
  const totalActualSecs = room.agenda.reduce((s, i) => s + (i.durationSecs - i.remainingSecs), 0);

  // 2. Agenda Performance
  const agendaPerformance = room.agenda.map(item => ({
    title: item.title,
    plannedMins: Math.round(item.durationSecs / 60),
    actualMins: Math.round((item.durationSecs - item.remainingSecs) / 60),
    accuracy: item.remainingSecs === 0 ? 100 : Math.round(((item.durationSecs - item.remainingSecs) / item.durationSecs) * 100),
    status: item.status
  }));

  // 3. Engagement: Q&A
  const totalQuestions = room.questions.length;
  const totalVotes = room.questions.reduce((s, q) => s + q.votes, 0);
  const avgVotes = totalQuestions ? (totalVotes / totalQuestions).toFixed(1) : 0;

  // 4. Engagement: Polls
  const pollStats = room.polls.map(p => ({
    question: p.question,
    totalVotes: p.totalVotes,
    winner: p.options.sort((a, b) => b.votes - a.votes)[0]?.text || 'N/A'
  }));

  // 5. Sentiment Summary (Mock/Basic for now based on AI Engine logic)
  // In a real app, we'd store the sentiment score per question in DB.
  // For now we re-analyze or use the average.
  const { analyzeSentiment } = require('./aiEngine');
  const sentiment = analyzeSentiment(room.questions);

  return {
    meta: {
      code: room.code,
      createdAt: room.createdAt,
      totalParticipants: room.participantCount // Note: This is "Current", we should ideally store "Peak" in DB.
    },
    timing: {
      totalPlannedSecs,
      totalActualSecs,
      performance: agendaPerformance
    },
    engagement: {
      questions: {
        total: totalQuestions,
        totalVotes,
        avgVotes
      },
      polls: pollStats,
      sentiment
    }
  };
}

module.exports = { generateReport };
