import express from 'express';
import { 
  getDashboardSummary, 
  getRevenueStats, 
  getAdmissionsStats,
  getRecentActivity,
  getUpcomingAppointments
} from '../controllers/dashboardController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(verifyToken);

// Get dashboard summary (patients, appointments, beds, staff)
router.get('/summary', getDashboardSummary);

// Get revenue statistics
router.get('/revenue', getRevenueStats);

// Get admissions statistics
router.get('/admissions', getAdmissionsStats);

// Get recent activity
router.get('/activity', getRecentActivity);

// Get upcoming appointments
router.get('/appointments', getUpcomingAppointments);

export default router;
