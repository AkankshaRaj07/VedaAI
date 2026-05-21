import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Assignment from '../models/Assignment';
import { questionQueue, pdfQueue } from '../queues/generationQueue';
import { emitJobStatus } from '../services/websocket';

/**
 * Create a new assignment and queue it for AI generation
 */
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const { title, dueDate, questionTypes, numQuestions, totalMarks, additionalInstructions } = req.body;

    // Simple validations
    if (!title || !dueDate || !questionTypes || !numQuestions || !totalMarks) {
      return res.status(400).json({ error: 'All fields (title, dueDate, questionTypes, numQuestions, totalMarks) are required.' });
    }

    const parsedNumQuestions = parseInt(numQuestions);
    const parsedTotalMarks = parseInt(totalMarks);

    if (isNaN(parsedNumQuestions) || parsedNumQuestions <= 0) {
      return res.status(400).json({ error: 'Number of questions must be a positive integer.' });
    }
    if (isNaN(parsedTotalMarks) || parsedTotalMarks <= 0) {
      return res.status(400).json({ error: 'Total marks must be a positive integer.' });
    }

    // Handle file upload relative paths
    let fileUrl = undefined;
    let fileName = undefined;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
    }

    // Split and parse question types array if it was sent as string/comma-separated (standard form-data upload)
    let parsedQuestionTypes: string[] = [];
    if (typeof questionTypes === 'string') {
      parsedQuestionTypes = questionTypes.split(',').map((t) => t.trim());
    } else if (Array.isArray(questionTypes)) {
      parsedQuestionTypes = questionTypes;
    }

    // Save initial document in DB
    const assignment = new Assignment({
      title,
      dueDate: new Date(dueDate),
      questionTypes: parsedQuestionTypes,
      numQuestions: parsedNumQuestions,
      totalMarks: parsedTotalMarks,
      additionalInstructions,
      fileUrl,
      fileName,
      status: 'pending',
      sections: []
    });

    await assignment.save();

    // Push task into BullMQ
    const job = await questionQueue.add(`generate-${assignment._id}`, {
      assignmentId: assignment._id.toString()
    });

    console.log(`[API] Created assignment ${assignment._id} and queued job: ${job.id}`);

    res.status(201).json(assignment);
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: error.message || 'Server error occurred while creating assignment.' });
  }
};

/**
 * Get a single assignment detail
 */
export const getAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }
    res.json(assignment);
  } catch (error: any) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: error.message || 'Server error fetching assignment.' });
  }
};

/**
 * List all assignments
 */
export const listAssignments = async (req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error: any) {
    console.error('Error listing assignments:', error);
    res.status(500).json({ error: error.message || 'Server error listing assignments.' });
  }
};

/**
 * Re-trigger question generation
 */
export const regenerateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    // Clean old files if present
    if (assignment.pdfUrl) {
      const oldPdfPath = path.join(__dirname, '../../', assignment.pdfUrl);
      if (fs.existsSync(oldPdfPath)) {
        fs.unlinkSync(oldPdfPath);
      }
    }

    assignment.status = 'pending';
    assignment.sections = [];
    assignment.pdfUrl = undefined;
    assignment.errorMessage = undefined;
    await assignment.save();

    // Trigger queue job again
    await questionQueue.add(`regenerate-${assignment._id}`, {
      assignmentId: assignment._id.toString()
    });

    // Notify listeners via Websockets
    emitJobStatus(assignment._id.toString(), 'pending', 0);

    res.json(assignment);
  } catch (error: any) {
    console.error('Error regenerating assignment:', error);
    res.status(500).json({ error: error.message || 'Server error regenerating assignment.' });
  }
};

/**
 * Update assignment questions directly (inline edits) and rebuild PDF
 */
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sections, title, dueDate } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    if (title) assignment.title = title;
    if (dueDate) assignment.dueDate = new Date(dueDate);
    if (sections) assignment.sections = sections;

    // Save details
    await assignment.save();

    // Trigger PDF compilation job in BullMQ to rebuild PDF layout
    assignment.status = 'processing';
    await assignment.save();
    
    await pdfQueue.add(`pdf-rebuild-${assignment._id}`, {
      assignmentId: assignment._id.toString()
    });

    emitJobStatus(assignment._id.toString(), 'processing', 75);

    res.json(assignment);
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: error.message || 'Server error updating assignment.' });
  }
};

/**
 * Delete a single assignment and clean up its files
 */
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    // Clean old files if present
    if (assignment.pdfUrl) {
      const pdfPath = path.join(__dirname, '../../', assignment.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        try {
          fs.unlinkSync(pdfPath);
        } catch (err) {
          console.error(`Error deleting PDF file: ${pdfPath}`, err);
        }
      }
    }

    if (assignment.fileUrl) {
      const filePath = path.join(__dirname, '../../', assignment.fileUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Error deleting grounding file: ${filePath}`, err);
        }
      }
    }

    await Assignment.findByIdAndDelete(id);
    console.log(`[API] Deleted assignment ${id}`);
    res.json({ message: 'Assignment deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: error.message || 'Server error deleting assignment.' });
  }
};
