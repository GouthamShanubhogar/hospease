import express from 'express';
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  getPatientPayments,
  getPaymentStats,
  getMonthlyRevenue,
  deletePayment
} from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All routes are protected with authentication
router.use(verifyToken);

// Payment routes
router.get('/', getAllPayments);
router.get('/stats', getPaymentStats);
router.get('/revenue/monthly', getMonthlyRevenue);
router.get('/:id', getPaymentById);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);
router.get('/patient/:patientId', getPatientPayments);

export default router;
