import express from 'express';
import {
	listDoctors,
	createDoctor,
	updateCurrentToken,
	getTodaysPatients,
	markConsultationCompleted,
} from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', listDoctors);
router.post('/', createDoctor);

// Receptionist/Admin: update current token for a doctor
router.put('/:id/token', updateCurrentToken);

// Doctor: get today's patient list
router.get('/:id/patients', getTodaysPatients);

// Mark consultation completed (appointment id)
router.put('/appointments/:id/complete', markConsultationCompleted);

export default router;
