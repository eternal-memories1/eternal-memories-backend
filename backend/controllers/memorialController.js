const Memorial = require('../models/Memorial');
const User = require('../models/User');
const slugify = require('slugify');
const { cloudinary } = require('../middleware/cloudinaryUpload');

// ── Generar slug único ───────────────────────────────────────────────────────
const generarSlug = async (nombre, anioNacimiento, anioFallfecimiento) => {
    const base = slugify(`${nombre} ${anioNacimiento} ${anioFallfecimiento}`, {
        lower: true,
        strict: true,
        locale: 'es',
    });

    // Verificar si el slug ya existe y agregar sufijo numérico si es necesario
    let slug = base;
    let contador = 1;
    while (await Memorial.findOne({ slug })) {
        slug = `${base}-${contador}`;
        contador++;
    }
    return slug;
};

// ── POST /api/memorials ──────────────────────────────────────────────────────
// Crea un nuevo memorial
const crearMemorial = async (req, res, next) => {
    try {
        const { nombre, fechaNacimiento, fechaFallecimiento, biografia, tema, colorFondo } = req.body;

        const anioNac = new Date(fechaNacimiento).getFullYear();
        const anioFall = new Date(fechaFallecimiento).getFullYear();
        const slug = await generarSlug(nombre, anioNac, anioFall);

        const memorial = await Memorial.create({
            nombre,
            fechaNacimiento,
            fechaFallecimiento,
            biografia: biografia || '',
            slug,
            propietario: req.usuario._id,
            plan: req.usuario.plan,
            tema: tema || 'oscuro',
            colorFondo: colorFondo || '#1a1a2e',
        });

        // Agregar el memorial al usuario
        await User.findByIdAndUpdate(req.usuario._id, {
            $push: { memoriales: memorial._id },
        });

        res.status(201).json({ memorial, mensaje: 'Memorial creado exitosamente 🕊️' });
    } catch (error) {
        next(error);
    }
};

// ── GET /api/memorials/:slug ─────────────────────────────────────────────────
// Obtiene un memorial por su slug (vista pública)
const obtenerMemorialPorSlug = async (req, res, next) => {
    try {
        const memorial = await Memorial.findOne({
            slug: req.params.slug,
            activo: true,
        }).populate('propietario', 'plan'); // <- Traemos el plan del dueño para ocultar anuncios

        if (!memorial) {
            return res.status(404).json({ error: 'Memorial no encontrado' });
        }

        // Incrementar contador de visitas
        memorial.visitas += 1;
        await memorial.save();

        // Ordenar fotos y videos cronológicamente (antiguo → reciente) para el modo cine
        const fotosOrdenadas = [...memorial.fotos].sort(
            (a, b) => new Date(a.fecha || a.createdAt) - new Date(b.fecha || b.createdAt)
        );
        const videosOrdenados = [...memorial.videos].sort(
            (a, b) => new Date(a.fecha || a.createdAt) - new Date(b.fecha || b.createdAt)
        );

        const memorialObj = memorial.toObject();
        // Guardar el plan del propietario y eliminar el resto del objeto propietario por seguridad
        const propietarioPlan = memorialObj.propietario?.plan || 'free';
        delete memorialObj.propietario;

        res.json({ ...memorialObj, propietarioPlan, fotosOrdenadas, videosOrdenados });
    } catch (error) {
        next(error);
    }
};

// ── GET /api/memorials (mis memoriales) ─────────────────────────────────────
// Lista los memoriales del usuario autenticado
const listarMisMemoriales = async (req, res, next) => {
    try {
        const memoriales = await Memorial.find({ propietario: req.usuario._id }).sort({ createdAt: -1 });
        res.json({ memoriales, total: memoriales.length });
    } catch (error) {
        next(error);
    }
};

// ── PUT /api/memorials/:id/theme ─────────────────────────────────────────────
// Actualiza el tema visual del memorial
const actualizarTema = async (req, res, next) => {
    try {
        const { tema, colorFondo } = req.body;
        const memorial = await Memorial.findOne({ _id: req.params.id, propietario: req.usuario._id });

        if (!memorial) {
            return res.status(404).json({ error: 'Memorial no encontrado o no autorizado' });
        }

        if (tema) memorial.tema = tema;
        if (colorFondo) memorial.colorFondo = colorFondo;
        await memorial.save();

        res.json({ memorial, mensaje: 'Tema actualizado exitosamente' });
    } catch (error) {
        next(error);
    }
};

// ── POST /api/memorials/:id/photos ───────────────────────────────────────────
// Agrega una o varias fotos al memorial
const agregarFotos = async (req, res, next) => {
    try {
        const memorial = await Memorial.findOne({ _id: req.params.id, propietario: req.usuario._id });

        if (!memorial) {
            return res.status(404).json({ error: 'Memorial no encontrado o no autorizado' });
        }

        const archivos = req.files || (req.file ? [req.file] : []);

        const nuevasFotos = archivos.map((archivo, idx) => ({
            url: archivo.path,
            publicId: archivo.filename,
            titulo: req.body.titulos ? req.body.titulos[idx] : '',
            fecha: req.body.fechas ? new Date(req.body.fechas[idx]) : new Date(),
            orden: memorial.fotos.length + idx,
        }));

        memorial.fotos.push(...nuevasFotos);
        await memorial.save();

        res.status(201).json({
            fotos: nuevasFotos,
            totalFotos: memorial.fotos.length,
            mensaje: `${nuevasFotos.length} foto(s) agregada(s) exitosamente`,
        });
    } catch (error) {
        next(error);
    }
};

// ── POST /api/memorials/:id/videos ───────────────────────────────────────────
// Agrega un video al memorial
const agregarVideo = async (req, res, next) => {
    try {
        const memorial = await Memorial.findOne({ _id: req.params.id, propietario: req.usuario._id });

        if (!memorial) {
            return res.status(404).json({ error: 'Memorial no encontrado o no autorizado' });
        }

        const archivo = req.file;

        const nuevoVideo = {
            url: archivo.path,
            publicId: archivo.filename,
            titulo: req.body.titulo || '',
            duracion: archivo.duration || 0,
            fecha: req.body.fecha ? new Date(req.body.fecha) : new Date(),
            orden: memorial.videos.length,
        };

        memorial.videos.push(nuevoVideo);
        await memorial.save();

        res.status(201).json({
            video: nuevoVideo,
            totalVideos: memorial.videos.length,
            mensaje: 'Video agregado exitosamente',
        });
    } catch (error) {
        next(error);
    }
};

// ── POST /api/memorials/:id/music ────────────────────────────────────────────
// Sube la música de fondo del memorial
const subirMusica = async (req, res, next) => {
    try {
        const memorial = await Memorial.findOne({ _id: req.params.id, propietario: req.usuario._id });

        if (!memorial) {
            return res.status(404).json({ error: 'Memorial no encontrado o no autorizado' });
        }

        // Eliminar música anterior de Cloudinary si existe
        if (memorial.musicaPublicId) {
            await cloudinary.uploader.destroy(memorial.musicaPublicId, { resource_type: 'raw' });
        }

        memorial.musicaUrl = req.file.path;
        memorial.musicaPublicId = req.file.filename;
        memorial.musicaNombre = req.body.nombre || req.file.originalname;
        await memorial.save();

        res.json({ musicaUrl: memorial.musicaUrl, mensaje: 'Música actualizada exitosamente' });
    } catch (error) {
        next(error);
    }
};

// ── DELETE /api/memorials/:id/photos/:photoId ────────────────────────────────
// Elimina una foto específica
const eliminarFoto = async (req, res, next) => {
    try {
        const memorial = await Memorial.findOne({ _id: req.params.id, propietario: req.usuario._id });

        if (!memorial) {
            return res.status(404).json({ error: 'Memorial no encontrado o no autorizado' });
        }

        const foto = memorial.fotos.id(req.params.photoId);
        if (!foto) return res.status(404).json({ error: 'Foto no encontrada' });

        // Eliminar de Cloudinary
        await cloudinary.uploader.destroy(foto.publicId);
        memorial.fotos.pull(req.params.photoId);
        await memorial.save();

        res.json({ mensaje: 'Foto eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
};

// ── PUT /api/memorials/:id ───────────────────────────────────────────────────
// Actualiza la información básica del memorial
const actualizarMemorial = async (req, res, next) => {
    try {
        const { nombre, fechaNacimiento, fechaFallecimiento, biografia } = req.body;
        const memorial = await Memorial.findOne({ _id: req.params.id, propietario: req.usuario._id });

        if (!memorial) {
            return res.status(404).json({ error: 'Memorial no encontrado o no autorizado' });
        }

        if (nombre) memorial.nombre = nombre;
        if (fechaNacimiento) memorial.fechaNacimiento = new Date(fechaNacimiento);
        if (fechaFallecimiento) memorial.fechaFallecimiento = new Date(fechaFallecimiento);
        if (biografia !== undefined) memorial.biografia = biografia;
        
        await memorial.save();
        res.json({ memorial, mensaje: 'Memorial actualizado exitosamente' });
    } catch (error) {
        next(error);
    }
};

// ── DELETE /api/memorials/:id ────────────────────────────────────────────────
// Elimina un memorial completamente
const eliminarMemorial = async (req, res, next) => {
    try {
        const memorial = await Memorial.findOne({ _id: req.params.id, propietario: req.usuario._id });

        if (!memorial) {
            return res.status(404).json({ error: 'Memorial no encontrado o no autorizado' });
        }

        // Eliminar fotos
        for (const foto of memorial.fotos) {
            if (foto.publicId) await cloudinary.uploader.destroy(foto.publicId);
        }
        
        // Eliminar videos
        for (const video of memorial.videos) {
            if (video.publicId) await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
        }
        
        // Eliminar música
        if (memorial.musicaPublicId) {
            await cloudinary.uploader.destroy(memorial.musicaPublicId, { resource_type: 'raw' });
        }

        // Eliminar ref en usuario
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.usuario._id, {
            $pull: { memoriales: memorial._id }
        });

        await Memorial.findByIdAndDelete(memorial._id);
        
        res.json({ mensaje: 'Memorial eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};

// ── PUT /api/memorials/:id/photos/:photoId ──────────────────────────────────
const actualizarFoto = async (req, res, next) => {
    try {
        const memorial = await Memorial.findOne({ _id: req.params.id, propietario: req.usuario._id });
        if (!memorial) return res.status(404).json({ error: 'Memorial no encontrado' });

        const foto = memorial.fotos.id(req.params.photoId);
        if (!foto) return res.status(404).json({ error: 'Foto no encontrada' });

        const { titulo, fecha, orden } = req.body;
        if (titulo !== undefined) foto.titulo = titulo;
        if (fecha) foto.fecha = new Date(fecha);
        if (orden !== undefined) foto.orden = Number(orden);

        await memorial.save();
        res.json({ foto, mensaje: 'Foto actualizada' });
    } catch (error) {
        next(error);
    }
};

// ── PUT /api/memorials/:id/videos/:videoId ──────────────────────────────────
const actualizarVideo = async (req, res, next) => {
    try {
        const memorial = await Memorial.findOne({ _id: req.params.id, propietario: req.usuario._id });
        if (!memorial) return res.status(404).json({ error: 'Memorial no encontrado' });

        const video = memorial.videos.id(req.params.videoId);
        if (!video) return res.status(404).json({ error: 'Video no encontrado' });

        const { titulo, fecha, orden, duracion } = req.body;
        if (titulo !== undefined) video.titulo = titulo;
        if (fecha) video.fecha = new Date(fecha);
        if (orden !== undefined) video.orden = Number(orden);
        if (duracion !== undefined) video.duracion = Number(duracion);

        await memorial.save();
        res.json({ video, mensaje: 'Video actualizado' });
    } catch (error) {
        next(error);
    }
};

// ── DELETE /api/memorials/:id/videos/:videoId ────────────────────────────────
const eliminarVideo = async (req, res, next) => {
    try {
        const memorial = await Memorial.findOne({ _id: req.params.id, propietario: req.usuario._id });
        if (!memorial) return res.status(404).json({ error: 'Memorial no encontrado' });

        const video = memorial.videos.id(req.params.videoId);
        if (!video) return res.status(404).json({ error: 'Video no encontrado' });

        if (video.publicId) {
            await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
        }
        
        memorial.videos.pull(req.params.videoId);
        await memorial.save();
        
        res.json({ mensaje: 'Video eliminado' });
    } catch (error) {
        next(error);
    }
};

// ── DELETE /api/memorials/:id/music ──────────────────────────────────────────
const eliminarMusica = async (req, res, next) => {
    try {
        const memorial = await Memorial.findOne({ _id: req.params.id, propietario: req.usuario._id });
        if (!memorial) return res.status(404).json({ error: 'Memorial no encontrado' });

        if (memorial.musicaPublicId) {
            await cloudinary.uploader.destroy(memorial.musicaPublicId, { resource_type: 'raw' });
        }

        memorial.musicaUrl = '';
        memorial.musicaPublicId = '';
        memorial.musicaNombre = '';
        await memorial.save();

        res.json({ mensaje: 'Música eliminada' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
};
