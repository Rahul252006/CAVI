import { Router } from 'express';
import {
  handleGetCompanies,
  handleGetCompanyById,
  handleRegisterCompany,
  handleGetBrain,
  handleUpdateBrainConfig,
  handleAddKnowledge,
  handleDeleteKnowledge,
  handleSaveTool,
  handleGetCompanyOverview,
} from '../controllers/companyController.js';

const router = Router();

router.get('/', handleGetCompanies);
router.post('/', handleRegisterCompany);
router.post('/register', handleRegisterCompany);
router.post('/onboard', handleRegisterCompany);
router.get('/:companyId', handleGetCompanyById);
router.get('/:companyId/overview', handleGetCompanyOverview);
router.get('/:companyId/brain', handleGetBrain);
router.get('/:companyId/config', handleGetBrain);
router.post('/:companyId/config', handleUpdateBrainConfig);
router.put('/:companyId/config', handleUpdateBrainConfig);
router.post('/:companyId/knowledge', handleAddKnowledge);
router.delete('/:companyId/knowledge/:id', handleDeleteKnowledge);
router.post('/:companyId/tools', handleSaveTool);

export default router;
