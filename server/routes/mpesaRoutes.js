import express, { response } from "express";
import { stkPush } from "../services/darajaServices.js";
import { getAccessToken } from "../services/darajaServices.js";
const router = express.Router();

router.post("/stkpush", async(req, res)=>{
    try{
        const {
            amount,
            phoneNumber,
            accountReference, 
            transactionDescription,
        } = req.body;
        
        const result = await stkPush({
            amount,
            phoneNumber,
            accountReference, 
            transactionDescription,
        });
        res.json({
            sucess:true,
            data:result
        });
    }catch(error){
        console.error(
            error.response?.data || error.message
        );

        res.status(500).json({
            success:false,
            message:"STK Push failed",
            error: error.response?.data || error.message,
        });
    }
});
router.get('/health',(req, res)=>{
    res.json({
        message: "The server is healthy"
    })
})


export default router; 