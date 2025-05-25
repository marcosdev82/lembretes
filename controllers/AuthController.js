const User = require('../models/User');

module.exports = class AuthController {
    static login(req, res) { 
        res.render('auth/login');
    }

    static register(req, res) { 
        res.render('auth/register');
    }

    static async registerPost(req, res) {
        const { name, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            req.flash('message', 'As senhas não conferem! Tente novamente.');
            res.render('auth/register', {
                message: req.flash('message'),
                name,
                email, 
            });
            return;
        }
    }
}
