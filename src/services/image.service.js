const sharp  = require('sharp');
const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');

const imageRepo     = require('../repositories/image.repository');
const transformRepo = require('../repositories/transformation.repository');

/**
 * Read pixel metadata from the uploaded file and save an Image record.
 * Multer has already written the file to disk before this is called.
 */
async function processUpload(userId, file) {
  const metadata = await sharp(file.path).metadata();

  return imageRepo.createImage({
    userId,
    originalFilename: file.originalname,
    storedFilename:   file.filename,
    mimeType:         file.mimetype,
    size:             file.size,
    width:            metadata.width,
    height:           metadata.height,
    path:             file.path,
  });
}

/**
 * Apply a filter (grayscale / blur / sepia) plus optional resize/rotate,
 * write the result to disk, log it in the DB, and return the public URL.
 *
 * Sharp uses a LAZY pipeline — nothing is processed until .toFile() is called.
 */
async function transformImage(userId, imageId, options) {
  // 1. Fetch image and verify ownership (prevent IDOR)
  const image = await imageRepo.getImageById(imageId);
  if (!image || image.userId !== userId) {
    throw new Error('Image not found or unauthorized');
  }

  let pipeline      = sharp(image.path);
  const transformType = [];

  // 2. Apply the requested filter
  const filter = options.transformationType;

  if (filter === 'grayscale' || options.grayscale) {
    pipeline = pipeline.grayscale();
    transformType.push('grayscale');

  } else if (filter === 'blur') {
    pipeline = pipeline.blur(10); // sigma = 10 → strong Gaussian blur
    transformType.push('blur');

  } else if (filter === 'sepia') {
    // Sharp has no built-in .sepia() — implement via colour matrix (recomb)
    // Each row: [outputR, outputG, outputB] = coefficients * [inputR, inputG, inputB]
    // These are the standard W3C photographic sepia values.
    pipeline = pipeline.recomb([
      [0.393, 0.769, 0.189], // new R
      [0.349, 0.686, 0.168], // new G
      [0.272, 0.534, 0.131], // new B
    ]);
    transformType.push('sepia');
  }

  // 3. Optional advanced transforms (future expansion)
  if (options.resize) {
    pipeline = pipeline.resize(options.resize.width, options.resize.height);
    transformType.push(`resize-${options.resize.width}x${options.resize.height}`);
  }
  if (options.rotate) {
    pipeline = pipeline.rotate(options.rotate);
    transformType.push(`rotate-${options.rotate}`);
  }

  // 4. Determine output format (default: same as input)
  const format = options.format || image.mimeType.split('/')[1];
  pipeline = pipeline.toFormat(format);
  transformType.push(`format:${format}`);

  // 5. Build output path
  const outputFilename  = `${uuidv4()}.${format}`;
  const transformedDir  = path.join(__dirname, '../../transformed');
  const outputPath      = path.join(transformedDir, outputFilename);

  // Ensure the directory exists (important on first run)
  if (!fs.existsSync(transformedDir)) {
    fs.mkdirSync(transformedDir, { recursive: true });
  }

  // 6. Execute the pipeline — this is where the actual image processing happens
  await pipeline.toFile(outputPath);

  // 7. Log the transformation in the database
  await transformRepo.createTransformation({
    imageId:           image.id,
    transformationType: transformType.join(','),
    outputPath,
    outputFormat:      format,
  });

  // 8. Return the public URL the frontend uses to show the result
  return {
    message: 'Transformation successful',
    url:     `/transformed/${outputFilename}`,
  };
}

/**
 * Delete an image file from disk and its DB record.
 */
async function deleteImage(userId, imageId) {
  const image = await imageRepo.getImageById(imageId);
  if (!image || image.userId !== userId) {
    throw new Error('Image not found or unauthorized');
  }
  if (fs.existsSync(image.path)) fs.unlinkSync(image.path);
  await imageRepo.deleteImage(imageId);
  return { message: 'Image deleted successfully' };
}

module.exports = { processUpload, transformImage, deleteImage };
