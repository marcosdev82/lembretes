const express = require('express');
const router = express.Router();

const ReminderController = require('../controllers/ReminderController');

// helper
const checkAuth = require('../helpers/auth').checkAuth;

// Rotas
router.get('/dashboard', checkAuth, ReminderController.dashboard);
router.get('/home', checkAuth, ReminderController.showReminders);
router.get('/add', checkAuth, ReminderController.createReminder); 
router.post('/add', checkAuth, ReminderController.createReminderSave); 
router.get('/edit/:id', checkAuth, ReminderController.updateReminder);
router.post('/edit/:id', checkAuth, ReminderController.updateReminderSave);
router.post('/remove', checkAuth, ReminderController.moveToTrash);
router.get('/', checkAuth, ReminderController.showReminders);

module.exports = router;

