const prisma = require('../database/prisma');

const createTransformation = (data) => prisma.transformation.create({ data });

module.exports = { createTransformation };
