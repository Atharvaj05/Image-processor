const prisma = require('../database/prisma');

const createImage    = (data)   => prisma.image.create({ data });
const getUserImages  = (userId) => prisma.image.findMany({ where: { userId } });
const getImageById   = (id)     => prisma.image.findUnique({ where: { id } });
const deleteImage    = (id)     => prisma.image.delete({ where: { id } });

module.exports = { createImage, getUserImages, getImageById, deleteImage };
