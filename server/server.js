import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getAccessToken } from "./services/darajaServices.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
    res.json({
        message:"Mpesa STK server is running"
    })
})
app.get('/api/test-token', async (req, res) =>{
    try {
        // set the response from the function to the 'token'
        // const token = await getAccessToken();'
        const { access_token, expires_in} = await getAccessToken()
        res.json({
            success: true, 
            message: "successfully authenticated with Daraja",
            accessToken : access_token,
            expires_in : expires_in
        });
    } catch (error) {
        console.error(
            // optional chaining
            error.response?.data || error.message 
        );
        
        res.status(500).json({
            success: false,
            message: "could not authenticate with Daraja"
        });
    }
});
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});