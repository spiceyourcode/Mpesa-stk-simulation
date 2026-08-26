import express, { response } from "express";
import { getAccessToken, stkPush } from "../services/darajaServices.js";

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
