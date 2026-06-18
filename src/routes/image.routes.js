const { Router } = require('express');
const { uploadImage, listImages, applyTransformation, deleteImage } =
  require('../controllers/image.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { upload }      = require('../middleware/upload.middleware');

const router = Router();

// All image routes require a valid JWT
router.use(requireAuth);

router.post('/',              upload.single('image'), uploadImage);
router.get('/',               listImages);
router.post('/:id/transform', applyTransformation);
router.delete('/:id',         deleteImage);

module.exports = router;
