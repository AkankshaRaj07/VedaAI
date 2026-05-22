import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Library from '../models/Library';

const INITIAL_MATERIALS = [
  { name: 'NCERT Class 10 Physics Textbook.pdf', size: '4.8 MB', category: 'Textbooks', groundingCount: 14, fileUrl: '/uploads/NCERT_Class_10_Physics_Textbook.pdf' },
  { name: 'Grade 9 Midterm Physics Exam 2025.pdf', size: '1.2 MB', category: 'Past Exams', groundingCount: 8, fileUrl: '/uploads/Grade_9_Midterm_Physics_Exam_2025.pdf' },
  { name: 'CBSE Syllabus Guidelines 2026.pdf', size: '850 KB', category: 'School Guidelines', groundingCount: 22, fileUrl: '/uploads/CBSE_Syllabus_Guidelines_2026.pdf' },
  { name: 'Thermodynamics Lecture Slides.pdf', size: '3.4 MB', category: 'Textbooks', groundingCount: 6, fileUrl: '/uploads/Thermodynamics_Lecture_Slides.pdf' },
  { name: 'Laboratory Experiments Manual.pdf', size: '2.1 MB', category: 'School Guidelines', groundingCount: 3, fileUrl: '/uploads/Laboratory_Experiments_Manual.pdf' },
];

export const listLibraryItems = async (req: Request, res: Response): Promise<void> => {
  try {
    let items = await Library.find().sort({ uploadedAt: -1 });
    if (items.length === 0) {
      console.log('Seeding initial reference library materials database...');
      await Library.insertMany(INITIAL_MATERIALS);
      items = await Library.find().sort({ uploadedAt: -1 });
    }
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list library materials' });
  }
};

export const uploadLibraryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded. Please upload a valid document.' });
      return;
    }

    const { category } = req.body;
    const sizeInMB = (req.file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = parseFloat(sizeInMB) < 0.1 
      ? `${(req.file.size / 1024).toFixed(0)} KB` 
      : `${sizeInMB} MB`;

    // The file will be available at /uploads/filename
    const fileUrl = `/uploads/${req.file.filename}`;

    const newMaterial = new Library({
      name: req.file.originalname,
      size: sizeStr,
      category: category || 'Textbooks',
      groundingCount: 0,
      fileUrl
    });

    const savedMaterial = await newMaterial.save();
    res.status(201).json(savedMaterial);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to upload library material' });
  }
};

export const deleteLibraryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const material = await Library.findById(id);
    if (!material) {
      res.status(404).json({ error: 'Library material not found.' });
      return;
    }

    // Try to delete physical file from server
    if (material.fileUrl && material.fileUrl.startsWith('/uploads/')) {
      const fileName = material.fileUrl.replace('/uploads/', '');
      const filePath = path.join(__dirname, '../../uploads', fileName);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted physical library file: ${filePath}`);
        } else {
          console.log(`Physical library file not found on disk at: ${filePath}`);
        }
      } catch (fileErr) {
        console.error(`Error deleting physical library file ${filePath}:`, fileErr);
      }
    }

    await Library.findByIdAndDelete(id);
    res.json({ message: 'Library material deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete library material' });
  }
};
