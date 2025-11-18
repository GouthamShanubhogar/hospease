import express from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientMedicalRecords,
  getPatientAppointments
} from '../controllers/patientController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All routes are protected with authentication
router.use(verifyToken);

// Patient CRUD routes
router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient); // Keep this for backward compatibility
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

// Patient-specific routes
router.get('/:patientId/medical-records', getPatientMedicalRecords);
router.get('/:patientId/appointments', getPatientAppointments);

export default router;
