import pool from "../db/db.js";
import { stkPush } from "../services/darajaServices.js";

export async function initiateStkPush(req, res) {
    try {
        const { amount, phoneNumber, accountReference, transactionDescription } =
            req.body;
        const result = await stkPush({
            amount,
            phoneNumber,
            accountReference,
            transactionDescription,
        });

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error(error.response?.data || error.message);

        res.status(500).json({
            success: false,
            message: "STK Push Failed",
            error: error.response?.data || error.message,
        });
    }
}

export async function handleStkCallback(req, res) {
    try {
        const callback = req.body?.Body?.stkCallback;

        if (!callback) {
            return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
        }

        const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;  
     
        const mpesaReceiptNumber = CallbackMetadata?.Item?.find(
            (item)=>item.Name === "MpesaReceiptNumber"
        )?.Value ?? null;
    
        const phoneNumber = CallbackMetadata?.Item?.find(
            (item)=>item.Name === "PhoneNumber"
        )?.Value ?? null; 

        const status = Number(ResultCode) === 0 ? "PAID" : "FAILED";

        await pool.execute(
            `
            UPDATE orders
            SET status = ?,
                result_code = ?,
                result_description = ?,
                mpesa_receipt= ?,
                phone_number = ?
            WHERE checkout_request_id = ?
            `,
            [status, String(ResultCode), ResultDesc, mpesaReceiptNumber, phoneNumber, CheckoutRequestID]
        );

        console.log("STK callback processed:", {
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            status,
        });
    } catch (error) {
        console.error("STK callback error:", error.message);
    }

    return res.status(200).json({
        ResultCode: 0,
        ResultDesc: "Accepted",
    });
}
