const express = require('express');
const session = require('express-session');
const path = require('path');
const sessionFileStore = require('./sessionStore');

const authRoutes = require('./routes/auth');
const contactsRoutes = require('./routes/contacts');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = 3000;

// Configura EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware - ORDEM CORRETA
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// SESSÃO COM STORE PERSONALIZADO
const FileStore = sessionFileStore(session);

app.use(session({
  secret: 'segredo_muito_forte_altere_em_producao_12345',
  resave: true,
  saveUninitialized: true,
  store: new FileStore({ path: './sessions' }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true,
    secure: false
  }
}));

// Middleware de debug
app.use((req, res, next) => {
  console.log('=== SESSÃO DEBUG ===');
  console.log('URL:', req.url);
  console.log('Método:', req.method);
  console.log('Session ID:', req.sessionID);
  console.log('User:', req.session.user ? req.session.user.email : 'NÃO LOGADO');
  console.log('====================');
  next();
});

// Middleware para garantir que a sessão seja salva
app.use((req, res, next) => {
  if (req.session) {
    req.session._garbage = Date.now();
    req.session.touch && req.session.touch();
  }
  next();
});

// Middleware para views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Middleware de autenticação SIMPLIFICADO
const isAuthenticated = (req, res, next) => {
  console.log('🔐 Verificando autenticação...');
  
  if (req.session && req.session.user) {
    console.log('✅ Usuário autenticado:', req.session.user.email);
    return next();
  }
  
  console.log('❌ Usuário não autenticado - redirecionando');
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

// Rota de teste
app.get('/session-test', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    user: req.session.user,
    cookies: req.headers.cookie
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔍 Teste de sessão: http://localhost:${PORT}/session-test`);
});