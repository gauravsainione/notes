const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { auth } = require('../middleware/authMiddleware');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const previewsDir = path.join(uploadsDir, 'previews');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
const toPublicUploadPath = (absolutePath) => {
  const relativePath = path.relative(path.join(__dirname, '..'), absolutePath);
  return `/${relativePath.replace(/\\/g, '/')}`;
};

// Ensure upload directories exist
const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
ensureDir(uploadsDir);
ensureDir(previewsDir);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|doc|docx|jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only PDF, Doc, or Image files are allowed!');
    }
  }
});

// Generic file upload (images, docs, etc.)
router.post('/', auth, upload.single('file'), (req, res) => {
  res.send(toPublicUploadPath(req.file.path));
});

// PDF upload with auto-generated 5-page preview and first-page thumbnail
router.post('/pdf', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileUrl = toPublicUploadPath(filePath);

    // Read the uploaded PDF
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    // Extract first 5 pages (or all if fewer than 5) for preview
    const previewDoc = await PDFDocument.create();
    const pagesToCopy = Math.min(5, totalPages);
    const copiedPages = await previewDoc.copyPages(pdfDoc, Array.from({ length: pagesToCopy }, (_, i) => i));
    copiedPages.forEach(page => previewDoc.addPage(page));

    const previewFilename = `preview-${Date.now()}.pdf`;
    const previewPath = path.join(previewsDir, previewFilename);
    const previewBytes = await previewDoc.save();
    fs.writeFileSync(previewPath, previewBytes);
    const previewUrl = toPublicUploadPath(previewPath);

    // Extract first page only as thumbnail
    ensureDir(thumbnailsDir);
    const thumbDoc = await PDFDocument.create();
    const [thumbPage] = await thumbDoc.copyPages(pdfDoc, [0]);
    thumbDoc.addPage(thumbPage);

    const thumbFilename = `thumb-${Date.now()}.pdf`;
    const thumbPath = path.join(thumbnailsDir, thumbFilename);
    const thumbBytes = await thumbDoc.save();
    fs.writeFileSync(thumbPath, thumbBytes);
    const thumbnailUrl = toPublicUploadPath(thumbPath);

    res.json({ fileUrl, previewUrl, thumbnailUrl });
  } catch (err) {
    console.error('PDF upload error:', err);
    res.status(500).json({ message: 'Failed to process PDF', error: err.message });
  }
});

module.exports = router;
