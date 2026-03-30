function sanitize(text) {
  if (typeof text !== 'string') return '';
  // Basic tag stripping to prevent XSS
  return text.replace(/<[^>]*>?/gm, '').trim();
}

const PROFANITY = ['badword1', 'badword2']; // Placeholder for a real list
function filterProfanity(text) {
  let filtered = text;
  PROFANITY.forEach(word => {
    const reg = new RegExp(word, 'gi');
    filtered = filtered.replace(reg, '***');
  });
  return filtered;
}

module.exports = { sanitize, filterProfanity };
