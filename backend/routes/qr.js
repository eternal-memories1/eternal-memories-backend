const express = require('express');
const router = express.Router();
const { generarQR, generarQRBase64 } = require('../controllers/qrController');

// GET /api/qr/:slug → Imagen PNG del QR del memorial
router.get('/:slug', generarQR);

// GET /api/qr/:slug/data → QR en formato base64 JSON (para el frontend)
router.get('/:slug/data', generarQRBase64);

module.exports = router;
