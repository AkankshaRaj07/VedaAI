import express from 'express';
import { 
  buildLessonPlan, 
  buildQuestionBank, 
  buildFeedbackRemarks 
} from '../controllers/toolkitController';

const router = express.Router();

router.post('/lesson-plan', buildLessonPlan);
router.post('/question-bank', buildQuestionBank);
router.post('/feedback', buildFeedbackRemarks);

export default router;
