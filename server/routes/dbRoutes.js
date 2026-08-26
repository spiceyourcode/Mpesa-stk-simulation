import { checkDatabaseStatus } from "../controllers/dbControllers.js";
import express from "express";

const router = express.Router();

router.get('/', checkDatabaseStatus);

export default router