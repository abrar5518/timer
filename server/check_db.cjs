const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'eventsync.db'));

try {
  const columns = db.prepare('PRAGMA table_info(questions)').all();
  console.log('Columns in "questions" table:');
  columns.forEach(c => console.log(`- ${c.name}`));
} catch (err) {
  console.error('Check failed:', err.message);
}

db.close();
