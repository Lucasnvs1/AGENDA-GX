// middleware/authMiddleware.js

function isAuthenticated(req, res, next) {
    console.log('🔐 Verificando autenticação...');
    console.log('Sessão:', req.session);
    console.log('Usuário na sessão:', req.session.user);
    
    if (req.session && req.session.user) {
        console.log('✅ Usuário autenticado:', req.session.user.email);
        return next();
    }
    
    console.log('❌ Usuário não autenticado - redirecionando para login');
    res.redirect('/login');
}

module.exports = isAuthenticated;