const express = require('express');
const router = express.Router();

const ReminderController = require('../controllers/ReminderController');

// helper
const checkAuth = require('../helpers/auth').checkAuth;

// Rotas
router.get('/dashboard', checkAuth, ReminderController.dashboard);
router.get('/add', checkAuth, ReminderController.createReminder); // Exibe o formulário
router.post('/add', checkAuth, ReminderController.createReminderSave); // Salva o formulário 
router.post('/remove', checkAuth, ReminderController.removeReminder)
router.get('/', checkAuth, ReminderController.showReminders);

module.exports = router;
