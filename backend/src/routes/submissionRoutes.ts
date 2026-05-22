import express from 'express';
import {
  submitQuizAnswers,
  gradeSubmissionWithAI,
  listSubmissionsForAssignment,
  getSubmission
} from '../controllers/submissionController';

const router = express.Router();

router.post('/', submitQuizAnswers);
router.post('/:id/grade', gradeSubmissionWithAI);
router.get('/assignment/:assignmentId', listSubmissionsForAssignment);
router.get('/:id', getSubmission);

export default router;
