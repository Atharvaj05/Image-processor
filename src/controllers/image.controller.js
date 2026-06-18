const imageService = require('../services/image.service');
const imageRepo    = require('../repositories/image.repository');

async function uploadImage(req, res, next) {
  try {
    if (!req.file) throw new Error('No image provided');
    const image = await imageService.processUpload(req.userId, req.file);
    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
}

async function listImages(req, res, next) {
  try {
    const images = await imageRepo.getUserImages(req.userId);
    res.status(200).json(images);
  } catch (err) {
    next(err);
  }
}

async function applyTransformation(req, res, next) {
  try {
    const imageId = req.params.id;
    const result  = await imageService.transformImage(req.userId, imageId, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteImage(req, res, next) {
  try {
    const imageId = req.params.id;
    await imageRepo.deleteImage(imageId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadImage, listImages, applyTransformation, deleteImage };
