const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = class AuthController {
    static login(req, res) {
        res.render('auth/login');
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
};
