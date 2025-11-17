import express from 'express';
import {
  getAllBeds,
  getBedStats,
  assignBed,
  releaseBed,
  createBed,
  updateBed,
  deleteBed
} from '../controllers/bedController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All routes are protected with authentication
router.use(verifyToken);

// Bed routes
router.get('/', getAllBeds);
router.get('/stats', getBedStats);
router.post('/', createBed);
router.put('/:id', updateBed);
router.delete('/:id', deleteBed);
router.post('/:id/assign', assignBed);
router.post('/:id/release', releaseBed);

export default router;
