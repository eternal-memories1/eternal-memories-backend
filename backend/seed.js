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

        // 1. Crear usuario ADMIN
        const adminUser = new User({
            nombre: 'Jherson Admin',
            email: 'admin@eternalmemories.com',
            password: 'jhersonadmin2024', // La contraseña será hasheada automáticamente por el pre('save')
            plan: 'oro',
            rol: 'admin',
            activo: true
        });
        await adminUser.save();
        console.log('👤 CUENTA ADMIN creada:');
        console.log('   📧 Email: admin@eternalmemories.com');
        console.log('   🔐 Contraseña: jhersonadmin2024');
        console.log('   📊 Plan: ORO | Rol: ADMIN');

        // 2. Crear usuario de prueba/ejemplo
        const testUser = new User({
            nombre: 'Usuario De Prueba',
            email: 'prueba@eternalmemories.com',
            password: 'prueba123456',
            plan: 'plata',
            rol: 'user',
            activo: true
        });
        await testUser.save();
        console.log('\n👤 CUENTA DE PRUEBA creada:');
        console.log('   📧 Email: prueba@eternalmemories.com');
        console.log('   🔐 Contraseña: prueba123456');
        console.log('   📊 Plan: PLATA | Rol: USER');

        // 3. Crear MEMORIAL DEMO (Principal)
        const memorialDemo = new Memorial({
            nombre: 'Memorial Demo - Juan Pérez García',
            fechaNacimiento: new Date('1945-05-10'),
            fechaFallecimiento: new Date('2024-01-15'),
            biografia: 'Juan fue un apasionado por la vida, amante de la música, los viajes y la naturaleza. Dejó un legado de amor y sabiduría a su familia. Su risa contagiosa y su gran corazón permanecerán en nuestros recuerdos por siempre. Fue padre de tres hijos, abuelo de cinco nietos y esposo devoto durante 52 años.',
            slug: 'memorial-demo-juan-perez',
            propietario: adminUser._id,
            plan: 'oro',
            fotos: [
                {
                    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80',
                    publicId: 'seed_demo_foto_1',
                    titulo: 'Retrato en familia',
                    fecha: new Date('2010-06-15'),
                    orden: 1,
                },
                {
                    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80',
                    publicId: 'seed_demo_foto_2',
                    titulo: 'Juan en sus mejores años',
                    fecha: new Date('2015-08-20'),
                    orden: 2,
                },
                {
                    url: 'https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?auto=format&fit=crop&q=80',
                    publicId: 'seed_demo_foto_3',
                    titulo: 'Una sonrisa memorable',
                    fecha: new Date('2018-12-25'),
                    orden: 3,
                },
                {
                    url: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?auto=format&fit=crop&q=80',
                    publicId: 'seed_demo_foto_4',
                    titulo: 'Con los nietos',
                    fecha: new Date('2022-07-10'),
                    orden: 4,
                }
            ],
            videos: [
                {
                    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                    publicId: 'seed_demo_video_1',
                    titulo: 'Recuerdos en video',
                    duracion: 120,
                    fecha: new Date('2023-11-01'),
                    orden: 1,
                }
            ],
            musicaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
            musicaPublicId: 'seed_demo_musica_1',
            musicaNombre: 'Melodía de Paz Eterna',
            tema: 'sepia',
            colorFondo: '#5a4a42',
            activo: true,
            visitas: 2150,
        });

        // 4. Crear memorial de ejemplo 2 (Carlos Gardel)
        const memorial2 = new Memorial({
            nombre: 'Carlos Gardel - La Voz del Tango',
            fechaNacimiento: new Date('1890-12-11'),
            fechaFallecimiento: new Date('1935-06-24'),
            biografia: 'Cantante, compositor y actor de cine. Es el más conocido representante del género tango en la historia. Iniciador y máximo exponente del tango canción. Su legado perdura a través de sus emblemáticas canciones que trascienden generaciones.',
            slug: 'carlos-gardel-tango-legend',
            propietario: adminUser._id,
            plan: 'oro',
            fotos: [
                {
                    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80',
                    publicId: 'seed_gardel_foto_1',
                    titulo: 'El Rey del Tango',
                    fecha: new Date('1920-03-15'),
                    orden: 1,
                },
                {
                    url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80',
                    publicId: 'seed_gardel_foto_2',
                    titulo: 'En el escenario',
                    fecha: new Date('1925-07-20'),
                    orden: 2,
                },
                {
                    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80',
                    publicId: 'seed_gardel_foto_3',
                    titulo: 'Una leyenda viviente',
                    fecha: new Date('1932-11-10'),
                    orden: 3,
                }
            ],
            videos: [],
            musicaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            musicaPublicId: 'seed_gardel_musica_1',
            musicaNombre: 'Volver',
            tema: 'oscuro',
            colorFondo: '#1a1a2e',
            activo: true,
            visitas: 4320,
        });

        // 5. Crear memorial de ejemplo 3 (María Silva - ejemplo familiar)
        const memorial3 = new Memorial({
            nombre: 'María Silva Rodríguez',
            fechaNacimiento: new Date('1950-08-15'),
            fechaFallecimiento: new Date('2023-11-02'),
            biografia: 'Una madre ejemplar, amiga leal, amante de la naturaleza y los viajes. Siempre te recordaremos con una sonrisa en nuestros corazones. Su calidez, generosidad y amor incondicional iluminaron la vida de todos quienes la conocieron. Descansa en paz en el jardín eterno.',
            slug: 'maria-silva-1950-2023-family',
            propietario: testUser._id,
            plan: 'plata',
            fotos: [
                {
                    url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&q=80',
                    publicId: 'seed_maria_foto_1',
                    titulo: 'En el atardecer',
                    fecha: new Date('2018-05-20'),
                    orden: 1,
                },
                {
                    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80',
                    publicId: 'seed_maria_foto_2',
                    titulo: 'En la naturaleza',
                    fecha: new Date('2020-08-15'),
                    orden: 2,
                }
            ],
            videos: [],
            musicaUrl: '',
            musicaPublicId: '',
            musicaNombre: '',
            tema: 'aurora',
            colorFondo: '#4a5f8f',
            activo: true,
            visitas: 350,
        });

        // 6. Crear memorial de ejemplo 4 (Fernando Luis - historia más reciente)
        const memorial4 = new Memorial({
            nombre: 'Fernando Luis Martínez',
            fechaNacimiento: new Date('1960-02-28'),
            fechaFallecimiento: new Date('2024-03-10'),
            biografia: 'Ingeniero, innovador y soñador. Fernando fue un profesional dedicado que siempre buscó mejorar el mundo a través de la tecnología y la educación. Sus estudiantes y colegas lo recuerdan por su paciencia, sabiduría y pasión por enseñar. Dejó un mundo mejor que como lo encontró.',
            slug: 'fernando-luis-martinez-engineer',
            propietario: adminUser._id,
            plan: 'oro',
            fotos: [
                {
                    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80',
                    publicId: 'seed_fernando_foto_1',
                    titulo: 'Fernando en su despacho',
                    fecha: new Date('2014-09-12'),
                    orden: 1,
                },
                {
                    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80',
                    publicId: 'seed_fernando_foto_2',
                    titulo: 'En conferencia',
                    fecha: new Date('2019-04-05'),
                    orden: 2,
                },
                {
                    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80',
                    publicId: 'seed_fernando_foto_3',
                    titulo: 'Con su familia',
                    fecha: new Date('2023-07-20'),
                    orden: 3,
                }
            ],
            videos: [
                {
                    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    publicId: 'seed_fernando_video_1',
                    titulo: 'Testimonio de sus logros',
                    duracion: 180,
                    fecha: new Date('2024-02-15'),
                    orden: 1,
                }
            ],
            musicaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            musicaPublicId: 'seed_fernando_musica_1',
            musicaNombre: 'Himno a la Vida',
            tema: 'claro',
            colorFondo: '#e8e8e8',
            activo: true,
            visitas: 1680,
        });

        // 7. Guardar todos los memorials en la base de datos
        await memorialDemo.save();
        await memorial2.save();
        await memorial3.save();
        await memorial4.save();
        
        console.log('\n🕊️ MEMORIALS DE EJEMPLO creados:');
        console.log('   ✅ /memorial-demo-juan-perez (PRINCIPAL - Plan ORO) - 2150 visitas');
        console.log('   ✅ /carlos-gardel-tango-legend (Plan ORO) - 4320 visitas');
        console.log('   ✅ /maria-silva-1950-2023-family (Plan PLATA - Usuario de Prueba) - 350 visitas');
        console.log('   ✅ /fernando-luis-martinez-engineer (Plan ORO) - 1680 visitas');
        
        // 8. Asignar memorials a los usuarios
        adminUser.memoriales.push(memorialDemo._id, memorial2._id, memorial4._id);
        testUser.memoriales.push(memorial3._id);
        
        await adminUser.save();
        await testUser.save();

        console.log('\n✅ BASE DE DATOS POBLADA EXITOSAMENTE EN PRODUCCIÓN');
        console.log('\n' + '='.repeat(60));
        console.log('📋 RESUMEN DE DATOS:');
        console.log('='.repeat(60));
        console.log('\n👥 USUARIOS CREADOS:');
        console.log('   1. ADMIN');
        console.log('      📧 admin@eternalmemories.com');
        console.log('      🔐 jhersonadmin2024');
        console.log('      📊 Plan: ORO | Rol: ADMIN');
        console.log('      🕊️ Memorials: 3\n');
        console.log('   2. USUARIO DE PRUEBA');
        console.log('      📧 prueba@eternalmemories.com');
        console.log('      🔐 prueba123456');
        console.log('      📊 Plan: PLATA | Rol: USER');
        console.log('      🕊️ Memorials: 1\n');
        console.log('🕊️ MEMORIALS:', 4);
        console.log('   • Memorial Demo Juan Pérez (Demo Principal)');
        console.log('   • Carlos Gardel - La Voz del Tango');
        console.log('   • María Silva Rodríguez');
        console.log('   • Fernando Luis Martínez');
        console.log('\n' + '='.repeat(60) + '\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando el seed:', error);
        process.exit(1);
    }
};

seedData();
