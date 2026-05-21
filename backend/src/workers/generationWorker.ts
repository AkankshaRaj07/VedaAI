import { Worker, Job } from 'bullmq';
import fs from 'fs';
import path from 'path';
import { redisConnection, checkRedisConnection } from '../config/redis';
import Assignment from '../models/Assignment';
import { generateQuestions } from '../services/ai';
import { generateAssignmentPDF } from '../services/pdfGenerator';
import { emitJobStatus } from '../services/websocket';
import { pdfQueue, registerFallbackHandler } from '../queues/generationQueue';

// Safely require pdf-parse to handle optional PDF parsing
let pdfParse: any;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse not installed yet. PDF text extraction will be bypassed.');
}

/**
 * Helper to extract text from files (txt, pdf)
 */
const extractFileContent = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath).toLowerCase();
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Uploaded file not found at path: ${filePath}`);
  }

  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8');
  } else if (ext === '.pdf') {
    if (pdfParse) {
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(dataBuffer);
      return parsed.text || '';
    } else {
      return 'PDF parser is not configured on the server. Only txt files can be parsed.';
    }
  }
  
  return '';
};

/**
 * Task handler for generating questions via Gemini AI
 */
export const processQuestionGeneration = async (job: { data: { assignmentId: string } }) => {
  const { assignmentId } = job.data;
  console.log(`[Worker] Started question generation for assignment: ${assignmentId}`);
  
  // Update WebSocket: Processing (20%)
  emitJobStatus(assignmentId, 'processing', 20);

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment with ID ${assignmentId} not found.`);
  }

  try {
    assignment.status = 'processing';
    await assignment.save();

    let fileContent = '';
    if (assignment.fileUrl) {
      // Resolve absolute path
      const absolutePath = path.join(__dirname, '../../', assignment.fileUrl);
      try {
        fileContent = await extractFileContent(absolutePath);
        console.log(`[Worker] Extracted file content length: ${fileContent.length}`);
      } catch (fileErr) {
        console.error('[Worker] Error extracting file contents:', fileErr);
        // Continue generating even if file reading fails
      }
    }

    // Update WebSocket: AI Generating (40%)
    emitJobStatus(assignmentId, 'processing', 40);

    // Call AI generation service
    const aiResponse = await generateQuestions({
      title: assignment.title,
      questionTypes: assignment.questionTypes,
      numQuestions: assignment.numQuestions,
      totalMarks: assignment.totalMarks,
      additionalInstructions: assignment.additionalInstructions,
      fileContent: fileContent || undefined
    });

    // Save generated sections to DB
    assignment.sections = aiResponse.sections;
    await assignment.save();

    // Update WebSocket: AI generation completed, queued for PDF (60%)
    emitJobStatus(assignmentId, 'processing', 60);

    // Hand off to PDF generation worker
    await pdfQueue.add(`pdf-${assignmentId}`, { assignmentId });
    console.log(`[Worker] Handed off assignment ${assignmentId} to PDF Queue.`);
    
  } catch (error: any) {
    console.error(`[Worker] AI generation failed for ${assignmentId}:`, error);
    
    assignment.status = 'failed';
    assignment.errorMessage = error.message || 'AI Generation failed';
    await assignment.save();

    emitJobStatus(assignmentId, 'failed', 100);
    throw error;
  }
};

/**
 * Task handler for generating PDF documents via PDFKit
 */
export const processPdfGeneration = async (job: { data: { assignmentId: string } }) => {
  const { assignmentId } = job.data;
  console.log(`[Worker] Started PDF generation for assignment: ${assignmentId}`);

  // Update WebSocket: Generating PDF (80%)
  emitJobStatus(assignmentId, 'processing', 80);

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment with ID ${assignmentId} not found.`);
  }

  try {
    // Call pdfkit generator
    const relativePdfUrl = await generateAssignmentPDF(assignment);
    
    // Save PDF link to DB and mark assignment as completed
    assignment.pdfUrl = relativePdfUrl;
    assignment.status = 'completed';
    await assignment.save();

    // Update WebSocket: Completed (100%)
    emitJobStatus(assignmentId, 'completed', 100, assignment);
    console.log(`[Worker] Successfully completed PDF generation for ${assignmentId}`);
    
  } catch (error: any) {
    console.error(`[Worker] PDF generation failed for ${assignmentId}:`, error);
    
    assignment.status = 'failed';
    assignment.errorMessage = error.message || 'PDF Generation failed';
    await assignment.save();

    emitJobStatus(assignmentId, 'failed', 100);
    throw error;
  }
};

export let questionWorker: Worker | null = null;
export let pdfWorker: Worker | null = null;

/**
 * Bootstraps workers. If Redis is running, starts BullMQ. Otherwise registers in-memory fallbacks.
 */
export const initWorkers = async () => {
  const isRedisActive = await checkRedisConnection();
  if (isRedisActive) {
    console.log('[Worker] Redis is active. Starting BullMQ Workers...');

    questionWorker = new Worker(
      'question-generation',
      async (job: Job) => {
        await processQuestionGeneration(job);
      },
      { connection: redisConnection }
    );

    pdfWorker = new Worker(
      'pdf-generation',
      async (job: Job) => {
        await processPdfGeneration(job);
      },
      { connection: redisConnection }
    );

    questionWorker.on('completed', (job) => {
      console.log(`[Worker Event] Question generation job ${job.id} completed successfully.`);
    });

    questionWorker.on('failed', (job, err) => {
      console.error(`[Worker Event] Question generation job ${job?.id} failed:`, err);
    });

    pdfWorker.on('completed', (job) => {
      console.log(`[Worker Event] PDF generation job ${job.id} completed successfully.`);
    });

    pdfWorker.on('failed', (job, err) => {
      console.error(`[Worker Event] PDF generation job ${job?.id} failed:`, err);
    });
  } else {
    console.log('[Worker] Redis is not running. Registering in-memory fallback workers.');
    registerFallbackHandler('question-generation', async (data: any) => {
      await processQuestionGeneration({ data });
    });
    registerFallbackHandler('pdf-generation', async (data: any) => {
      await processPdfGeneration({ data });
    });
  }
};
