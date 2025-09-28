const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');

const router = express.Router();
const usersFile = path.join(__dirname, '../data/users.json');

// Páginas de login e registro
router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

// Registro
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile));
  }

  const userExists = users.find(u => u.email === email);
  if (userExists) {
    return res.send('Usuário já cadastrado!');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.redirect('/login');
});

// LOGIN - Versão ultra simplificada
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let users = [];
    if (fs.existsSync(usersFile)) {
      users = JSON.parse(fs.readFileSync(usersFile));
    }

    const user = users.find(u => u.email === email);
    if (!user) return res.send('Usuário não encontrado!');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Senha incorreta!');

    // SALVAR NA SESSÃO
    req.session.user = { 
      email: user.email,
      id: user.id || Date.now()
    };

    console.log('🔐 LOGIN: Usuário salvo na sessão');

    // Redirecionar IMEDIATAMENTE
    res.redirect('/dashboard');

  } catch (error) {
    console.error('Erro no login:', error);
    res.send('Erro no sistema');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;