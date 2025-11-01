import express from 'express';
import { listHospitals, createHospital } from '../controllers/hospitalController.js';

const router = express.Router();

router.get('/', listHospitals);
router.post('/', createHospital);

export default router;
