const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// Example doctor routes
router.get('/', doctorController.listDoctors);
router.post('/', doctorController.createDoctor);

module.exports = router;
