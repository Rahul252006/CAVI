import { Router } from 'express';
import {
  handleGetCases,
  handleGetCaseById,
  handleCreateCase,
  handleUpdateCase,
} from '../controllers/caseController.js';

const router = Router();

router.get('/', handleGetCases);
router.get('/list', handleGetCases);
router.post('/create', handleCreateCase);
router.post('/', handleCreateCase);
router.get('/:caseId', handleGetCaseById);
router.patch('/:caseId', handleUpdateCase);
router.put('/:caseId', handleUpdateCase);

export default router;

