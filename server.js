const express = require('express');
const session = require('express-session');
const path = require('path');
const sessionFileStore = require('./sessionStore');

const authRoutes = require('./routes/auth');
const contactsRoutes = require('./routes/contacts');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = 3000;

// Configura EJS - SIMPLES E QUE FUNCIONA
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sessão
const FileStore = sessionFileStore(session);
app.use(session({
  secret: 'segredo_muito_forte_altere_em_producao_12345',
  resave: true,
  saveUninitialized: true,
  store: new FileStore({ path: './sessions' }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false
  }
}));

// Middleware para views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Middleware de autenticação
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
};

// Rotas
app.use('/', authRoutes);
app.use('/dashboard', isAuthenticated, dashboardRoutes);
app.use('/contacts', isAuthenticated, contactsRoutes);

// Rota inicial
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});