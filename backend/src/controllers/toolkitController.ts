import { Request, Response } from 'express';
import { 
  generateLessonPlan, 
  generateQuestionBank, 
  generateFeedbackRemarks 
} from '../services/ai';

export const buildLessonPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { grade, subject, topic, learningObjectives, duration } = req.body;
    if (!topic || !grade || !subject) {
      res.status(400).json({ error: 'Grade, Subject, and Topic are required fields.' });
      return;
    }

    const durationNum = parseInt(duration) || 60;
    const output = await generateLessonPlan({
      grade,
      subject,
      topic,
      learningObjectives: learningObjectives || '',
      duration: durationNum
    });

    res.json({ output });
  } catch (error: any) {
    console.error('Lesson Plan creation failed:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Lesson Plan' });
  }
};

export const buildQuestionBank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, count, difficulty } = req.body;
    if (!topic) {
      res.status(400).json({ error: 'Topic is a required field.' });
      return;
    }

    const countNum = parseInt(count) || 3;
    const output = await generateQuestionBank({
      topic,
      count: countNum,
      difficulty: difficulty || 'Medium'
    });

    res.json({ output });
  } catch (error: any) {
    console.error('Question Bank creation failed:', error);
    res.status(500).json({ error: error.message || 'Failed to build Question Bank' });
  }
};

export const buildFeedbackRemarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentName, tone, draftObservations } = req.body;
    if (!studentName || !draftObservations) {
      res.status(400).json({ error: 'Student Name and Draft Observations are required fields.' });
      return;
    }

    const output = await generateFeedbackRemarks({
      studentName,
      tone: tone || 'Constructive',
      draftObservations
    });

    res.json({ output });
  } catch (error: any) {
    console.error('Feedback Remarks generation failed:', error);
    res.status(500).json({ error: error.message || 'Failed to enhance remarks' });
  }
};
