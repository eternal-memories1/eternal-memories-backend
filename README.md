# 🕊️ Eternal Memories

Plataforma de memoriales digitales. Permite crear un memorial con fotos, videos y música, accesible mediante un código QR.

---

## Tabla de contenido

1. [Requisitos previos](#1-requisitos-previos)
2. [Clonar / abrir el proyecto](#2-abrir-el-proyecto)
3. [Configurar MongoDB Atlas](#3-configurar-mongodb-atlas)
4. [Configurar Cloudinary](#4-configurar-cloudinary)
5. [Crear el archivo .env del backend](#5-crear-el-archivo-env-del-backend)
6. [Ejecutar el Backend](#6-ejecutar-el-backend)
7. [Ejecutar el Frontend](#7-ejecutar-el-frontend)
8. [Rutas disponibles](#8-rutas-disponibles)

---

## 1. Requisitos previos

Antes de empezar, instala estas herramientas si no las tienes:

| Herramienta | Descarga |
|-------------|----------|
| Node.js (v18 o superior) | https://nodejs.org |
| npm (viene con Node.js) | incluido |
| Git (opcional) | https://git-scm.com |

Verifica que Node está instalado:

```bash
node -v   # debe mostrar v18.x o superior
npm -v    # debe mostrar 9.x o superior
```

---

## 2. Abrir el proyecto

La estructura del proyecto es:

```
qr_qdep/
├── backend/    ← API Node.js + Express
└── frontend/   ← App React + Vite
```

---

## 3. Configurar MongoDB Atlas

MongoDB Atlas es la base de datos gratuita en la nube. Sigue estos pasos:

### Paso a paso:

1. Ve a **https://www.mongodb.com/atlas** y crea una cuenta gratuita.
2. Haz clic en **"Build a Database"** → Elige el plan **Free (M0)**.
3. Selecciona un proveedor (AWS/GCP/Azure) y una región cercana → Haz clic en **Create**.
4. En la pantalla de seguridad:
   - **Username**: escribe un usuario (ej. `admin`)
   - **Password**: escribe una contraseña segura → guárdala
   - Haz clic en **Create User**
5. En **"Where would you like to connect from?"** → elige **"My Local Environment"** → en IP escribe `0.0.0.0/0` → haz clic en **Add Entry** → luego **Finish and Close**.
6. En el dashboard haz clic en **Connect** → **Drivers** → copia el string de conexión. Se verá así:

```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **Reemplaza `<password>`** con la contraseña que creaste en el paso 4, y agrega el nombre de la base de datos antes del `?`:

```
mongodb+srv://admin:TuPasswordAqui@cluster0.xxxxx.mongodb.net/eternal-memories?retryWrites=true&w=majority
```

> Ese es tu `MONGODB_URI`.

---

## 4. Configurar Cloudinary

Cloudinary almacena las fotos, videos y música del memorial.

### Paso a paso:

1. Ve a **https://cloudinary.com** → crea una cuenta gratuita (plan Free incluye 25 GB).
2. Una vez dentro, ve al **Dashboard** (pantalla principal).
3. Ahí encontrarás las 3 credenciales que necesitas:

| Variable | Dónde encontrarla en el Dashboard |
|----------|-----------------------------------|
| `CLOUDINARY_CLOUD_NAME` | Campo **"Cloud name"** |
| `CLOUDINARY_API_KEY` | Campo **"API Key"** |
| `CLOUDINARY_API_SECRET` | Campo **"API Secret"** (haz clic en el ojo para verlo) |

---

## 5. Crear el archivo `.env` del backend

En la carpeta `backend/`, crea un archivo llamado **`.env`** (sin extensión adicional) y pega lo siguiente reemplazando los valores:

```env
# ── Base de Datos ────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://admin:TuPassword@cluster0.xxxxx.mongodb.net/eternal-memories?retryWrites=true&w=majority

# ── Cloudinary ───────────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz

# ── JWT (puede ser cualquier texto largo y secreto) ──────────────────────────
JWT_SECRET=EsteEsUnSecretoMuyLargoYSeguro2024Eternal

# ── Servidor ─────────────────────────────────────────────────────────────────
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

> **💡 Tip para `JWT_SECRET`:** Puede ser cualquier cadena larga aleatoria. Por ejemplo, abre una terminal y ejecuta:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```
> Copia el resultado y úsalo como `JWT_SECRET`.

---

## 6. Ejecutar el Backend

Abre una terminal, navega a la carpeta `backend` e instala las dependencias:

```bash
cd backend
npm install --legacy-peer-deps
```

Luego inicia el servidor en modo desarrollo:

```bash
npm run dev
```

Deberías ver:

```
✅ Conectado a MongoDB
🚀 Servidor corriendo en http://localhost:5000
```

Puedes verificar que funciona abriendo en el navegador:

```
http://localhost:5000/api/health
```

Debe responder:
```json
{ "status": "OK", "message": "Eternal Memories API corriendo correctamente 🕊️" }
```

---

## 7. Ejecutar el Frontend

Abre **otra terminal** (deja la del backend corriendo), navega a `frontend` e instala dependencias:

```bash
cd frontend
npm install
```

Luego inicia el servidor de desarrollo:

```bash
npm run dev
```

Deberías ver:

```
VITE v5.x.x  ready in 359 ms
➜  Local:   http://localhost:5173/
```

Abre el navegador en **http://localhost:5173** para ver la plataforma.

---

## 8. Rutas disponibles

### Frontend

| URL | Descripción |
|-----|-------------|
| `http://localhost:5173/` | Landing page |
| `http://localhost:5173/registro` | Crear cuenta |
| `http://localhost:5173/login` | Iniciar sesión |
| `http://localhost:5173/dashboard` | Panel de control (requiere login) |
| `http://localhost:5173/memorial/:slug` | Vista pública del memorial (acceso QR) |

### Backend API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servidor |
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login → devuelve JWT |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| POST | `/api/memorials` | Crear memorial |
| GET | `/api/memorials` | Listar mis memoriales |
| GET | `/api/memorials/:slug` | Ver memorial público |
| PUT | `/api/memorials/:id/theme` | Cambiar tema |
| POST | `/api/memorials/:id/photos` | Subir fotos (máx 50) |
| POST | `/api/memorials/:id/videos` | Subir video (máx 10, 5 min) |
| POST | `/api/memorials/:id/music` | Subir música de fondo |
| GET | `/api/qr/:slug` | Imagen PNG del QR |
| GET | `/api/qr/:slug/data` | QR en formato base64 |

---

## Límites del Plan Gratuito

| Recurso | Límite |
|---------|--------|
| Fotos por memorial | 50 |
| Videos por memorial | 10 |
| Duración máxima por video | 5 minutos |

Los usuarios Premium no tienen restricciones.

---

## Stack Tecnológico

- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide React
- **Backend**: Node.js + Express.js
- **Base de datos**: MongoDB + Mongoose
- **Almacenamiento**: Cloudinary (fotos, videos, música)
- **Auth**: JWT + bcryptjs
- **QR**: qrcode (backend) + qrcode.react (frontend)
