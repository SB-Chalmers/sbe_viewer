import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const HBJSON_UPLOADS_DIR = path.join(__dirname, '..', 'public', 'HBJSONuploads');
if (!fs.existsSync(HBJSON_UPLOADS_DIR)) {
  fs.mkdirSync(HBJSON_UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => cb(null, HBJSON_UPLOADS_DIR),
  filename: (_req: Request, file: Express.Multer.File, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

router.use((_req: Request, res: Response, next: NextFunction) => {
  res.set('Content-Type', 'application/json');
  next();
});

router.post('/hbjson/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  console.log('Uploaded file:', req.file);
  const filePath = `/HBJSONuploads/${req.file.filename}`;
  res.json({ filePath });
});

export default router;
