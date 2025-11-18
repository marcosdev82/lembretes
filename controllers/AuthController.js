const sequelizePaginate = require('sequelize-paginate');
const User = require('../models/User');
const { Op } = require('sequelize'); 
const renderPagination = require('../components/pagination');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Resend } = require('resend'); // npm install resend
const resend = new Resend(process.env.RESEND_KEY);

sequelizePaginate.paginate(User);

module.exports = class AuthController {
    static login(req, res) {
        res.render('auth/login');
    }

    static async loginUser(req, res) {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            req.flash('message', 'Usuário não encontrado! Tente novamente.');
            return res.render('auth/login', {
                message: req.flash('message'),
                email,
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            req.flash('message', 'Senha inválida! Tente novamente.');
                return res.render('auth/login', {
                message: req.flash('message'),
                email,
            });
        }

        req.session.userid = user.id;
        req.flash('success', 'Seja bem vindo!');

        req.session.save(() => {
            res.redirect('/');
        });
    }

    static register(req, res) {
        res.render('auth/register');
    }

    static async registerUser(req, res) {
        const { name, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            req.flash('message', 'As senhas não conferem! Tente novamente.');
            return res.render('auth/register', {
                message: req.flash('message'),
                name,
                last_name,
                email,
                // gender,
                // avatar,
                // bio,
                // phone,
                // birthdate,

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

    static forgotPassword(req, res) {
        res.render('auth/forgot-password');
    }

    static async showUsers(req, res) {
        if (!req.session.userid) {
            req.flash('message', 'Sessão expirada. Faça login novamente.');
            return res.redirect('/login');
        }

        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 2;
            const search = req.query.search || '';

            // Inicializa whereCondition
            const whereCondition = {};

            // Adiciona condições de busca se houver
            if (search) {
                whereCondition[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                ];
            }

            const { docs, pages, total } = await User.paginate({
                where: whereCondition,
                order: [['createdAt', 'DESC']],
                page,
                paginate: limit
            });

            const showPagination = total > limit;

            const users = docs.map(user => user.get({ plain: true }));

            console.log({ users, pages, total })

            const paginationHtml = renderPagination(page, pages, showPagination, search);

            res.render('auth/users', {
                users,
                currentPage: page,
                totalPages: pages,
                total,
                search,
                message: req.flash('message'),
                paginationHtml, // Adiciona a HTML da paginação
            });

        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
            req.flash('message', 'Erro ao carregar usuários.');
            res.redirect('/login'); // Você pode querer redirecionar ou renderizar uma página de erro
        }
    }
    
};
