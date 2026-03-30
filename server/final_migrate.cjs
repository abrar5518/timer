const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'eventsync.db'));

try {
  db.exec('ALTER TABLE questions ADD COLUMN status TEXT');
  console.log('Column "status" added successfully.');
} catch (err) {
  console.error('Migration failed:', err.message);
}

db.close();
