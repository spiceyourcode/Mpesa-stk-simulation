import pool from "../db/db.js";
import { stkPush } from "../services/darajaServices.js";

export async function createOrder(req, res) {
  try {
    const { amount, phoneNumber } = req.body;

    // Validate required fields
    if (amount === undefined || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Amount and phone number are required",
      });
    }

    // Validate amount
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid positive number",
      });
    }

    // Create order first
    const [result] = await pool.execute(
      `
      INSERT INTO orders (
        amount,
        phone_number,
        status
      )
      VALUES (?, ?, 'PENDING')
      `,
      [numericAmount, phoneNumber]
    );

    const orderId = result.insertId;

    try {
      // Initiate M-Pesa STK Push
      const mpesaResponse = await stkPush({
        amount: numericAmount,
        phoneNumber,
        accountReference: `ORDER-${orderId}`,
        transactionDescription: `Payment for order ${orderId}`,
      });

      const { MerchantRequestID, CheckoutRequestID, ResponseCode } = mpesaResponse;
      await pool.execute(
        `
        UPDATE orders
        SET merchant_request_id = ?,
            checkout_request_id = ?,
            result_code = ?
        WHERE id = ?
        `,
        [MerchantRequestID, CheckoutRequestID, ResponseCode, orderId]
      );

      return res.status(201).json({
        success: true,

        order: {
          id: orderId,
          amount: numericAmount,
          phoneNumber,
          status: "PENDING",
        },

        mpesa: mpesaResponse,
      });
    } catch (mpesaError) {
      console.error(
        "M-Pesa STK Push failed:",
        mpesaError.response?.data || mpesaError.message
      );

      // Mark order as failed if STK initiation fails
      await pool.execute(
        `
        UPDATE orders
        SET status = 'FAILED'
        WHERE id = ?
        `,
        [orderId]
      );

      return res.status(502).json({
        success: false,
        message: "Order created, but M-Pesa payment could not be initiated",
        orderId,
      });
    }
  } catch (error) {
    console.error(
      "Create order error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Could not create order",
    });
  }
}

export async function getOrder(req, res){
  try{
    const {id} = req.params; 
    const [rows] = await pool.execute(
      `
      SELECT id, amount, phone_number, status, mpesa_receipt, result_description
      FROM orders 
      WHERE id = ?      
      `,
      [id]
    );
    if(!rows.length){
    return res.status(404).json({
      success:false,
      message: "Order not found"
    });
    }
    return res.status(200).json({
      success:true,
      order: rows[0]
    });
  }
  catch(error){
    console.error(
      "Get Order Error",
      error.response?.data || error.message
    )
    return res.status(500).json({
      success:false,
      message: "Database connection failed"
    })
  }
  
}