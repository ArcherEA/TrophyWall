import { Router } from 'express';
import { getProfile } from '../controllers/profile.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(getProfile));
export default router;
