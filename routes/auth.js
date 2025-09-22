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


module.exports = router;