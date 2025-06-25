const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = class AuthController {
    static login(req, res) {
        res.render('auth/login');
    }

    static async loginPost(req, res) {
        const { email, password } = req.body;

        // verificar se o usuário existe
        const user = await User.findOne({ where: { email } });

        if (!user) {
            req.flash('message', 'Usuário não encontrado! Tente novamente.');
            return res.render('auth/login', {
                message: req.flash('message'),
                email,
            });
        }

        // verificar se a senha está correta
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            req.flash('message', 'Senha inválida! Tente novamente.');
                return res.render('auth/login', {
                message: req.flash('message'),
                email,
            });
        }

        // inicializar a sessão
        req.session.userid = user.id;
        req.flash('success', 'Login realizado com sucesso!');

        req.session.save(() => {
            res.redirect('/');
        });
    }

    static register(req, res) {
        res.render('auth/register');
    }

    static async registerPost(req, res) {
        const { name, email, password, confirmPassword } = req.body;

        // confirmação de senha
        if (password !== confirmPassword) {
            req.flash('message', 'As senhas não conferem! Tente novamente.');
            return res.render('auth/register', {
                message: req.flash('message'),
                name,
                email,
            });
        }

        // verificar se o usuário já existe
        const checkUserExists = await User.findOne({ where: { email } });

        if (checkUserExists) {
            req.flash('message', 'E-mail já cadastrado! Tente novamente.');
            return res.render('auth/register', {
                message: req.flash('message'),
                name,
                email,
            });
        }

        // criar um password hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = {
            name,
            email,
            password: hashedPassword,
        };

        try {
            const createdUser = await User.create(user);
            req.session.userid = createdUser.id;
            req.flash('success', 'Cadastro realizado com sucesso!');

            req.session.save(() => {
                res.redirect('/');
            });
        } catch (error) {
            console.error(error);
            req.flash('message', 'Erro ao criar usuário! Tente novamente.');
            res.render('auth/register', {
                message: req.flash('message'),
                name,
                email,
            });
        }
    }

    static logout(req, res) {
        req.session.destroy()
        res.redirect('/login')
    }

    static async showUsers(req, res) {
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

            const { docs, pages, total } = await Users.paginate({
                where: whereCondition,
                order: [['createdAt', 'DESC']],
                page,
                paginate: limit,
                include: [{ model: User, attributes: ['id', 'name', 'email'] }],
            });

            const showPatination = (total > limit) && true

            const reminders = docs.map(users => users.get({ plain: true }));
            const paginationHtml = renderPagination(page, pages, showPatination, search);

            res.render('auth/users', {
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
    
};
