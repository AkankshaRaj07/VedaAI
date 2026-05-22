import express from 'express';
import { 
  listGroups, 
  createGroup, 
  deleteGroup 
} from '../controllers/groupController';

const router = express.Router();

router.get('/', listGroups);
router.post('/', createGroup);
router.delete('/:id', deleteGroup);

export default router;
