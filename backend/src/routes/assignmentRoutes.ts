import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createAssignment,
  getAssignment,
  listAssignments,
  regenerateAssignment,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignmentController';

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
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configure file filters to only accept pdf and txt
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedExtensions = ['.pdf', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and TXT files are allowed for upload.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Route mapping
router.post('/', upload.single('file'), createAssignment);
router.get('/', listAssignments);
router.get('/:id', getAssignment);
router.post('/:id/regenerate', regenerateAssignment);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);

export default router;
