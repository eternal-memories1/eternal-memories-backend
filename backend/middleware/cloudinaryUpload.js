const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ── Configurar Cloudinary con las credenciales del .env ──────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Storage para fotos ───────────────────────────────────────────────────────
const storageFotos = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'eternal-memories/fotos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 1920, height: 1080, crop: 'limit', quality: 'auto' }],
    },
});

// ── Storage para videos ──────────────────────────────────────────────────────
const storageVideos = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'eternal-memories/videos',
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
    },
});

// ── Storage para música ──────────────────────────────────────────────────────
const storageMusica = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'eternal-memories/musica',
        resource_type: 'raw',
        allowed_formats: ['mp3', 'wav', 'ogg', 'aac'],
    },
});

// ── Exportar los upload handlers de multer ───────────────────────────────────
const uploadFoto = multer({
    storage: storageFotos,
    limits: { fileSize: 10 * 1024 * 1024 }, // máximo 10 MB por foto
});

const uploadVideo = multer({
    storage: storageVideos,
    limits: { fileSize: 500 * 1024 * 1024 }, // máximo 500 MB por video
});

const uploadMusica = multer({
    storage: storageMusica,
    limits: { fileSize: 20 * 1024 * 1024 }, // máximo 20 MB
});

module.exports = { cloudinary, uploadFoto, uploadVideo, uploadMusica };
