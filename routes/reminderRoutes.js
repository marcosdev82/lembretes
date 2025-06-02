const express = require('express');
const router = express.Router();

const ReminderController = require('../controllers/ReminderController');

// helper
const checkAuth = require('../helpers/auth').checkAuth

router.get('/dashboard', checkAuth, ReminderController.dashboard);
router.get('/', checkAuth, ReminderController.showReminders);

module.exports = router;
