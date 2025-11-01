import express from 'express';
import {
	listAppointments,
	createAppointment,
	getAppointment,
} from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/', listAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointment);

export default router;
