import express from 'express';
import { 
  getStats, 
  getTasks, 
  createTask, 
  toggleTask, 
  deleteTask 
} from '../controllers/dashboardController';

const router = express.Router();

router.get('/stats', getStats);
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id/toggle', toggleTask);
router.delete('/tasks/:id', deleteTask);

export default router;
