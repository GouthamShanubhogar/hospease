import express from 'express';
import {
  getBillingRecords,
  getBillingRecord,
  createBillingRecord,
  updateBillingRecord,
  deleteBillingRecord,
  getBillingStats
} from '../controllers/billingController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All billing routes require authentication
router.use(verifyToken);

// Get billing statistics
router.get('/stats', getBillingStats);

// Get all billing records (with optional filters)
router.get('/', getBillingRecords);

// Get single billing record
router.get('/:id', getBillingRecord);

// Create billing record
router.post('/', createBillingRecord);

// Update billing record
router.put('/:id', updateBillingRecord);

// Delete billing record
router.delete('/:id', deleteBillingRecord);

export default router;
