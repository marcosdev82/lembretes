const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/SettingsController');

router.get('/settings', SettingsController.showSettings);

module.exports = router;
