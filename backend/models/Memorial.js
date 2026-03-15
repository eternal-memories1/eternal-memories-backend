const mongoose = require('mongoose');

// ── Schema de fotos ──────────────────────────────────────────────────────────
const fotoSchema = new mongoose.Schema({
    url: { type: String, required: true },           // URL de Cloudinary
    publicId: { type: String, required: true },      // ID en Cloudinary (para borrar)
    titulo: { type: String, default: '' },
    fecha: { type: Date },                           // Fecha de la foto (para orden cronológico)
    orden: { type: Number, default: 0 },
}, { timestamps: true });

// ── Schema de videos ─────────────────────────────────────────────────────────
const videoSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    titulo: { type: String, default: '' },
    duracion: { type: Number, default: 0 },          // Duración en segundos
    fecha: { type: Date },
    orden: { type: Number, default: 0 },
}, { timestamps: true });

// ── Schema principal del memorial ────────────────────────────────────────────
const memorialSchema = new mongoose.Schema({
    // Información del difunto
    nombre: { type: String, required: true, trim: true },
    fechaNacimiento: { type: Date, required: true },
    fechaFallecimiento: { type: Date, required: true },
    biografia: { type: String, default: '', maxlength: 2000 },

    // Identificador único para la URL pública (ej: "juan-perez-1940-2020")
    slug: { type: String, required: true, unique: true, lowercase: true },

    // Dueño del memorial
    propietario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // Plan: limita cantidad de archivos
    plan: {
        type: String,
        enum: ['free', 'plata', 'oro'],
        default: 'free',
    },

    // Medios (límites: 50 fotos, 10 videos para free)
    fotos: { type: [fotoSchema], default: [] },
    videos: { type: [videoSchema], default: [] },

    // Música de fondo (URL de Cloudinary o URL externa)
    musicaUrl: { type: String, default: '' },
    musicaPublicId: { type: String, default: '' },
    musicaNombre: { type: String, default: '' },

    // Personalización visual
    tema: {
        type: String,
        enum: ['oscuro', 'claro', 'sepia', 'aurora'],
        default: 'oscuro',
    },
    colorFondo: { type: String, default: '#1a1a2e' }, // Color hexadecimal

    // Visibilidad
    activo: { type: Boolean, default: true },
    visitas: { type: Number, default: 0 },
}, { timestamps: true });

// Índice para búsquedas por slug
memorialSchema.index({ slug: 1 });

module.exports = mongoose.model('Memorial', memorialSchema);
