import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple patient registration endpoint for testing
app.post("/api/patients/register", async (req, res) => {
  try {
    console.log('Patient registration request:', req.body);
    
    const { name, email, phone, date_of_birth, gender } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !date_of_birth || !gender) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, phone, date of birth, and gender are required' 
      });
    }
    
    // For now, return a mock response
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        id: Math.floor(Math.random() * 1000),
        name,
        email,
        phone
      }
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating patient', 
      error: error.message 
    });
  }
});

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("🏥 HospEase API is running...");
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👉 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});