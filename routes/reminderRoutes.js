const express = require('express');
const router = express.Router();

// Controllers
const ReminderController = require('../controllers/ReminderController');

// Rotas
router.get('/', ReminderController.showReminders);

module.exports = router;
