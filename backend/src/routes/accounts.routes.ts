import { Router } from 'express';
import { linkAccount, switchAccount, listAccounts } from '../controllers/account.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(listAccounts));
router.post('/link', asyncHandler(linkAccount));
router.post('/switch', asyncHandler(switchAccount));
export default router;
