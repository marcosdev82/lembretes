const Reminder = require('../models/Reminder');
const User = require('../models/User');

module.exports = class ReminderController {
    static showReminders(req, res) {
        res.render('reminder/home');
    }

    static async dashboard(req, res) {
        const userid = req.session.userid;

        const user = await User.findOne({
            where: { id: userid },
            include: Reminder,
            plain: true
        });

        if (!user) {
            return res.redirect('/login');
        }

        const reminders = user.Reminders.map((result) => result.dataValues);

        res.render('reminder/dashboard', { reminders });
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

    static async updateReminder(req, res) {

        const { id } = req.params;

        if (!id) {
            req.flash('message', 'Lembrete não encontrado.');
            return res.redirect('/reminder/dashboard');
        }

        try {
   
            const reminder = await Reminder.findOne({where: { id: id }});

            if (!reminder) {
                req.flash('message', 'Lembrete não encontrado.');
                return res.redirect('/reminder/dashboard');
            }
            
            res.redirect('/reminder/edit', { reminder });

        } catch (err) {
            console.error('Erro ao remover lembrete:', err);
            req.flash('message', 'Erro ao tentar alterar o lembrete.');
            req.session.save(() => {
                res.redirect('/reminder/dashboard');
            });
        }


    }

    static async removeReminder(req, res) {
        const { id } = req.body;
        const UserId = req.session.userid;

        try {
            const deleted = await Reminder.destroy({
                where: { id, UserId }
            });

            if (deleted) {
                req.flash('message', 'Lembrete removido com sucesso!');
            } else {
                req.flash('message', 'Lembrete não encontrado ou você não tem permissão.');
            }

            req.session.save(() => {
                res.redirect('/reminder/dashboard');
            });
        } catch (err) {
            console.error('Erro ao remover lembrete:', err);
            req.flash('message', 'Erro ao tentar remover o lembrete.');
            req.session.save(() => {
                res.redirect('/reminder/dashboard');
            });
        }
    }

}