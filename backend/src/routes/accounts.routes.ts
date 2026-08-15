import { Router } from "express";
import { linkAccount } from "../controllers/account.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.post('/link', asyncHandler(linkAccount));

export default router;