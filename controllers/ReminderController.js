const sequelizePaginate = require('sequelize-paginate');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const renderPagination = require('../components/pagination');
const { Op } = require('sequelize'); 
const { isValid, parseISO } = require('date-fns');

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

            const whereCondition = { UserId: userId };

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

            const showPatination = (total > limit) && true

            const reminders = docs.map(reminder => reminder.get({ plain: true }));
            const paginationHtml = renderPagination(page, pages, showPatination, search);

            res.render('reminder/home', {
                reminders,
                currentPage: page,
                totalPages: pages,
                total,
                search: search,
                message: req.flash('message'),
                paginationHtml, // Adiciona a HTML da paginação
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

            reminders.forEach(reminder => {
                if (reminder.date) {
                    reminder.dateFormatted = reminder.date.toISOString().slice(0, 10);
                }
            });

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
            post_content: req.body.post_content || '',
            date: req.body.date,
            post_expire: req.body.post_expire || null,
            post_status: req.body.post_status || 'draft',
            author: req.session.userid, 
            UserId: req.session.userid,
        };

        try {
            const createdReminder = await Reminder.create(reminder);

            req.flash('message', 'Lembrete criado com sucesso!');
            req.session.save(() => {
                res.redirect(`/reminder/edit/${createdReminder.id}`);
            });
        } catch (err) {
            console.error('Aconteceu um erro ao criar o lembrete:', err);
            res.redirect('/reminder/create'); 
        }
    }


    static async updateReminder(req, res) {
        const { id } = req.params;

        if (!id) {
            req.flash('message', 'Lembrete não encontrado.');
            return res.redirect('/reminder/dashboard');
        }

        try {
            const reminderInstance = await Reminder.findOne({ where: { id } });

            if (!reminderInstance) {
                req.flash('message', 'Lembrete não encontrado.');
                return res.redirect('/reminder/dashboard');
            }

            const reminder = reminderInstance.get({ plain: true });

            // Formata a data para input type="date"
            if (reminder.date) {
                reminder.dateFormatted = reminder.date.toISOString().slice(0, 10);
            }

            console.log('Reminder to edit:', reminder);

            res.render('reminder/edit', { reminder });

        } catch (err) {
            console.error('Erro ao buscar lembrete para edição:', err);
            req.flash('message', 'Erro ao tentar alterar o lembrete.');
            req.session.save(() => res.redirect('/reminder/dashboard'));
        }
    }

    static async updateReminderSave(req, res) {
        const { id } = req.params;
        const isJson = req.headers['content-type']?.includes('application/json');

        let data = req.body;

        if (isJson) {
            // Certifique-se que o app usa `express.json()` no app.js/middleware
            data = req.body;
        }

        const { title, description, post_status, date: rawDate } = data;

        try {
            const date = parseISO(rawDate);

            const [updatedRows] = await Reminder.update(
                { title, description, date, post_status: post_status || 'publish' },
                { where: { id } }
            );

            if (updatedRows === 0) {
                const msg = 'Lembrete não encontrado ou você não tem permissão.';
                if (isJson) return res.status(404).json({ success: false, message: msg });
                req.flash('message', msg);
                return res.redirect('/reminder/dashboard');
            }

            if (isJson) {
                return res.json({ success: true });
            }

            req.flash('message', 'Lembrete atualizado com sucesso!');
            req.session.save(() => {
                return res.redirect(`/reminder/edit/${id}`);
            });

        } catch (err) {
            console.error('Erro ao atualizar lembrete:', err);
            const msg = 'Erro ao tentar atualizar o lembrete.';

            if (isJson) return res.status(500).json({ success: false, message: msg });

            req.flash('message', msg);
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