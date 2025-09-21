const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

// Configura EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({extended: true})); // Ler dados de formulários
app.use(express.static(path.join(__dirname, 'public')));

// Configuração de sessão
app.use(session({
    secret: 'umsegredoseguro',
    resave: false,
    saveUninitialized: false
}));
    
// Rota inicial (teste)
app.get('/', (req, res) => {
  res.send('Servidor rodando!');
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});