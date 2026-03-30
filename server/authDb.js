const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  if (!hash) return false;
  // BCrypt hashes usually start with $2
  if (hash.startsWith('$2')) {
    return await bcrypt.compare(password, hash);
  }
  // Fallback for legacy SHA256 (from migration)
  const sha256 = crypto.createHash('sha256').update(password).digest('hex');
  return sha256 === hash;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { hashPassword, comparePassword, generateToken };
