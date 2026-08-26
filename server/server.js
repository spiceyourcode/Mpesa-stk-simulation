import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getAccessToken, generatePassword } from "./services/darajaServices.js";
import mpesaRoutes from "./routes/mpesaRoutes.js";
import pool from "./db/db.js"; 
import morgan from 'morgan';
import helmet from 'helmet';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(morgan('dev'));

app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
    res.json({
        message:"Mpesa STK server is running"
    })
})

app.use("/api/mpesa", mpesaRoutes);

app.get("/api/test-db", async(req, res)=>{
    try{
        const[rows]= await pool.query("SELECT 1 AS result");
        res.json({
            success:true, 
            data:rows,
        });
    }
    catch(error){
        console.error(error)
    }
})

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});