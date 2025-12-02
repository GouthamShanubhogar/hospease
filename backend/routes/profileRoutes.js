import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserActivity
} from '../controllers/profileController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * Profile Routes
 * All routes require authentication
 */

// GET /api/profile/:userId - Get user profile
router.get('/:userId', verifyToken, getUserProfile);

// PUT /api/profile/:userId - Update user profile  
router.put('/:userId', verifyToken, updateUserProfile);

// PATCH /api/profile/:userId/password - Change password
router.patch('/:userId/password', verifyToken, changePassword);

// GET /api/profile/:userId/activity - Get user activity log
router.get('/:userId/activity', verifyToken, getUserActivity);

export default router;