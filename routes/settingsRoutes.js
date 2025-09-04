const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/SettingsController');

router.get('/settings', SettingsController.showSettings);

router.post('/settings/edit-user', SettingsController.editUser);
module.exports = router;
