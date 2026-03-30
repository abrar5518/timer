const { migrateFromJSON } = require('./database');
migrateFromJSON();
console.log('Migration complete. You can now start the server.');
