const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('connect-flash');

const app = express();

const conn = require('./db/conn');

const Lembrete = require('./models/Reminder');
const User = require('./models/User');

// Importando as rotas
const reminderRoutes = require('./routes/reminderRoutes');
const authRoutes = require('./routes/authRoutes'); // Corrigido o nome da variável

// Importando os controllers
const reminderController = require('./controllers/ReminderController'); // Corrigido o caminho
const authControllers = require('./controllers/AuthController');

// Template engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(
  session({
    name: 'session',
    secret: 'segredo',
    resave: false,
    saveUninitialized: true,
    store: new FileStore({
      logFn: function (message) {
        console.log(message);
      },
      path: require('path').join(require('os').tmpdir(), 'sessions'),
    }),
    cookie: {
      secure: false,
      maxAge: 3600000, // 1 hora
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    },
  })
);

// Flash messages
app.use(flash());

// Public path
app.use(express.static('public'));

// Session disponível para as views
app.use((req, res, next) => {
  res.locals.session = req.session.userid ? req.session : null;
  next();
});

// Rotas
app.use('/reminder', reminderRoutes);
app.use('/', authRoutes);

app.get('/', reminderController.showReminders);


// Conexão com o banco de dados
 conn.sync({ force: true }) // cuidado: apaga tudo
//conn.sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('Servidor rodando na porta 3000');
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });
