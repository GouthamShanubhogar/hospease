import express from 'express';
import {
  getAllPatients,
  createPatient,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatients
} from '../controllers/patientsController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All routes are protected with authentication
router.use(verifyToken);

// Patient routes
router.get('/', getAllPatients);
router.post('/', createPatient);
router.get('/search', searchPatients);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;