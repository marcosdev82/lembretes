const Reminder = require('../models/Reminder');
const User = require('../models/Users');

module.exports = class ReminderController {
    static async showReminders(req, res) {
        res.render('reminder/home')  
    }
}