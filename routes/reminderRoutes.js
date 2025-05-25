const express = require('express');
const router = express.Router();

const ReminderController = require('../controllers/ReminderController');

router.get('/', ReminderController.showReminders);

module.exports = router;
