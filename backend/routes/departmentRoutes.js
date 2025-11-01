import express from 'express';
import { listDepartments, createDepartment } from '../controllers/departmentController.js';

const router = express.Router();

router.get('/', listDepartments);
router.post('/', createDepartment);

export default router;