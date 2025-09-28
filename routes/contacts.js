const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const contactsFile = path.join(__dirname, '../data/contacts.json');

function loadContacts() {
  if (fs.existsSync(contactsFile)) {
    return JSON.parse(fs.readFileSync(contactsFile));
  }
  return [];
}

function saveContacts(contacts) {
  fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));
}

// Middleware específico para verificar sessão nas rotas de contatos
router.use((req, res, next) => {
  console.log('📞 ROTA CONTATOS - Usuário:', req.session.user ? req.session.user.email : 'NÃO LOGADO');
  next();
});

// Mostrar formulário de novo contato
router.get('/new', (req, res) => {
  res.render('newContact', { user: req.session.user });
});

// Salvar novo contato
router.post('/', (req, res) => {
  console.log('💾 SALVANDO CONTATO - Sessão:', req.session.user);
  
  const { name, phone } = req.body;
  let contacts = loadContacts();

  const newContact = {
    id: Date.now(),
    name,
    phone,
    user: req.session.user.email
  };

  contacts.push(newContact);
  saveContacts(contacts);

  res.redirect('/dashboard');
});

// Mostrar formulário de edição
router.get('/edit/:id', (req, res) => {
  console.log('✏️ EDITANDO CONTATO - Sessão:', req.session.user);
  
  const contacts = loadContacts();
  const contactId = parseInt(req.params.id);
  
  const contact = contacts.find(c => {
    const contactIdNum = typeof c.id === 'string' ? parseInt(c.id) : c.id;
    return contactIdNum === contactId && c.user === req.session.user.email;
  });

  if (!contact) {
    return res.redirect('/dashboard');
  }

  res.render('editContact', { user: req.session.user, contact });
});

// Atualizar contato
router.post('/update/:id', (req, res) => {
  console.log('🔄 ATUALIZANDO CONTATO - Sessão:', req.session.user);
  
  let contacts = loadContacts();
  const contactId = parseInt(req.params.id);

  contacts = contacts.map(c => {
    const contactIdNum = typeof c.id === 'string' ? parseInt(c.id) : c.id;
    if (contactIdNum === contactId && c.user === req.session.user.email) {
      return { ...c, name: req.body.name, phone: req.body.phone };
    }
    return c;
  });

  saveContacts(contacts);
  res.redirect('/dashboard');
});

// Excluir contato - VERSÃO SIMPLIFICADA
router.post('/delete/:id', (req, res) => {
  console.log('🗑️ EXCLUINDO CONTATO - Sessão:', req.session.user);
  console.log('ID do contato a excluir:', req.params.id);
  
  if (!req.session.user) {
    console.log('❌ SEM SESSÃO - Redirecionando para login');
    return res.redirect('/login');
  }

  let contacts = loadContacts();
  const contactId = parseInt(req.params.id);
  
  console.log('Contatos antes:', contacts.length);
  
  const initialLength = contacts.length;
  contacts = contacts.filter(c => {
    const contactIdNum = typeof c.id === 'string' ? parseInt(c.id) : c.id;
    const shouldKeep = !(contactIdNum === contactId && c.user === req.session.user.email);
    if (!shouldKeep) {
      console.log('✅ Encontrou contato para excluir:', c.name);
    }
    return shouldKeep;
  });

  console.log('Contatos depois:', contacts.length);
  
  if (contacts.length < initialLength) {
    saveContacts(contacts);
    console.log('✅ Contato excluído com sucesso');
  } else {
    console.log('❌ Contato não encontrado');
  }

  res.redirect('/dashboard');
});

module.exports = router;