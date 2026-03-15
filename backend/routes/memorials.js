const express = require('express');
const router = express.Router();
const { protegerRuta } = require('../middleware/auth');
const { uploadFoto, uploadVideo, uploadMusica } = require('../middleware/cloudinaryUpload');
const {
    verificarLimiteFotos,
    verificarLimiteVideos,
    verificarDuracionVideo,
} = require('../middleware/uploadLimits');
const {
    crearMemorial,
    obtenerMemorialPorSlug,
    listarMisMemoriales,
    actualizarTema,
    agregarFotos,
    agregarVideo,
    subirMusica,
    eliminarFoto,
    actualizarMemorial,
    eliminarMemorial,
    actualizarFoto,
    actualizarVideo,
    eliminarVideo,
    eliminarMusica,
} = require('../controllers/memorialController');

// ── Rutas públicas ───────────────────────────────────────────────────────────
// GET /api/memorials/:slug → Vista pública del memorial (acceso vía QR)
router.get('/:slug', obtenerMemorialPorSlug);

// ── Rutas privadas (requieren token JWT) ─────────────────────────────────────
// GET /api/memorials → Lista mis memoriales
router.get('/', protegerRuta, listarMisMemoriales);

// POST /api/memorials → Crear un nuevo memorial
router.post('/', protegerRuta, crearMemorial);

// PUT /api/memorials/:id/theme → Cambiar tema/color del memorial
router.put('/:id/theme', protegerRuta, actualizarTema);

// POST /api/memorials/:id/photos → Subir fotos (máx 50 para free)
router.post(
    '/:id/photos',
    protegerRuta,
    uploadFoto.array('fotos', 50),       // multer procesa hasta 50 archivos
    verificarLimiteFotos,                 // verifica límite DESPUÉS de parsear
    agregarFotos
);

// POST /api/memorials/:id/videos → Subir un video (máx 10 para free)
router.post(
    '/:id/videos',
    protegerRuta,
    verificarLimiteVideos,               // verifica límite ANTES de subir
    uploadVideo.single('video'),
    verificarDuracionVideo,              // verifica duración DESPUÉS de subir
    agregarVideo
);

// POST /api/memorials/:id/music → Subir música de fondo
router.post(
    '/:id/music',
    protegerRuta,
    uploadMusica.single('musica'),
    subirMusica
);

// DELETE /api/memorials/:id/photos/:photoId → Eliminar una foto
router.delete('/:id/photos/:photoId', protegerRuta, eliminarFoto);

// PUT /api/memorials/:id → Actualizar información básica
router.put('/:id', protegerRuta, actualizarMemorial);

// DELETE /api/memorials/:id → Eliminar memorial
router.delete('/:id', protegerRuta, eliminarMemorial);

// PUT /api/memorials/:id/photos/:photoId → Actualizar foto
router.put('/:id/photos/:photoId', protegerRuta, actualizarFoto);

// PUT /api/memorials/:id/videos/:videoId → Actualizar video
router.put('/:id/videos/:videoId', protegerRuta, actualizarVideo);

// DELETE /api/memorials/:id/videos/:videoId → Eliminar video
router.delete('/:id/videos/:videoId', protegerRuta, eliminarVideo);

// DELETE /api/memorials/:id/music → Eliminar música
router.delete('/:id/music', protegerRuta, eliminarMusica);

module.exports = router;
