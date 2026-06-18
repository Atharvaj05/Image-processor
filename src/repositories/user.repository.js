const prisma = require('../database/prisma');

const findUserByEmail    = (email)    => prisma.user.findUnique({ where: { email } });
const findUserByUsername = (username) => prisma.user.findUnique({ where: { username } });
const createUser         = (data)     => prisma.user.create({ data });

module.exports = { findUserByEmail, findUserByUsername, createUser };
