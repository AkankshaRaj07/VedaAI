import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  listLibraryItems, 
  uploadLibraryItem, 
  deleteLibraryItem 
} from '../controllers/libraryController';

const router = express.Router();

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `library-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configure file filters to accept pdf, txt, and docx
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedExtensions = ['.pdf', '.txt', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, TXT, and DOCX files are allowed for upload.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.get('/', listLibraryItems);
router.post('/upload', upload.single('file'), uploadLibraryItem);
router.delete('/:id', deleteLibraryItem);

export default router;
