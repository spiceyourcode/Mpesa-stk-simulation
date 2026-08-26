import pool from "../db/db.js";

export async function checkDatabaseStatus(req, res){
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
}