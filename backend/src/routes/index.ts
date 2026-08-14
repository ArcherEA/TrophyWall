import { Router } from "express";
import accountsRouter from './accounts.routes.js'
const router = Router();

router.use('/accounts', accountsRouter);

export default router;