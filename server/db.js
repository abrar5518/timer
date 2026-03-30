const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'rooms.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) return {};
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('DB Load Error:', e);
    return {};
  }
}

function saveDB(data) {
  try {
    // We strip the interval objects before saving
    const toSave = {};
    Object.keys(data).forEach(code => {
      const room = { ...data[code] };
      delete room.interval; // Cannot serialize intervals
      toSave[code] = room;
    });
    fs.writeFileSync(DB_PATH, JSON.stringify(toSave, null, 2));
  } catch (e) {
    console.error('DB Save Error:', e);
  }
}

module.exports = { loadDB, saveDB };
