import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function requireAuth(req, res, next){
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if(scheme !== "Bearer" || !token){
        return res.status(401).json({
            success:false,
            message:"Login required!",
        });
    }

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {id:payload.id, email:payload.email};
        next();
    }catch{
        return res.status(401).json({
            success:false, 
            message:"Invalid or expired token"
        });
    }
}