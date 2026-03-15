require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Memorial = require('./models/Memorial');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI no está definido en el archivo .env');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB para seed'))
    .catch(err => {
        console.error('❌ Error al conectar a MongoDB:', err.message);
        process.exit(1);
    });

const seedData = async () => {
    try {
        // Limpiar base de datos (Opcional, útil para no duplicar datos durante pruebas)
        console.log('🧹 Limpiando colecciones User y Memorial...');
        await User.deleteMany();
        await Memorial.deleteMany();

        // 1. Crear usuario de prueba
        const adminUser = new User({
            nombre: 'Admin Prueba',
            email: 'admin@prueba.com',
            password: 'password123', // La contraseña será hasheada automáticamente por el pre('save')
            plan: 'oro',
            rol: 'admin',
            activo: true
        });
        await adminUser.save();
        console.log('👤 Usuario de prueba creado (email: admin@prueba.com | pass: password123)');

        // 2. Crear memoriales de prueba
        const memorial1 = new Memorial({
            nombre: 'Carlos Gardel',
            fechaNacimiento: new Date('1890-12-11'),
            fechaFallecimiento: new Date('1935-06-24'),
            biografia: 'Cantante, compositor y actor de cine. Es el más conocido representante del género en la historia del tango. Iniciador y máximo exponente del tango canción.',
            slug: 'carlos-gardel-1890-1935',
            propietario: adminUser._id,
            plan: 'oro',
            fotos: [
                {
                    url: 'https://images.unsplash.com/photo-1544813545-4827b64fcacb?auto=format&fit=crop&q=80',
                    publicId: 'seed_foto_1',
                    titulo: 'Paisaje de paz',
                    fecha: new Date('1930-05-12'),
                    orden: 1,
                },
                {
                    url: 'https://images.unsplash.com/photo-1516584281358-1f14849ba8ad?auto=format&fit=crop&q=80',
                    publicId: 'seed_foto_2',
                    titulo: 'Una vela por ti',
                    fecha: new Date('1932-01-11'),
                    orden: 2,
                },
                {
                    url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80',
                    publicId: 'seed_foto_3',
                    titulo: 'Flores',
                    fecha: new Date('1934-02-10'),
                    orden: 3,
                }
            ],
            videos: [
                {
                    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                    publicId: 'seed_video_1',
                    titulo: 'Recuerdos compartidos',
                    duracion: 15,
                    fecha: new Date('1935-01-01'),
                    orden: 1,
                }
            ],
            musicaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            musicaPublicId: 'seed_musica_1',
            musicaNombre: 'Melodía de Paz',
            tema: 'sepia',
            colorFondo: '#2c1e16',
            activo: true,
            visitas: 1250,
        });

        const memorial2 = new Memorial({
            nombre: 'María Silva (Ejemplo Familiar)',
            fechaNacimiento: new Date('1950-08-15'),
            fechaFallecimiento: new Date('2023-11-02'),
            biografia: 'Una madre ejemplar, amiga leal, amante de la naturaleza y los viajes. Siempre te recordaremos con una sonrisa. Descansa en paz.',
            slug: 'maria-silva-1950-2023',
            propietario: adminUser._id,
            plan: 'free',
            fotos: [
                {
                    url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&q=80',
                    publicId: 'seed_foto_4',
                    titulo: 'Atardecer en la montaña',
                    fecha: new Date('2020-01-15'),
                    orden: 1,
                },
                {
                    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80',
                    publicId: 'seed_foto_5',
                    titulo: 'Camino a la cima',
                    fecha: new Date('2021-03-22'),
                    orden: 2,
                }
            ],
            videos: [],
            musicaUrl: '',
            musicaPublicId: '',
            musicaNombre: '',
            tema: 'oscuro',
            colorFondo: '#1a1a2e',
            activo: true,
            visitas: 42,
        });

        await memorial1.save();
        await memorial2.save();
        console.log('🕊️ Memoriales creados: /carlos-gardel-1890-1935 y /maria-silva-1950-2023');
        
        // Asignar memoriales al usuario
        adminUser.memoriales.push(memorial1._id, memorial2._id);
        await adminUser.save();

        console.log('✅ Base de datos poblada exitosamente con datos de prueba.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando el seed:', error);
        process.exit(1);
    }
};

seedData();
