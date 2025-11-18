require('dotenv').config(); // garante que o .env seja carregado

const sequelizePaginate = require('sequelize-paginate');
const User = require('../models/User');
const { Op } = require('sequelize');
const renderPagination = require('../components/pagination');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// ---------- CONFIGURAÇÃO SEGURA DO RESEND ----------
let resend = null;

if (process.env.RESEND_KEY && process.env.RESEND_KEY.startsWith('re_')) {
  try {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_KEY);
    console.log('Resend configurado com sucesso!');
  } catch (err) {
    console.error('Erro ao inicializar Resend:', err.message);
  }
} else {
  console.warn('RESEND_KEY não encontrada ou inválida. E-mails serão exibidos apenas no console (modo dev).');
}

// Função auxiliar para enviar e-mail (funciona com ou sem Resend)
const sendResetEmail = async (email, resetLink) => {
  const html = `
    <h2>Olá!</h2>
    <p>Recebemos uma solicitação para redefinir sua senha.</p>
    <p>Clique no botão abaixo para criar uma nova senha:</p>
    <div style="margin: 20px 0;">
      <a href="${resetLink}" style="background:#0066ff;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-size:16px;display:inline-block;">
        Redefinir senha
      </a>
    </div>
    <p>Ou copie este link: <br><small>${resetLink}</small></p>
    <p>Este link expira em 1 hora.</p>
    <hr>
    <small>Se você não solicitou isso, ignore este e-mail.</small>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: 'Lembretes <onboarding@resend.dev>', // mude se quiser
        to: email,
        subject: 'Redefinição de senha - Lembretes',
        html,
      });
      console.log(`E-mail de recuperação enviado para: ${email}`);
    } catch (err) {
      console.error('Erro ao enviar e-mail com Resend:', err);
    }
  } else {
    // Modo desenvolvimento – só mostra no terminal
    console.log('========================================');
    console.log('E-MAIL DE RECUPERAÇÃO (modo dev)');
    console.log('Para:', email);
    console.log('Link:', resetLink);
    console.log('========================================');
  }
};

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
      return res.render('auth/register', { message: req.flash('message'), name, email });
    }

    const checkUserExists = await User.findOne({ where: { email } });
    if (checkUserExists) {
      req.flash('message', 'E-mail já cadastrado! Tente novamente.');
      return res.render('auth/register', { message: req.flash('message'), name, email });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = { name, email, password: hashedPassword };

    try {
      const createdUser = await User.create(user);
      req.session.userid = createdUser.id;
      req.flash('success', 'Cadastro realizado com sucesso!');
      req.session.save(() => res.redirect('/'));
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      req.flash('message', 'Erro ao criar usuário! Tente novamente.');
      res.render('auth/register', { message: req.flash('message'), name, email });
    }
  }

  static logout(req, res) {
    req.session.destroy();
    res.redirect('/login');
  }

  static async forgotPassword(req, res) {
    if (req.method === 'GET') {
      return res.render('auth/forgot-password', { error: null, success: null });
    }
    console.log(req.method);

    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.render('auth/forgot-password', {
        success: 'Se o e-mail existir, enviamos um link de recuperação.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3333'}/reset-password/${token}`;

    // Aqui usamos a função segura que nunca dá crash
    await sendResetEmail(email, resetLink);

    res.render('auth/forgot-password', {
      success: 'Se o e-mail existir, enviamos um link de recuperação.',
    });
  }


  static async resetPasswordForm(req, res){
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });


    if (!user) {
      return res.render('auth/reset-password', { valid: false, token });
    }

    res.render('auth/reset-password', { valid: true, token });
  };

  static async resetPassword(req, res) {
    const { token } = req.params;
    const { password, confirmPassword } = req.body || {};

    // Validação básica
    if (!password || !confirmPassword) {
      return res.render('auth/reset-password', {
        valid: true,
        token,
        error: 'Preencha os dois campos de senha.'
      });
    }

    if (password !== confirmPassword) {
      return res.render('auth/reset-password', {
        valid: true,
        token,
        error: 'As senhas não coincidem.'
      });
    }

    if (password.length < 6) {
      return res.render('auth/reset-password', {
        valid: true,
        token,
        error: 'A senha deve ter pelo menos 6 caracteres.'
      });
    }

    try {
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Op.gt]: Date.now() }
        }
      });

      if (!user) {
        return res.render('auth/reset-password', {
          valid: false,
          token
        });
      }

      // Atualiza a senha
      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.render('auth/reset-password', {
        valid: true,
        success: 'Senha alterada com sucesso! Faça login agora.',
        token
      });

    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      return res.render('auth/reset-password', {
        valid: true,
        token,
        error: 'Erro interno. Tente novamente.'
      });
    }
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

      const whereCondition = search
        ? {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } },
            ],
          }
        : {};

      const { docs, pages, total } = await User.paginate({
        where: whereCondition,
        order: [['createdAt', 'DESC']],
        page,
        paginate: limit,
      });

      const showPagination = total > limit;
      const users = docs.map((user) => user.get({ plain: true }));
      const paginationHtml = renderPagination(page, pages, showPagination, search);

      res.render('auth/users', {
        users,
        currentPage: page,
        totalPages: pages,
        total,
        search,
        message: req.flash('message'),
        paginationHtml,
      });
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      req.flash('message', 'Erro ao carregar usuários.');
      res.redirect('/login');
    }
  }
};