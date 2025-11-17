import express from 'express';
import {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  deletePrescription
} from '../controllers/prescriptionController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All routes are protected with authentication
router.use(verifyToken);

// Prescription routes
router.get('/', getAllPrescriptions);
router.get('/:id', getPrescriptionById);
router.post('/', createPrescription);
router.put('/:id', updatePrescription);
router.delete('/:id', deletePrescription);
router.get('/patient/:patientId', getPatientPrescriptions);
router.get('/doctor/:doctorId', getDoctorPrescriptions);

export default router;
