import express from 'express';
import {
	getAllAppointments,
	getAppointmentById,
	createAppointment,
	updateAppointment,
	cancelAppointment,
	confirmAppointment,
	completeAppointment,
	getAppointmentsByDate,
	getDoctorAppointments,
	deleteAppointment,
	listAppointments,
	getAppointment,
	getCurrentToken,
	advanceToken,
	resetTokenCounter,
	getAppointmentStats,
	getPatientUpcomingAppointments,
	rescheduleAppointment,
	markNoShow
} from '../controllers/appointmentController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Test route without authentication
router.get('/test', getAllAppointments);

// All routes are protected with authentication
router.use(verifyToken);

// New comprehensive routes
router.get('/all', getAllAppointments);
router.get('/date/:date', getAppointmentsByDate);
router.get('/doctor/:doctorId', getDoctorAppointments);
router.get('/detail/:id', getAppointmentById);
router.post('/create', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);
router.post('/:id/cancel', cancelAppointment);
router.post('/:id/confirm', confirmAppointment);
router.post('/:id/complete', completeAppointment);

// Token queue management routes
router.get('/doctor/:doctorId/current-token', getCurrentToken);
router.post('/doctor/:doctorId/advance-token', advanceToken);
router.post('/doctor/:doctorId/reset-token', resetTokenCounter);

// Statistics and analytics routes
router.get('/stats', getAppointmentStats);
router.get('/patient/:patient_id/upcoming', getPatientUpcomingAppointments);

// Additional appointment management routes
router.post('/:id/reschedule', rescheduleAppointment);
router.post('/:id/no-show', markNoShow);

// Legacy routes for backward compatibility
router.get('/', listAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointment);

export default router;
