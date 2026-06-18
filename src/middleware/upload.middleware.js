const multer = require('multer');
const path   = require('path');
const { v4: uuidv4 } = require('uuid');

// Use DiskStorage so large files are streamed to disk instead of held in RAM
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // UUID filename prevents collisions and hides the original name from URLs
    const uniqueSuffix = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

// Only accept image/* MIME types
function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = { upload };
