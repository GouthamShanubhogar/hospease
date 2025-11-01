const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Example appointment routes
router.get('/', appointmentController.listAppointments);
router.post('/', appointmentController.createAppointment);

module.exports = router;
