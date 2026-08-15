import { Router } from 'express';
import { syncSteam, syncStatus } from '../controllers/sync.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.post('/steam', asyncHandler(syncSteam));         // enqueue
router.get('/steam/:jobId', asyncHandler(syncStatus));  // poll progress
export default router;