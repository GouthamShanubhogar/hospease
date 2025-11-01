import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/verify", verifyToken, (req, res) => {
  res.json({ 
    status: "success", 
    message: "Token is valid",
    user: req.user
  });
});

export default router;
