import { Router } from "express";
import { initiateStkPush, handleStkCallback } from "../controllers/mpesaController.js";

const router = Router();

router.post("/stkpush", initiateStkPush);
router.post("/callback", handleStkCallback);

router.get('/health',(req, res)=>{
    res.json({
        message: "The server is healthy"
    })
})


export default router; 