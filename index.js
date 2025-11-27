require('dotenv').config();
const path = require('path'); // ← ESSA LINHA ESTAVA FALTANDO!

const config = require('./config');
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('connect-flash');
const HelperPagination = require('./helpers/pagination');
const ExpirePost = require('./cron/expirePosts');

const app = express();

// Conexão com banco e models
const conn = require('./db/conn');
const Lembrete = require('./models/Reminder');
const User = require('./models/User');
const Media = require('./models/Media');

// Rotas e controllers
const reminderRoutes = require('./routes/reminderRoutes');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

const reminderController = require('./controllers/ReminderController');

// CONFIGURAÇÃO CORRETA DO HANDLEBARS (2025)
const hbs = exphbs.create({
  extname: '.hbs',                                      // extensão dos arquivos
  partialsDir: path.join(__dirname, 'views/partials'), // ← partials aqui
  helpers: {
    eq: function (a, b) {
      return a === b;
    },
    paginate: HelperPagination,
    // adicione mais helpers aqui se precisar
  },
});

// Registrar a engine (só uma vez!)
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');        // ← importante: 'hbs', não 'handlebars'
app.set('views', path.join(__dirname, 'views')); // garante que a pasta views seja encontrada

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

// Session
app.use(
  session({
    name: 'session',
    secret: process.env.SESSION_SECRET || 'segredo',
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      path: path.join(require('os').tmpdir(), 'sessions'),
    }),
    cookie: {
      secure: false, // mude para true se usar HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24h
      httpOnly: true,
    },
  })
);

app.use(flash());

// Variáveis globais para todos os templates
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  res.locals.message = req.flash('message');
  res.locals.user = req.session.userid
    ? { id: req.session.userid, name: req.session.username }
    : null;

  next();
});

// Rotas
app.use('/reminder', reminderRoutes);
app.use('/', authRoutes);
app.use('/', settingsRoutes);
app.use('/', mediaRoutes);
app.get('/', reminderController.showReminders);

// Inicia o servidor somente após conectar ao banco
conn
  .sync({ force: false })
  .then(() => {
    app.listen(3333, () => {
      console.log('Servidor rodando em http://localhost:3333');
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });