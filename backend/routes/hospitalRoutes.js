const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');

// Example hospital routes
router.get('/', hospitalController.listHospitals);
router.post('/', hospitalController.createHospital);

module.exports = router;
