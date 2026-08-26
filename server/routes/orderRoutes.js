import { Router } from "express";
import { createOrder } from "../controllers/orderControler.js";

const router = Router();

router.post('/', createOrder);

export default router;