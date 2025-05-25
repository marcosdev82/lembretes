const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('connect-flash');

const app = express();

const conn = require('./db/conn');

// Template engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Receber resposta da body
app.use(
    express.urlencoded({
        extended: true,
    }),
);

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
            path: require('path').join(
                require('os').tmpdir(),
                'sessions',
            ),
        }),
        cookie: {
            secure: false,
            maxAge: 3600000, // 1 dia
            expires: new Date(Date.now() + 3600000),
            httpOnly: true,
        },
    })
);

// Flash messages
app.use(flash());

// Public path
app.use(express.static('public'));

// set session to res   
app.use((req, res, next) => {
    if (req.session.userid) {
        res.locals.session = req.session;
    } else {
        res.locals.session = null;
    }
    next();
});

conn.sync()
    .then(() => {
        app.listen(3000, () => {
            console.log('Servidor rodando na porta 3000');
        });
    })
    .catch((err) => {
        console.error('Erro ao conectar ao banco de dados:', err);
    });
