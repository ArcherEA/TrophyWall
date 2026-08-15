import { Router } from "express";
import accountsRouter from './accounts.routes.js'
import syncRouter from './sync.routes.js';
const router = Router();

router.use('/accounts', accountsRouter);
router.use('/sync', syncRouter);

export default router;