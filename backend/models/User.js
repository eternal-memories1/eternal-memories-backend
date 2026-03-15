const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { type: String, required: true, minlength: 6 },

    // Plan del usuario
    plan: {
        type: String,
        enum: ['free', 'plata', 'oro'],
        default: 'free',
    },

    // Rol del usuario
    rol: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    // Lista de memoriales creados por este usuario
    memoriales: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Memorial' }],

    activo: { type: Boolean, default: true },
}, { timestamps: true });

// ── Hash de contraseña antes de guardar ──────────────────────────────────────
userSchema.pre('save', async function (next) {
    // Solo re-hashear si la contraseña fue modificada
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ── Método para comparar contraseñas ─────────────────────────────────────────
userSchema.methods.compararPassword = async function (passwordIngresado) {
    return await bcrypt.compare(passwordIngresado, this.password);
};

// No enviar la contraseña en las respuestas JSON
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
