const express = require('express');
const router = express.Router();
const { crearPreferencia, manejarWebhook } = require('../controllers/paymentController');
const { protegerRuta } = require('../middleware/auth');

// POST /api/payments/create-preference → Crea el link de pago para el usuario logueado
router.post('/create-preference', protegerRuta, crearPreferencia);

// POST /api/payments/webhook → Recibe las notificaciones de estado de Mercado Pago
router.post('/webhook', manejarWebhook);

module.exports = router;
