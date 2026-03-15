const User = require('../models/User');

const obtenerUsuarios = async (req, res, next) => {
    try {
        const usuarios = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(usuarios);
    } catch (error) {
        next(error);
    }
};

const actualizarPlan = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { plan, rol } = req.body;

        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (plan) usuario.plan = plan;
        if (rol) usuario.rol = rol;

        await usuario.save();

        res.json({ mensaje: 'Usuario actualizado exitosamente', usuario: { _id: usuario._id, nombre: usuario.nombre, plan: usuario.plan, rol: usuario.rol } });
    } catch (error) {
        next(error);
    }
};

const eliminarUsuario = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const usuario = await User.findById(userId);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Aquí podríamos también eliminar todos los memoriales asociados si quisiéramos.
        // Pero para este caso, solo borraremos al usuario y conservaremos su contenido o se podría depurar.
        await User.findByIdAndDelete(userId);

        res.json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};

module.exports = { obtenerUsuarios, actualizarPlan, eliminarUsuario };
