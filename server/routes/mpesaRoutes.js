import express, { response } from "express";
import { stkPush } from "../services/darajaServices.js";
import { getAccessToken } from "../services/darajaServices.js";
import { initiateStkPush } from "../controllers/mpesaController.js";
const router = express.Router();

router.post("/stkpush", initiateStkPush);

router.get('/health',(req, res)=>{
    res.json({
        message: "The server is healthy"
    })
})


export default router; 