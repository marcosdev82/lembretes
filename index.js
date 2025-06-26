require('dotenv').config(); // <- Isto é essencial para ler o .env

const config = require('./config');
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('connect-flash');
const Handlebars = require('handlebars');
const HelperPagination = require('./helpers/pagination');


const app = express();

// Conexão com o banco
const conn = require('./db/conn');

// Models
const Lembrete = require('./models/Reminder');
const User = require('./models/User');

// Rotas
const reminderRoutes = require('./routes/reminderRoutes');
const authRoutes = require('./routes/authRoutes');

// Controllers
const reminderController = require('./controllers/ReminderController');
const authControllers = require('./controllers/AuthController');

// Template engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');


// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(
  session({
    name: 'session',
    secret: 'segredo',
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: function (message) {
        console.log(message);
      },
      path: require('path').join(require('os').tmpdir(), 'sessions'),
    }),
    cookie: {
      secure: false,
      maxAge: 3600000,
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    },
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  res.locals.message = req.flash('message');
  res.locals.session = req.session.userid ? req.session : null;
  next();
});

app.use(express.static('public'));

// Rotas
app.use('/reminder', reminderRoutes);
app.use('/', authRoutes);
app.get('/', reminderController.showReminders);

// Conexão com o banco
conn
  .sync() // use isto em produção
   //.sync({ force: true }) 
  .then(() => {
    app.listen(3000, () => {
      console.log('Servidor rodando na porta 3000');
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);  
  });

  