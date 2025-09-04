// Arquivo renomeado para SettingsController.js
module.exports = class SettingsController {
    static async showSettings(req, res) {
        const User = require('../models/User');
        const userId = req.session.userid;
        let user = null;
        if (userId) {
            user = await User.findByPk(userId);
        }
        res.render('settings/home', { user });
    }

    static async dashboard(req, res) {
        const User = require('../models/User');
        const Reminder = require('../models/Reminder');
        // Contagem de usuários
        const userCount = await User.count();
        // Contagem de lembretes
        const reminderCount = await Reminder.count();
        // Extra: lembretes expirados
        const expiredCount = await Reminder.count({ where: { post_status: 'expired' } });
        res.render('settings/dashboard', {
            userCount,
            reminderCount,
            expiredCount,
        });
    }

    static async editUser(req, res) {
        const User = require('../models/User');
        const userId = req.session.userid;
        if (!userId) {
            req.flash('message', 'Sessão expirada. Faça login novamente.');
            return res.redirect('/login');
        }
        const { name, email, password } = req.body;
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                req.flash('message', 'Usuário não encontrado.');
                return res.redirect('/settings');
            }
            user.name = name;
            user.email = email;
            if (password) {
                const bcrypt = require('bcrypt');
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }
            await user.save();
            req.flash('success', 'Dados atualizados com sucesso!');
            res.redirect('/settings');
        } catch (err) {
            console.error('Erro ao editar usuário:', err);
            req.flash('error', 'Erro ao editar usuário.');
            res.redirect('/settings');
        }
    }
}