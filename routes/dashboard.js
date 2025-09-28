const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const contactsFile = path.join(__dirname, '../data/contacts.json');

// Dashboard protegido
router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  // Carregar contatos
  let contacts = [];
  if (fs.existsSync(contactsFile)) {
    contacts = JSON.parse(fs.readFileSync(contactsFile));
  }

  // Filtrar contatos do usuário logado
  const userContacts = contacts.filter(c => c.user === req.session.user.email);

  res.render('dashboard', {
    user: req.session.user,
    contacts: userContacts
  });
});

module.exports = router;
