const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const HBJSON_UPLOADS_DIR = path.join(__dirname, '..', 'public', 'HBJSONuploads');
if (!fs.existsSync(HBJSON_UPLOADS_DIR)) {
  fs.mkdirSync(HBJSON_UPLOADS_DIR, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, HBJSON_UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Ensure JSON content type for all routes in this router
router.use((req, res, next) => {
  res.set('Content-Type', 'application/json');
  next();
});

// HBJSON upload endpoint only
router.post('/hbjson/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  console.log('Uploaded file:', req.file);
  const filePath = `/HBJSONuploads/${req.file.filename}`;
  res.json({ filePath });
});

module.exports = router;
