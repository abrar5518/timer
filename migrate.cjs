const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'server', 'eventsync.db'));

try {
  db.exec('ALTER TABLE questions ADD COLUMN status TEXT');
  console.log('Column "status" added to table "questions"');
} catch (err) {
  if (err.message.includes('duplicate column name')) {
    console.log('Column "status" already exists.');
  } else {
    console.error('Migration failed:', err.message);
  }
}

db.close();
