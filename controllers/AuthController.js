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

        // criar o usuário
        try {
            const createdUser = await User.create(user);

            // inicializar a sessão
            req.session.userid = createdUser.id;
            req.flash('success', 'Usuário cadastrado com sucesso!');

            req.session.save(() => {
                res.redirect('/');
            });

        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            req.flash('error', 'Erro ao cadastrar usuário. Tente novamente.');
            return res.render('auth/register', {
                message: req.flash('error'),
                name,
                email,
            });
        }
    }

    static logout(req, res) {
        req.session.destroy()
        res.redirect('/login')
    }
};
