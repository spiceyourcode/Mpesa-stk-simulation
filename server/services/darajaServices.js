import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function getAccessToken() {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    const credentials = Buffer.from(
        `${consumerKey}:${consumerSecret}`
    ).toString("base64");

    const response = await axios.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        }
    );
    return {
        access_token:response.data.access_token,
        expires_in:response.data.expires_in,
    };
}
export function generateTimeStamp(){
    const now = new Date();
    const eat = new Date(
        now.toLocaleString('en-US', {
            timeZone: 'Africa/Nairobi'
        })
    )
    const year = eat.getFullYear()
    const month = String(eat.getMonth() + 1).padStart(2, '0')
    const day = String(eat.getDate()).padStart(2, '0')
    const hours = String(eat.getHours()).padStart(2, '0')
    const minutes = String(eat.getMinutes()).padStart(2, '0')
    const seconds = String(eat.getSeconds()).padStart(2, '0')

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function generatePassword(timestamp){
    const shortcode = process.env.MPESA_SHORTCODE; 
    const passkey = process.env.MPESA_PASSKEY;

    const password = Buffer.from(
        `${shortcode}${passkey}${timestamp}`
    ).toString("base64");

    return password;
}

export async function stkPush({
    amount, 
    phoneNumber, 
    accountReference, 
    transactionDescription,  
}){
    const { access_token } = await getAccessToken();
    const timestamp = generateTimeStamp();
    const password = generatePassword(timestamp);
    const shortcode = process.env.MPESA_SHORTCODE;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDescription,
    };

    const response = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        payload, 
        {
            headers:{
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json"
            },
        },
    );
    return response.data
}