const bcrypt         = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const { generateToken } = require('../utils/jwt');

const SALT_ROUNDS = 10; // 2^10 = 1 024 iterations — intentionally slow

/**
 * Register a new user.
 * Hashes the password with bcrypt before storing.
 * Returns the new user (without passwordHash) and a signed JWT.
 */
async function registerUser(username, email, password) {
  const existingEmail = await userRepository.findUserByEmail(email);
  if (existingEmail) throw new Error('Email already in use');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.createUser({ username, email, passwordHash });
  const token = generateToken(user.id);

  return {
    user: { id: user.id, username: user.username, email: user.email },
    token,
  };
}

/**
 * Authenticate an existing user.
 * Uses a generic error message to avoid user-enumeration attacks.
 */
async function loginUser(email, password) {
  const user = await userRepository.findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) throw new Error('Invalid credentials');

  const token = generateToken(user.id);
  return {
    user: { id: user.id, username: user.username, email: user.email },
    token,
  };
}

module.exports = { registerUser, loginUser };
