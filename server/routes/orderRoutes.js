import { Router } from "express";
import { createOrder, getOrder } from "../controllers/orderControler.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post('/', requireAuth, createOrder);
router.get('/:id', requireAuth, getOrder);

export default router;