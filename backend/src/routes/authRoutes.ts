import { Router } from 'express';
import {
  handleAdminSignup,
  handleAdminLogin,
  handleAgentRegister,
  handleAgentLogin,
  handleUpdateAgent,
  handleRemoveAgent,
} from '../controllers/authController.js';

const router = Router();

router.post('/admin/signup', handleAdminSignup);
router.post('/signup', handleAdminSignup);
router.post('/admin/login', handleAdminLogin);
router.post('/login', handleAdminLogin);

router.get('/agents', handleAgentRegister);
router.get('/agent/register', handleAgentRegister);
router.post('/agents', handleAgentRegister);
router.post('/agent/register', handleAgentRegister);
router.patch('/agent/:agentId', handleUpdateAgent);
router.put('/agent/:agentId', handleUpdateAgent);
router.patch('/agents/:agentId', handleUpdateAgent);
router.put('/agents/:agentId', handleUpdateAgent);
router.post('/agent/:agentId/remove', handleRemoveAgent);
router.delete('/agent/:agentId', handleRemoveAgent);
router.post('/agents/:agentId/remove', handleRemoveAgent);
router.delete('/agents/:agentId', handleRemoveAgent);

router.post('/agent/login', handleAgentLogin);

export default router;
