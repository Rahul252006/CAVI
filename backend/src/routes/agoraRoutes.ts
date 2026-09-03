import { Router } from 'express';
import {
  handleGenerateToken,
  handleInviteAgent,
  handleGetAgentPrompt,
  handleAgoraWebhook,
} from '../controllers/agoraController.js';

const router = Router();

router.post('/token', handleGenerateToken);
router.post('/generate-token', handleGenerateToken);
router.post('/invite-agent', handleInviteAgent);
router.get('/prompt/:companyId', handleGetAgentPrompt);
router.post('/webhook', handleAgoraWebhook);

export default router;
