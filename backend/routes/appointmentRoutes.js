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
} from '../controllers/appointmentController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

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

// Legacy routes for backward compatibility
router.get('/', listAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointment);

export default router;
