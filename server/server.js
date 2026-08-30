import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from 'morgan';
import helmet from 'helmet';

import mpesaRoutes from "./routes/mpesaRoutes.js";
import dbRoutes from "./routes/dbRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"

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
app.use("/api/test-db", dbRoutes )
app.use("/api/order", orderRoutes)

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
}); 