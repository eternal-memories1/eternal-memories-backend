const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verificación de reCAPTCHA - REMOVIDO TEMPORALMENTE
// Anteriormente la función verificarRecaptcha procesaba aquí el token de Google

// ── Función auxiliar para generar el JWT ─────────────────────────────────────
const generarToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });

// ── POST /api/auth/register ──────────────────────────────────────────────────
const registrar = async (req, res, next) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Verificar si el email ya existe
        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) {
            return res.status(409).json({ error: 'El email ya está registrado' });
        }

        const usuario = await User.create({ nombre, email, password });
        const token = generarToken(usuario._id);

        res.status(201).json({ usuario, token, mensaje: 'Registro exitoso' });
    } catch (error) {
        next(error);
    }
};

// ── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
        }

        const usuario = await User.findOne({ email, activo: true });

        if (!usuario || !(await usuario.compararPassword(password))) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const token = generarToken(usuario._id);
        res.json({ usuario, token, mensaje: 'Login exitoso' });
    } catch (error) {
        next(error);
    }
};

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
const obtenerPerfil = async (req, res) => {
    res.json({ usuario: req.usuario });
};

// ── POST /api/auth/google ────────────────────────────────────────────────────
const loginGoogle = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token de Google requerido' });

        // Verificar el token con Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { email, name, sub } = payload; // sub es el ID único del usuario en Google

        // Buscar si el usuario ya existe en nuestra base de datos
        let usuario = await User.findOne({ email });

        if (!usuario) {
            // Generar una contraseña aleatoria robusta ya que el login será vía Google
            const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
            usuario = await User.create({ 
                nombre: name, 
                email, 
                password: randomPassword 
            });
        }

        if (!usuario.activo) {
            return res.status(403).json({ error: 'Esta cuenta ha sido desactivada' });
        }

        const jwtToken = generarToken(usuario._id);
        res.json({ usuario, token: jwtToken, mensaje: 'Google Login exitoso' });

    } catch (error) {
        console.error("Error en Google Login:", error);
        res.status(401).json({ error: 'Error verificando el token de Google' });
    }
};

module.exports = { registrar, login, obtenerPerfil, loginGoogle };
