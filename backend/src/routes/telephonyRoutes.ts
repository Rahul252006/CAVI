import { Router } from 'express';
import {
  handleTelephonyInbound,
  handleTelephonyOutbound,
  handleTelephonyStatus,
} from '../controllers/telephonyController.js';

const router = Router();

router.post('/inbound', handleTelephonyInbound);
router.post('/outbound', handleTelephonyOutbound);
router.post('/status', handleTelephonyStatus);

export default router;
