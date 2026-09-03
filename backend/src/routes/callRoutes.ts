import { Router } from 'express';
import {
  handleStartCall,
  handleGetCallById,
  handleGetCompanyCalls,
  handleUpdateCall,
} from '../controllers/callController.js';

const router = Router();

router.post('/start', handleStartCall);
router.get('/', handleGetCompanyCalls);
router.get('/:callId', handleGetCallById);
router.patch('/:callId', handleUpdateCall);
router.put('/:callId', handleUpdateCall);

export default router;
