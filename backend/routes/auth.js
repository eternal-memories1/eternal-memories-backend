const express = require('express');
const router = express.Router();
const { protegerRuta } = require('../middleware/auth');
const { registrar, login, obtenerPerfil, loginGoogle } = require('../controllers/authController');

// POST /api/auth/register → Crear cuenta
router.post('/register', registrar);

// POST /api/auth/login → Iniciar sesión
router.post('/login', login);

// POST /api/auth/google → Iniciar sesión con Google
router.post('/google', loginGoogle);

// GET /api/auth/me → Perfil del usuario autenticado
router.get('/me', protegerRuta, obtenerPerfil);

module.exports = router;
