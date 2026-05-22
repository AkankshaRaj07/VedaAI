import { Request, Response } from 'express';
import Submission from '../models/Submission';
import Assignment from '../models/Assignment';
import { gradeAnswers, GradeInput } from '../services/ai';

/**
 * Save student answers and create a new submission record
 */
export const submitQuizAnswers = async (req: Request, res: Response) => {
  try {
    const { assignmentId, studentName, rollNumber, section, answers } = req.body;

    if (!assignmentId || !studentName || !rollNumber || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Missing required submission fields (assignmentId, studentName, rollNumber, answers).' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    // Compute basic totalMaxMarks and copy correctAnswer if available
    let totalMaxMarks = 0;
    const formattedAnswers = answers.map((ans: any) => {
      totalMaxMarks += Number(ans.maxMarks) || 0;
      return {
        questionId: ans.questionId,
        questionText: ans.questionText,
        studentAnswer: ans.studentAnswer || '',
        correctAnswer: ans.correctAnswer || '',
        maxMarks: Number(ans.maxMarks) || 0,
        marksObtained: 0, // Will be filled by grader
        feedback: ''
      };
    });

    const submission = new Submission({
      assignmentId,
      studentName,
      rollNumber,
      section,
      answers: formattedAnswers,
      totalMaxMarks,
      totalScore: 0,
      status: 'pending'
    });

    await submission.save();
    console.log(`[API] Saved quiz submission ${submission._id} for student ${studentName}`);

    res.status(201).json(submission);
  } catch (error: any) {
    console.error('Error saving submission:', error);
    res.status(500).json({ error: error.message || 'Server error saving submission.' });
  }
};

/**
 * Grade a student's submission using the Gemini auto-grading service
 */
export const gradeSubmissionWithAI = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment associated with this submission not found.' });
    }

    // Format inputs for the AI grading service
    const answersToGrade: GradeInput[] = submission.answers.map((ans) => ({
      questionId: ans.questionId,
      questionText: ans.questionText,
      studentAnswer: ans.studentAnswer,
      correctAnswer: ans.correctAnswer,
      maxMarks: ans.maxMarks
    }));

    console.log(`[API] Calling Gemini to grade submission ${submission._id} (${submission.studentName})...`);
    const grades = await gradeAnswers(assignment.title, answersToGrade);

    // Map AI grades back into the submission answers array
    let totalScore = 0;
    submission.answers.forEach((ans) => {
      const graded = grades.find((g: any) => g.questionId === ans.questionId);
      if (graded) {
        ans.marksObtained = graded.marksObtained;
        ans.feedback = graded.feedback;
      } else {
        ans.marksObtained = 0;
        ans.feedback = 'Could not evaluate this response automatically.';
      }
      totalScore += ans.marksObtained || 0;
    });

    submission.totalScore = totalScore;
    submission.status = 'graded';
    submission.gradedAt = new Date();

    await submission.save();
    console.log(`[API] Submission ${submission._id} graded successfully. Score: ${totalScore}/${submission.totalMaxMarks}`);

    res.json(submission);
  } catch (error: any) {
    console.error('Error grading submission with AI:', error);
    
    // Set status to failed but save so it shows error
    try {
      const submission = await Submission.findById(req.params.id);
      if (submission) {
        submission.status = 'failed';
        await submission.save();
      }
    } catch (saveErr) {
      console.error('Failed to update submission failure status:', saveErr);
    }

    res.status(500).json({ error: error.message || 'Server error auto-grading submission.' });
  }
};

/**
 * List all submissions for a given assignment
 */
export const listSubmissionsForAssignment = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await Submission.find({ assignmentId }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error: any) {
    console.error('Error listing submissions:', error);
    res.status(500).json({ error: error.message || 'Server error listing submissions.' });
  }
};

/**
 * Fetch a single submission by its ID
 */
export const getSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }
    res.json(submission);
  } catch (error: any) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({ error: error.message || 'Server error fetching submission.' });
  }
};
