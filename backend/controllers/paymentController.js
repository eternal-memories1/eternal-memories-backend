const { MercadoPagoConfig, Preference } = require('mercadopago');
const User = require('../models/User');
const Memorial = require('../models/Memorial');

// Configuración de Mercado Pago
const MP_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const client = new MercadoPagoConfig({
    accessToken: MP_TOKEN || 'TEST-0000000000000-000000-00000000000000000000000000000000-000000000',
});

// Precios de los planes (en USD o moneda local según configures tu cuenta MP)
const PRECIOS = {
    plata: 2,
    oro: 10
};

// ── POST /api/payments/create-preference ─────────────────────────────────────
// Crea la preferencia de pago paraCheckout Pro de MP
const crearPreferencia = async (req, res, next) => {
    try {
        const { planId } = req.body;
        const usuarioId = req.usuario._id; // Usuario autenticado

        if (!['plata', 'oro'].includes(planId)) {
            return res.status(400).json({ error: 'Plan no válido' });
        }

        const precio = PRECIOS[planId];
        const host = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Estructura requerida por Mercado Pago v2
        const body = {
            items: [
                {
                    id: `plan_${planId}`,
                    title: `Suscripción Plan ${planId.toUpperCase()} - Eternal Memories`,
                    description: `Acceso al plan ${planId} para tus memoriales`,
                    quantity: 1,
                    unit_price: Number(precio),
                    currency_id: 'USD', // Ajustar según región, ej: 'ARS', 'MXN', 'COP'
                }
            ],
            payer: {
                email: req.usuario.email,
                name: req.usuario.nombre,
            },
            back_urls: {
                success: `${host}/dashboard?pago=success`,
                failure: `${host}/dashboard?pago=failure`,
                pending: `${host}/dashboard?pago=pending`
            },
            auto_return: 'approved',
            // En metadata enviamos información útil para identificar al usuario cuando MP avise (Webhook)
            metadata: {
                usuario_id: usuarioId.toString(),
                plan: planId
            },
            statement_descriptor: 'ETERNAL MEMORIES',
            // notification_url: '[TU_TUNNEL_NGROK_AQUI]/api/payments/webhook' // <- Requiere HTTPS (ngrok/Vercel)
        };

        // Si no se han configurado llaves reales de Mercado Pago, usamos modo de simulación
        if (!MP_TOKEN || MP_TOKEN.includes('TEST-0000')) {
            console.log("🟡 [SIMULACIÓN LOCAL] MP_ACCESS_TOKEN no configurado. Simulando pago exitoso y actualizando plan.");
            
            // Actualizar plan inmediatamente ya que no habrá Webhook
            await User.findByIdAndUpdate(usuarioId, { plan: planId });
            await Memorial.updateMany({ propietario: usuarioId }, { plan: planId });

            return res.json({ 
                id: 'mock-preference-id', 
                init_point: body.back_urls.success, 
                sandbox_init_point: body.back_urls.success 
            });
        }

        const preference = new Preference(client);
        const result = await preference.create({ body });

        // Retornar el ID para Checkout Bricks o init_point para redirigir
        res.json({ id: result.id, init_point: result.init_point, sandbox_init_point: result.sandbox_init_point });
    } catch (error) {
        console.error('Error creando preferencia MP:', error);
        res.status(500).json({ error: 'Error al generar link de pago' });
    }
};

// ── POST /api/payments/webhook ───────────────────────────────────────────────
// Recibe las notificaciones de Mercado Pago (IPN o Webhooks)
const manejarWebhook = async (req, res, next) => {
    try {
        const { type, data } = req.body;

        // MP avisa de un pago
        if (type === 'payment') {
            const { Payment } = require('mercadopago');
            const pagoId = data.id;

            // Consultar el estado del pago en MP
            const paymentClient = new Payment(client);
            const pagoInfo = await paymentClient.get({ id: pagoId });

            if (pagoInfo.status === 'approved') {
                const usuarioId = pagoInfo.metadata.usuario_id;
                const nuevoPlan = pagoInfo.metadata.plan;

                // 1. Actualizar el plan del usuario
                await User.findByIdAndUpdate(usuarioId, { plan: nuevoPlan });

                // 2. Actualizar el plan en todos sus memoriales existentes
                await Memorial.updateMany(
                    { propietario: usuarioId },
                    { plan: nuevoPlan }
                );

                console.log(`✅ Pago aprobado. Usuario ${usuarioId} ahora es ${nuevoPlan}.`);
            }
        }

        // MP requiere que respondamos con 200 OK inmediatamente
        res.status(200).send('Webhook recibido');
    } catch (error) {
        console.error('Error en Webhook MP:', error);
        res.status(500).send('Error');
    }
};

module.exports = { crearPreferencia, manejarWebhook };
