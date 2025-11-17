import express from 'express';
import {
  getAllLabReports,
  getLabReportById,
  createLabReport,
  updateLabReport,
  getPatientLabReports,
  getLabReportsByStatus,
  getLabReportStats,
  deleteLabReport
} from '../controllers/labReportController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All routes are protected with authentication
router.use(verifyToken);

// Lab report routes
router.get('/', getAllLabReports);
router.get('/stats', getLabReportStats);
router.get('/status/:status', getLabReportsByStatus);
router.get('/:id', getLabReportById);
router.post('/', createLabReport);
router.put('/:id', updateLabReport);
router.delete('/:id', deleteLabReport);
router.get('/patient/:patientId', getPatientLabReports);

export default router;
