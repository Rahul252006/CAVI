import { Router } from 'express';
import { handleRefund, handleLookup, handleAnalyze } from '../controllers/actionController.js';

const router = Router();

router.post('/refund', handleRefund);
router.post('/lookup', handleLookup);
router.post('/transaction-status', handleLookup);
router.post('/analyze', handleAnalyze);

export default router;
