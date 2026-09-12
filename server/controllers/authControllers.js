import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/db.js";

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export async function register(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `
      INSERT INTO users (email, password_hash)
      VALUES (?, ?)
      `,
      [email, passwordHash]
    );

    const user = { id: result.insertId, email };
    const token = signToken(user);

    return res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email Already Registered",
      });
    }

    console.error("Register Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not register",
    });
  }
}

export async function login(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT id, email, password_hash
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken({ id: user.id, email: user.email });

    return res.status(200).json({
      success: true,
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not log in",
    });
  }
}
