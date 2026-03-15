const Memorial = require('../models/Memorial');

const LIMITES = {
    free: { maxFotos: 50, maxVideos: 10, maxDuracionVideo: 5 * 60 },
    plata: { maxFotos: 200, maxVideos: 20, maxDuracionVideo: 15 * 60 },
    oro: { maxFotos: 9999, maxVideos: 50, maxDuracionVideo: 60 * 60 }, // "ilimitado" pero con un tope alto
};

/**
 * Verifica que el memorial no supere los límites de fotos
 * Agregar este middleware antes de la ruta de subida de fotos.
 */
const verificarLimiteFotos = async (req, res, next) => {
    try {
        const memorial = await Memorial.findById(req.params.id);

        if (!memorial) {
            return res.status(404).json({ error: 'Memorial no encontrado' });
        }

        const plan = memorial.plan || 'free';
        // Compatibilidad con el antiguo 'premium' si hay datos legacy
        if (plan === 'premium') return next(); 

        const limitesPlan = LIMITES[plan] || LIMITES.free;

        const fotosActuales = memorial.fotos.length;
        const fotosNuevas = req.files ? req.files.length : (req.file ? 1 : 0);

        if (fotosActuales + fotosNuevas > limitesPlan.maxFotos) {
            return res.status(429).json({
                error: `Límite alcanzado: el plan ${plan.toUpperCase()} permite subir máximo ${limitesPlan.maxFotos} fotos. Actualmente tienes ${fotosActuales}.`,
                limite: limitesPlan.maxFotos,
                actual: fotosActuales,
                upgrade: plan !== 'oro',
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Verifica que el memorial no supere los límites de videos
 * Agregar este middleware antes de la ruta de subida de videos.
 */
const verificarLimiteVideos = async (req, res, next) => {
    try {
        const memorial = await Memorial.findById(req.params.id);

        if (!memorial) {
            return res.status(404).json({ error: 'Memorial no encontrado' });
        }

        const plan = memorial.plan || 'free';
        if (plan === 'premium') return next(); 

        const limitesPlan = LIMITES[plan] || LIMITES.free;
        const videosActuales = memorial.videos.length;

        if (videosActuales >= limitesPlan.maxVideos) {
            return res.status(429).json({
                error: `Límite alcanzado: el plan ${plan.toUpperCase()} permite máximo ${limitesPlan.maxVideos} videos. Actualmente tienes ${videosActuales}.`,
                limite: limitesPlan.maxVideos,
                actual: videosActuales,
                upgrade: plan !== 'oro',
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Verifica que la duración del video no supere el límite del plan.
 * Se ejecuta DESPUÉS de subir el archivo a Cloudinary, usando req.file.duration.
 */
const verificarDuracionVideo = async (req, res, next) => {
    try {
        const memorial = await Memorial.findById(req.params.id);

        const plan = memorial?.plan || 'free';
        if (!memorial || plan === 'premium') return next();

        const limitesPlan = LIMITES[plan] || LIMITES.free;

        // Cloudinary devuelve la duración en req.file
        const duracion = req.file?.duration || 0;

        if (duracion > limitesPlan.maxDuracionVideo) {
            // Eliminar el video que ya fue subido a Cloudinary
            if (req.file?.public_id) {
                const { cloudinary } = require('./cloudinaryUpload');
                await cloudinary.uploader.destroy(req.file.public_id, { resource_type: 'video' });
            }

            return res.status(429).json({
                error: `Límite de duración: el plan ${plan.toUpperCase()} permite videos de máximo ${Math.round(limitesPlan.maxDuracionVideo / 60)} minutos. Tu video dura ${Math.round(duracion / 60)} min.`,
                limiteSeg: limitesPlan.maxDuracionVideo,
                duracionSeg: duracion,
                upgrade: plan !== 'oro',
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { verificarLimiteFotos, verificarLimiteVideos, verificarDuracionVideo };
