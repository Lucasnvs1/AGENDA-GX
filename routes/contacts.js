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

    // filtrar apenas os contatos do usuário logado
    const userContacts = contacts.filter(c => c.user === req.session.user.email);

    res.render('dashboard', { 
        user: req.session.user, 
        contacts: userContacts 
    });
});

// mostrar formulário para novo contato
router.get('/contacts/new', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('newContact');
});

// salvar novo contato
router.post('/contacts', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { name, phone } = req.body;

    // carregar contato existente
    let contacts = [];
    if (fs.existsSync(contactsFile)) {
        contacts = JSON.parse(fs.readFileSync(contactsFile));
    }

    // adicionar novo contato
    contacts.push({ name, phone, user: req.session.user.email });

    // salva no JSON
    fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));

    res.redirect('/dashboard');
});


module.exports = router;
