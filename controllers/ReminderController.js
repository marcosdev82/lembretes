const Reminder = require('../models/Reminder');
const User = require('../models/User');

module.exports = class ReminderController {
    static showReminders(req, res) {
        res.render('reminder/home');
    }

    static dashboard(req, res) {
        res.render('reminder/dashboard');
    }

    static createReminder(req, res) {
        res.render('reminder/create');
    }

    static async createReminderSave(req, res) {
        const reminder = {
            title: req.body.title,
            description: req.body.description,  
            date: req.body.date,                
            UserId: req.session.userid
        };

        try {
            await Reminder.create(reminder);

            req.flash('message', 'Lembrete criado com sucesso!');
            req.session.save(() => {
                res.redirect('/reminder/dashboard');
            });
        } catch (err) {
            console.error('Aconteceu um erro:', err);
        }
    }

}
