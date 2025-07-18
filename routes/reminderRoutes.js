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
router.get('/trash/:id', checkAuth, ReminderController.moveToTrash);
router.post('/remove', checkAuth, ReminderController.removeReminder);
// router.get('/deleted', ReminderController.showReminders)
router.get('/', checkAuth, ReminderController.showReminders);
router.get('/restore/:id', checkAuth, ReminderController.restoreFromTrash);

module.exports = router;

