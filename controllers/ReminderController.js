const sequelizePaginate = require('sequelize-paginate');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { Op } = require('sequelize');

sequelizePaginate.paginate(Reminder);

module.exports = class ReminderController {
    static async showReminders(req, res) {
        if (!req.session.userid) {
            req.flash('message', 'Sessão expirada. Faça login novamente.');
            return res.redirect('/login');
        }

        try {
            const userId = req.session.userid;
            const page = parseInt(req.query.page) || 1;
            const limit = 2;
            const search = req.query.search || '';
            console.log('Search query:', search);

            const whereCondition = {
                UserId: userId,
            };

            if (search) {
                whereCondition[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                ];
            }

            const { docs, pages, total } = await Reminder.paginate({
                where: whereCondition,
                order: [['createdAt', 'DESC']],
                page,
                paginate: limit,
                include: [{ model: User, attributes: ['id', 'name', 'email'] }],
            });

            const reminders = docs.map(reminder => reminder.get({ plain: true }));

            res.render('reminder/home', {
                reminders,
                currentPage: page,
                totalPages: pages,
                total,
                search: search,
                message: req.flash('message'),
            });
            
        } catch (err) {
            console.error('Erro ao carregar lembretes:', err);
            req.flash('message', 'Erro ao carregar lembretes.');
            res.redirect('/login');
        }
    }

    static async dashboard(req, res) {
        if (!req.session.userid) {
            req.flash('message', 'Sessão expirada. Faça login novamente.');
            return res.redirect('/login');
        }

        try {
            const userId = req.session.userid;
            const page = parseInt(req.query.page) || 1;
            const limit = 2;
            const search = req.query.search || '';
            console.log('Search query:', search);

            const whereCondition = {
                UserId: userId,
            };

            if (search) {
                whereCondition[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                ];
            }

            const { docs, pages, total } = await Reminder.paginate({
                where: whereCondition,
                order: [['createdAt', 'DESC']],
                page,
                paginate: limit,
                include: [{ model: User, attributes: ['id', 'name', 'email'] }],
            });

            const reminders = docs.map(reminder => reminder.get({ plain: true }));

            res.render('reminder/dashboard', {
                reminders,
                currentPage: page,
                totalPages: pages,
                total,
                search: search,
                message: req.flash('message'),
            });
            
        } catch (err) {
            console.error('Erro ao carregar lembretes:', err);
            req.flash('message', 'Erro ao carregar lembretes.');
            res.redirect('/login');
        }
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
            const createdReminder = await Reminder.create(reminder);

            req.flash('message', 'Lembrete criado com sucesso!');
            req.session.save(() => {
                // Redirecionar para a área de edição do lembrete
                res.redirect(`/reminder/edit/${createdReminder.id}`);
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
            const reminder = await Reminder.findOne({ where: { id }, row: true });
            if (!reminder) {
                req.flash('message', 'Lembrete não encontrado.');
                return res.redirect('/reminder/dashboard');
            }

            // Renderiza a view de edição com os dados do lembrete
            res.render('reminder/edit', { reminder: reminder.get({ plain: true }) });

        } catch (err) {
            console.error('Erro ao buscar lembrete para edição:', err);
            req.flash('message', 'Erro ao tentar alterar o lembrete.');
            req.session.save(() => {
                res.redirect('/reminder/dashboard');
            });
        }
    }

    static async updateReminderSave(req, res) {
        const { id } = req.params;

        const reminder = {
            title: req.body.title,
            description: req.body.description,
            date: req.body.date
        };

        try {
            const [updatedRows] = await Reminder.update(reminder, {
                where: { id }
            });

            if (updatedRows === 0) {
                req.flash('message', 'Lembrete não encontrado ou você não tem permissão.');
                return res.redirect('/reminder/dashboard');
            }

            req.flash('message', 'Lembrete atualizado com sucesso!');
            req.session.save(() => {
                res.redirect('/reminder/dashboard');
            });
        } catch (err) {
            console.error('Erro ao atualizar lembrete:', err);
            req.flash('message', 'Erro ao tentar atualizar o lembrete.');
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