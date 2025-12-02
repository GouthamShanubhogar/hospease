import express from 'express';
import {
  getUserSettings,
  updateUserSettings,
  updateSecuritySettings,
  getUserDevices,
  registerDevice,
  logoutDevice,
  logoutAllDevices
} from '../controllers/settingsController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * Settings Routes
 * All routes require authentication
 */

// GET /api/settings/:userId - Get user settings
router.get('/:userId', verifyToken, getUserSettings);

// PUT /api/settings/:userId - Update user settings
router.put('/:userId', verifyToken, updateUserSettings);

// PATCH /api/settings/:userId/security - Update security settings
router.patch('/:userId/security', verifyToken, updateSecuritySettings);

// GET /api/settings/:userId/devices - Get user devices
router.get('/:userId/devices', verifyToken, getUserDevices);

// POST /api/settings/:userId/devices - Register new device
router.post('/:userId/devices', verifyToken, registerDevice);

// POST /api/settings/:userId/devices/logout - Logout from specific device
router.post('/:userId/devices/logout', verifyToken, logoutDevice);

// POST /api/settings/:userId/devices/logout-all - Logout from all devices
router.post('/:userId/devices/logout-all', verifyToken, logoutAllDevices);

export default router;