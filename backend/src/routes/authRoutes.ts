import { Router } from 'express';
import {
  handleAdminSignup,
  handleAdminLogin,
  handleAgentRegister,
  handleAgentLogin,
} from '../controllers/authController.js';

const router = Router();

router.post('/admin/signup', handleAdminSignup);
router.post('/admin/login', handleAdminLogin);
router.post('/agent/register', handleAgentRegister);
router.post('/agent/login', handleAgentLogin);

export default router;
