import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getAccessToken, generatePassword } from "./services/darajaServices.js";
import mpesaRoutes from "./routes/mpesaRoutes.js";
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

app.use("/api/mpesa", mpesaRoutes);

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});