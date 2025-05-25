const Reminder = require('../models/Reminder');
const User = require('../models/User');

module.exports = class ReminderController {
    static async showReminders(req, res) {
        res.render('reminder/home')  
    }
}