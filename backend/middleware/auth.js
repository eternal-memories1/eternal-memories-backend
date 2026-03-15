const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware para proteger rutas que requieren autenticación JWT.
 */
const protegerRuta = async (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar el usuario en la base de datos
        const usuario = await User.findById(decoded.id).select('-password');

        if (!usuario || !usuario.activo) {
            return res.status(401).json({ error: 'No autorizado. Usuario no encontrado o inactivo.' });
        }

        req.usuario = usuario;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

/**
 * Middleware para comprobar si el usuario autenticado tiene rol 'admin'
 */
const isAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
}

module.exports = { protegerRuta, isAdmin };
