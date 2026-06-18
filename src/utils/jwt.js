const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'fallback_secret';

/**
 * Sign a token containing the user's ID, valid for 1 day.
 * @param {string} userId
 * @returns {string} JWT token
 */
function generateToken(userId) {
  return jwt.sign({ userId }, SECRET, { expiresIn: '1d' });
}

/**
 * Decode and verify a token.
 * Throws if the token is invalid, expired, or malformed.
 * @param {string} token
 * @returns {{ userId: string, iat: number, exp: number }}
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generateToken, verifyToken };
