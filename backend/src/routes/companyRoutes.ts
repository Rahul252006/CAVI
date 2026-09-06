import { Router } from 'express';
import {
  handleGetCompanies,
  handleGetCompanyById,
  handleRegisterCompany,
  handleGetBrain,
  handleUpdateBrainConfig,
  handleGetKnowledgeDocs,
  handleAddKnowledge,
  handleDeleteKnowledge,
  handleGetKnowledgeGaps,
  handleDeleteKnowledgeGap,
  handleSaveTool,
  handleGetCompanyOverview,
  handleUpdateCompanyOverview,
  handleGetBillingInvoices,
  handleClearDatabase,
} from '../controllers/companyController.js';
import { handleAdminLogin, handleAdminSignup } from '../controllers/authController.js';
import { handleGetCompanyCalls } from '../controllers/callController.js';

const router = Router();

router.post('/login', handleAdminLogin);
router.post('/signup', handleAdminSignup);

router.get('/', handleGetCompanies);
router.post('/', handleRegisterCompany);
router.post('/register', handleRegisterCompany);
router.post('/onboard', handleRegisterCompany);
router.get('/overview', handleGetCompanyOverview);
router.patch('/overview', handleUpdateCompanyOverview);
router.get('/calls', handleGetCompanyCalls);
router.get('/knowledge', handleGetKnowledgeDocs);
router.post('/knowledge', handleAddKnowledge);
router.delete('/knowledge', handleDeleteKnowledge);
router.delete('/knowledge/:id', handleDeleteKnowledge);
router.get('/knowledge-gaps', handleGetKnowledgeGaps);
router.delete('/knowledge-gaps', handleDeleteKnowledgeGap);
router.delete('/knowledge-gaps/:id', handleDeleteKnowledgeGap);
router.get('/billing', handleGetBillingInvoices);
router.delete('/clear-all-data', handleClearDatabase);
router.post('/clear-all-data', handleClearDatabase);

router.get('/:companyId', handleGetCompanyById);
router.get('/:companyId/overview', handleGetCompanyOverview);
router.patch('/:companyId/overview', handleUpdateCompanyOverview);
router.get('/:companyId/calls', handleGetCompanyCalls);
router.get('/:companyId/brain', handleGetBrain);
router.get('/:companyId/config', handleGetBrain);
router.post('/:companyId/config', handleUpdateBrainConfig);
router.put('/:companyId/config', handleUpdateBrainConfig);
router.get('/:companyId/knowledge', handleGetKnowledgeDocs);
router.post('/:companyId/knowledge', handleAddKnowledge);
router.delete('/:companyId/knowledge/:id', handleDeleteKnowledge);
router.get('/:companyId/knowledge-gaps', handleGetKnowledgeGaps);
router.delete('/:companyId/knowledge-gaps/:id', handleDeleteKnowledgeGap);
router.get('/:companyId/billing', handleGetBillingInvoices);
router.post('/:companyId/tools', handleSaveTool);

export default router;


