const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');

const router = express.Router();

// caminho para o arquivo JSON
const usersFile = path.join(__dirname, '../data/users.json');

// renderizar páginas
router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

// processar registros de usuários
router.post('/register', async (req, res) => {
    const { email, password } = req.body;


    // carregar usuários existentes
    const users = JSON.parse(fs.readFileSync(usersFile));


    // verificar se ja existe
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.send('Usuário já cadastrado!');
    }

    // criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // adicionar novo usuário
    users.push({ email, password: hashedPassword });

    // salvar no JSON

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));


    res.send('Usuário registrado com sucesso!');

});

// processar login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // carregar usuários
    const users = JSON.parse(fs.readFileSync(usersFile));

    // procurar usuário
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.send('Usuário não encontrado!');
    }

    // verificar senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.send('Senha incorreta!');
    }

    // salvar na sessão
    req.session.user = { email: user.email };

    // redirecionar para dashboard
    res.redirect('/dashboard');
});


// middleware para proteger rotas
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

// // rota do dashboard (protegida)
// router.get('/dashboard', isAuthenticated, (req, res) => {
//     res.render('dashboard', { user: req.session.user });
// });

// // rota protegida (dashboard)
// router.get('/dashboard', isAuthenticated, (req, res) => {
//     res.render('dashboard', { user: req.session.user });
// });

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;