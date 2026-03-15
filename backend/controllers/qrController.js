const QRCode = require('qrcode');
const Memorial = require('../models/Memorial');

// ── GET /api/qr/:slug ────────────────────────────────────────────────────────
// Genera y devuelve el QR del memorial como imagen PNG
const generarQR = async (req, res, next) => {
    try {
        const memorial = await Memorial.findOne({ slug: req.params.slug, activo: true });

        if (!memorial) {
            return res.status(404).json({ error: 'Memorial no encontrado' });
        }

        // URL que apunta a la vista pública del memorial
        const urlMemorial = `${process.env.FRONTEND_URL}/memorial/${memorial.slug}`;

        // Opciones de diseño del QR
        const opciones = {
            errorCorrectionLevel: 'H',     // Alta corrección de errores (permite logo encima)
            type: 'image/png',
            quality: 0.95,
            margin: 2,
            color: {
                dark: '#1a1a2e',             // Color oscuro del QR
                light: '#FFFFFF',            // Fondo blanco
            },
            width: 512,
        };

        // Generar QR como buffer PNG
        const qrBuffer = await QRCode.toBuffer(urlMemorial, opciones);

        res.set('Content-Type', 'image/png');
        res.set('Content-Disposition', `inline; filename="qr-${memorial.slug}.png"`);
        res.send(qrBuffer);
    } catch (error) {
        next(error);
    }
};

// ── GET /api/qr/:slug/data ───────────────────────────────────────────────────
// Devuelve el QR como string base64 (útil para el frontend)
const generarQRBase64 = async (req, res, next) => {
    try {
        const memorial = await Memorial.findOne({ slug: req.params.slug, activo: true });

        if (!memorial) {
            return res.status(404).json({ error: 'Memorial no encontrado' });
        }

        const urlMemorial = `${process.env.FRONTEND_URL}/memorial/${memorial.slug}`;

        const qrDataUrl = await QRCode.toDataURL(urlMemorial, {
            errorCorrectionLevel: 'H',
            margin: 2,
            color: { dark: '#1a1a2e', light: '#FFFFFF' },
            width: 512,
        });

        res.json({
            qr: qrDataUrl,
            url: urlMemorial,
            slug: memorial.slug,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { generarQR, generarQRBase64 };
