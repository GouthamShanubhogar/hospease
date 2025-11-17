import express from 'express';
import {
	getAllDoctors,
	getDoctorById,
	createDoctor,
	updateDoctor,
	deleteDoctor,
	getDoctorSchedule,
	getDoctorAppointments,
	getDoctorsBySpecialization,
	listDoctors,
	updateCurrentToken,
	getTodaysPatients,
	markConsultationCompleted,
} from '../controllers/doctorController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All routes are protected with authentication
router.use(verifyToken);

// New comprehensive routes
router.get('/all', getAllDoctors);
router.get('/specialization/:specialization', getDoctorsBySpecialization);
router.get('/:id/detail', getDoctorById);
router.get('/:doctorId/schedule', getDoctorSchedule);
router.get('/:doctorId/appointments', getDoctorAppointments);
router.post('/create', createDoctor);
router.put('/:id/update', updateDoctor);
router.delete('/:id', deleteDoctor);

// Legacy routes for backward compatibility
router.get('/', listDoctors);
router.post('/', createDoctor);
router.put('/:id/token', updateCurrentToken);
router.get('/:id/patients', getTodaysPatients);
router.put('/appointments/:id/complete', markConsultationCompleted);

export default router;
