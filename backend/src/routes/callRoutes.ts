import { Router } from 'express';
import {
  handleStartCall,
  handleGetCallById,
  handleGetCompanyCalls,
  handleUpdateCall,
  handleEndCall,
} from '../controllers/callController.js';

const router = Router();

router.post('/start', handleStartCall);
router.post('/end', handleEndCall);
router.post('/:callId/end', handleEndCall);
router.get('/', handleGetCompanyCalls);
router.get('/:callId', handleGetCallById);
router.patch('/:callId', handleUpdateCall);
router.put('/:callId', handleUpdateCall);

export default router;
