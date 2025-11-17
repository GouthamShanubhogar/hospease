import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// 🧾 Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Input validation
    const errors = [];
    if (!name || name.trim().length < 2) errors.push("Name must be at least 2 characters long");
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.push("Invalid email format");
    if (!password || password.length < 8) errors.push("Password must be at least 8 characters long");
    if (password && !password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/)) {
      errors.push("Password must contain at least one uppercase letter, one lowercase letter, and one number");
    }
    if (phone && !phone.match(/^\+?[\d\s-]{10,}$/)) errors.push("Invalid phone number format");
    if (role && !["patient", "doctor", "admin"].includes(role)) errors.push("Invalid role");

    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        errors,
        message: "Validation failed"
      });
    }

    // Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "User with this email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, phone || null, role || "patient"]
    );

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error("❌ Error in registerUser:", {
      error: err.message,
      stack: err.stack,
      context: { email }
    });
    res.status(500).json({
      status: "error",
      message: "An error occurred while registering user",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// 🔐 Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    const errors = [];
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.push("Invalid email format");
    if (!password) errors.push("Password is required");
    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        errors,
        message: "Validation failed"
      });
    }

    // Check if user exists
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }

    const user = userResult.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { user_id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      status: "success",
      message: "Login successful",
      token,
      user: {
        user_id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Error in loginUser:", {
      error: err.message,
      stack: err.stack,
      context: { email }
    });
    res.status(500).json({
      status: "error",
      message: "An error occurred while logging in",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};
