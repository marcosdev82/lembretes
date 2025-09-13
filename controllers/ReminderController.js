const sequelizePaginate = require('sequelize-paginate');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const renderPagination = require('../components/pagination');
const slugify = require('slugify');
const { Op } = require('sequelize'); 
const { isValid, parseISO } = require('date-fns');
const { formatForDatetimeLocal } = require('../helpers/parseFormat')

sequelizePaginate.paginate(Reminder);

module.exports = class ReminderController {
    static async showReminders(req, res) {
        if (!req.session.userid) {
            req.flash('message', 'Sessão expirada. Faça login novamente.');
            return res.redirect('/login');
        }

        try {
            const author = req.session.userid;
            const page = parseInt(req.query.page) || 1;
            const limit = 2;
            const search = req.query.search || '';

            const whereCondition = {
                author, // <-- corrigido
                deletedAt: null, // ignora lembretes movidos para lixeira
                post_status: 'published'
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

            const showPatination = (total > limit);

            const reminders = docs.map(reminder => reminder.get({ plain: true }));
            
            const paginationHtml = renderPagination(page, pages, showPatination, search);

            res.render('reminder/home', {
                reminders,
                currentPage: page,
                totalPages: pages,
                total,
                search,
                message: req.flash('message'),
                paginationHtml,
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
            const author = req.session.userid;
            const page = parseInt(req.query.page) || 1;
            const limit = 2;
            const search = req.query.search || '';
            const showDeleted = req.query.deleted === 'true';

            const whereCondition = {
                author,
            };

            if (search) {
                whereCondition[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                ];
            }

            const paginateOptions = {
                where: showDeleted
                    ? { ...whereCondition, deletedAt: { [Op.ne]: null } }
                    : { ...whereCondition, deletedAt: null },
                order: [['createdAt', 'DESC']],
                page,
                paginate: limit,
                include: [{ model: User, attributes: ['id', 'name', 'email'] }],
                paranoid: !showDeleted,
            };

            const { docs, pages, total } = await Reminder.paginate(paginateOptions);

            const reminders = docs.map(reminder => reminder.get({ plain: true }));

            reminders.forEach(reminder => {
                if (reminder.date) {
                    reminder.dateFormatted = formatForDatetimeLocal(reminder.date);
                    reminder.dateFormatted_expire = formatForDatetimeLocal(reminder.post_expire);
                }
            });
            

            const showPagination = total > limit;
            const paginationHtml = renderPagination(page, pages, showPagination, search, showDeleted);

            const deletedCount = await Reminder.count({
                where: {
                    author,
                    deletedAt: { [Op.ne]: null },
                },
                paranoid: false,
            });

            res.render('reminder/dashboard', {
                reminders,
                currentPage: page,
                totalPages: pages,
                total,
                search,
                deletedCount,
                message: req.flash('message'),
                showDeleted: Boolean(showDeleted),
                paginationHtml,
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
        try {
            let date;

            if (req.body.date) {
                // tenta converter a data enviada
                const parsedDate = parseISO(req.body.date);
                date = isValid(parsedDate) ? parsedDate : new Date();
            } else {
                // se não veio nada → usa a data atual
                date = new Date();
            }

            const title =  req.body.title

            // const slug = slugify(title, {
            //     lower: true,    // deixa tudo minúsculo
            //     strict: true    // remove caracteres especiais
            // });
            
            const reminder = {
                title,
                description: req.body.description,
                post_content: req.body.post_content || '',
                date, // sempre terá valor válido aqui
                post_expire: req.body.post_expire || null,
                post_status: req.body.post_status || 'draft',
                author: req.session.userid
            };

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

            // reminder.dateFormatted_expire = null
            // reminder.dateFormatted = null

            // Formata a data para input type="date"
            if (reminder.date) {
                reminder.dateFormatted = formatForDatetimeLocal(reminder.date);
            }

            if (reminder.post_expire) {
                reminder.dateFormatted_expire = formatForDatetimeLocal(reminder.post_expire);
            }

            console.log(reminder)

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

        const { title, slug, description, post_status, post_expire, date: rawDate } = data;

        try {
            let date;

            if (rawDate) {
                const parsedDate = parseISO(rawDate);
                date = isValid(parsedDate) ? parsedDate : new Date();
            } else {
                date = new Date(); // se não veio nada, usa agora
            }

            // const title = slugify(title, {
            //     lower: true,     
            //     strict: true  
            // });

            // const slug = slugify(slug, {
            //     lower: true,    
            //     strict: true  
            // });

            const [updatedRows] = await Reminder.update(
                {
                    title,
                    slug,
                    description,
                    date,
                    post_status: post_status || 'draft',
                    post_expire: post_expire || null,
                },
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
        const author = req.session.userid;
        console.log('ID do lembrete a ser removido:', {
                where: { id, author },
                force: true // <- Força a exclusão permanente mesmo com paranoid: true
            });

        try {
            const deleted = await Reminder.destroy({
                where: { id, author },
                force: true 
            });

            console.log('Resultado da remoção:', deleted);

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
    
    static async moveToTrash(req, res) {
        const id = req.params.id;
        const author = req.session.userid;

        console.log('ID do lembrete a ser movido para a lixeira:', id);

        if (!author) {
            req.flash('message', 'Sessão expirada. Faça login novamente.');
            return res.redirect('/login');
        }

        try {
            const reminder = await Reminder.findOne({
                where: { id, author }
            });

            if (!reminder) {
                req.flash('message', 'Lembrete não encontrado ou você não tem permissão.');
                return res.redirect('/reminder/dashboard');
            }

            // Atualiza o status para "rascunho" antes de deletar (soft delete)
            await reminder.update({ post_status: 'draft' });

            // Aplica soft delete
            await reminder.destroy();

            req.flash('message', 'Lembrete movido para a lixeira!');
            req.session.save(() => res.redirect('/reminder/dashboard'));
        } catch (err) {
            console.error('Erro ao mover lembrete para a lixeira:', err);
            req.flash('message', 'Erro ao tentar mover o lembrete para a lixeira.');
            req.session.save(() => res.redirect('/reminder/dashboard'));
        }
    }

    static async restoreFromTrash(req, res) {
        const { id } = req.params;
        const author = req.session.userid;

        try {
            const reminder = await Reminder.findOne({
                where: { id, author },
                paranoid: false  
            });

            if (!reminder || !reminder.deletedAt) {
                req.flash('message', 'Lembrete não encontrado ou não está na lixeira.');
                return res.redirect('/reminder/dashboard');
            }

            await reminder.restore();  

            req.flash('message', 'Lembrete restaurado com sucesso!');
            req.session.save(() => res.redirect('/reminder/dashboard'));
        } catch (err) {
            console.error('Erro ao restaurar lembrete:', err);
            req.flash('message', 'Erro ao tentar restaurar o lembrete.');
            req.session.save(() => res.redirect('/reminder/dashboard'));
        }
    }

    static async moveMultipleToTrash(req, res) {
        const ids = req.body.ids; // Array de IDs selecionados
        const author = req.session.userid;

        if (!Array.isArray(ids) || ids.length === 0) {
            req.flash('message', 'Nenhum lembrete selecionado.');
            return res.redirect('/reminder/dashboard');
        }

        try {
            // Busca todos os lembretes pertencentes ao usuário e com os IDs informados
            const reminders = await Reminder.findAll({
                where: {
                    id: { [Op.in]: ids },
                    author,
                    deletedAt: null
                }
            });

            if (reminders.length === 0) {
                req.flash('message', 'Nenhum lembrete válido encontrado.');
                return res.redirect('/reminder/dashboard');
            }

            // Atualiza status e aplica soft delete
            for (const reminder of reminders) {
                await reminder.update({ post_status: 'draft' });
                await reminder.destroy(); // <-- Soft delete, respeita paranoid
            }

            req.flash('message', `${reminders.length} lembrete(s) movido(s) para a lixeira!`);
            req.session.save(() => res.redirect('/reminder/dashboard'));

        } catch (err) {
            console.error('Erro ao mover lembretes para a lixeira:', err);
            req.flash('message', 'Erro ao mover lembretes para a lixeira.');
            req.session.save(() => res.redirect('/reminder/dashboard'));
        }
    }

    static async duplicateReminder(req, res) {
        const { id } = req.params;
        const author = req.session.userid;

        if (!author) {
            req.flash('message', 'Sessão expirada. Faça login novamente.');
            return res.redirect('/login');
        }

        try {
            // Busca o lembrete original
            const originalReminder = await Reminder.findOne({
                where: { id, author }
            });

            if (!originalReminder) {
                req.flash('message', 'Lembrete não encontrado ou você não tem permissão.');
                return res.redirect('/reminder/dashboard');
            }

            // Cria uma cópia do lembrete
            const duplicatedReminder = await Reminder.create({
                title: `${originalReminder.title} (Cópia)`,
                description: originalReminder.description,
                post_content: originalReminder.post_content,
                date: originalReminder.date,
                post_expire: originalReminder.post_expire,
                post_status: 'draft', // novo lembrete começa como rascunho
                author
            });

            req.flash('message', 'Lembrete duplicado com sucesso!');
            req.session.save(() => {
                res.redirect(`/reminder/edit/${duplicatedReminder.id}`);
            });
        } catch (err) {
            console.error('Erro ao duplicar lembrete:', err);
            req.flash('message', 'Erro ao tentar duplicar o lembrete.');
            req.session.save(() => res.redirect('/reminder/dashboard'));
        }
    }

}