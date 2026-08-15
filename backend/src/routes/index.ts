import { Router } from "express";
import accountsRouter from './accounts.routes.js'
import syncRouter from './sync.routes.js';
import profileRouter from './profile.routes.js';
const router = Router();

router.use('/accounts', accountsRouter);
router.use('/sync', syncRouter);
router.use('/profile', profileRouter);

export default router;