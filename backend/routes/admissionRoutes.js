import express from 'express';
import {
  getAllAdmissions,
  getAdmissionById,
  createAdmission,
  updateAdmission,
  dischargePatient,
  getAdmissionStats,
  deleteAdmission
} from '../controllers/admissionController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All routes are protected with authentication
router.use(verifyToken);

// Admission routes
router.get('/', getAllAdmissions);
router.get('/stats', getAdmissionStats);
router.get('/:id', getAdmissionById);
router.post('/', createAdmission);
router.put('/:id', updateAdmission);
router.delete('/:id', deleteAdmission);
router.post('/:id/discharge', dischargePatient);

export default router;
