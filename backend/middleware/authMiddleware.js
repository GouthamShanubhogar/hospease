import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      status: "error",
      message: "No token provided" 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is about to expire (within 5 minutes)
    const tokenExp = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (tokenExp - now <= fiveMinutes) {
      // Generate new token
      const newToken = jwt.sign(
        { user_id: decoded.user_id, role: decoded.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      
      // Send new token in response header
      res.setHeader('X-New-Token', newToken);
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ 
      status: "error",
      message: "Invalid or expired token" 
    });
  }
};
