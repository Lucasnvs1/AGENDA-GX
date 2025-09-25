const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// caminho do JSON de contatos
const contactsFile = path.join(__dirname, '../data/contacts.json');

// rota protegida para o dashboard
router.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // se não tiver logado, volta pro login
    }

    // carrega contatos
    let contacts = [];
    if (fs.existsSync(contactsFile)) {
        contacts = JSON.parse(fs.readFileSync(contactsFile));
    }

    res.render('dashboard', { 
        user: req.session.user, 
        contacts: contacts 
    });
});

module.exports = router;
