# 🎨 Univote Frontend

#### 3. Configurar el Frontend

<div align="center">

```bash

**Interfaz de usuario para el Sistema de Votaciones Universitarias**cd Frontend

npm install

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)

[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=flat&logo=vite)](https://vitejs.dev/)# Iniciar el servidor de desarrollo

[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)npm run dev

```

[Inicio Rápido](#-instalación) • [Configuración](#-configuración) • [Estructura](#-estructura-del-proyecto) • [Scripts](#-scripts-disponibles)

El frontend estará disponible en `http://localhost:5173`

</div>

### Instalación con Docker

---

```bash

## 📖 Descripcióncd Backend

docker-compose up -d

Frontend moderno y responsivo para Univote, construido con React 19 y Vite. Proporciona interfaces intuitivas para administradores, candidatos y votantes, con autenticación JWT y gestión de estado mediante Context API.```



---Esto iniciará tanto la base de datos PostgreSQL como el backend de la aplicación.



## ✨ Características Principales## 📚 Documentación Adicional



- ✅ **Autenticación JWT** con interceptores AxiosPara información detallada sobre cada componente del proyecto:

- ✅ **Interfaces por rol** (Admin, Candidato, Votante)

- ✅ **Diseño responsivo** para todos los dispositivos- [📖 Documentación del Backend](./Backend/README.md)

- ✅ **Componentes Material Tailwind**- [📖 Documentación del Frontend](./Frontend/README.md)

- ✅ **Gestión de elecciones** completa

- ✅ **Sistema de notificaciones** en tiempo real## 🗄️ Modelo de Datos

- ✅ **Exportación a PDF** de resultados

- ✅ **Subida de archivos** (fotos de candidatos)El sistema maneja las siguientes entidades principales:



---- **Administrador**: Gestiona el sistema y las elecciones

- **Voter (Votante)**: Usuarios con derecho a voto

## 🚀 Instalación- **Candidate (Candidato)**: Usuarios postulados a elecciones

- **Election (Elección)**: Procesos electorales

```bash- **Vote (Voto)**: Registro de votos emitidos

# 1. Navegar a la carpeta- **Proposal (Propuesta)**: Propuestas de campaña de los candidatos

cd Frontend- **Career (Carrera)**: Carreras académicas

- **Role (Rol)**: Roles del sistema

# 2. Instalar dependencias- **Result (Resultado)**: Resultados de las elecciones

npm install

## 🔐 Roles y Permisos

# 3. Configurar variables de entorno

cp .env.example .env### Administrador



# 4. Iniciar servidor de desarrollo- Crear y gestionar elecciones

npm run dev- Aprobar o rechazar candidatos

```- Gestionar votantes

- Iniciar y cerrar votaciones

**URL:** http://localhost:5173- Consultar resultados



---### Votante



## 🔧 Configuración- Registrarse en el sistema

- Ver elecciones disponibles

### Variables de Entorno (`.env`)- Emitir voto (una vez por elección)

- Consultar candidatos y propuestas

```bash- Ver resultados

# URL del Backend API

VITE_API_URL=http://localhost:3000### Candidato

```

- Registrarse como candidato

**⚠️ Importante:** - Postularse a elecciones

- Variables en Vite **deben** tener prefijo `VITE_`- Crear y gestionar propuestas

- Reinicia el servidor después de cambiar variables- Ver resultados de elecciones



Para más detalles, consulta [ENV_VARIABLES.md](../ENV_VARIABLES.md)## 🛠️ Stack Tecnológico



---### Backend



## 📂 Estructura del Proyecto- NestJS 11

- TypeScript 5

```- Prisma 6

Frontend/- PostgreSQL 15

├── public/- Bcrypt

│   ├── img/                   # Imágenes estáticas- Axios

│   └── videos/                # Videos- Express

├── src/

│   ├── api/### Frontend

│   │   └── axios.js          # Config Axios + interceptores

│   ├── assets/               # Recursos- React 19

│   ├── components/           # Componentes reutilizables- Vite 7

│   │   ├── Navbar.jsx- React Router DOM 7

│   │   └── NotificacionesCandidato.jsx- Tailwind CSS 4

│   ├── context/              # Context API- Material Tailwind

│   │   └── AuthContext.jsx- Axios

│   ├── pages/                # Páginas- jsPDF

│   │   ├── Login.jsx

│   │   ├── Administrador.jsx### Herramientas de Desarrollo

│   │   ├── Candidato.jsx

│   │   ├── Votante.jsx- ESLint

│   │   └── ...- Prettier

│   ├── App.jsx               # Componente raíz- Jest (Testing)

│   ├── main.jsx              # Punto de entrada- Docker

│   └── index.css             # Estilos globales- Git

└── package.json

```## 📝 Scripts Disponibles



---### Backend



## 🛠️ Scripts Disponibles```bash

npm run start:dev      # Modo desarrollo

| Script | Comando | Descripción |npm run build          # Compilar proyecto

|--------|---------|-------------|npm run start:prod     # Modo producción

| Dev | `npm run dev` | Servidor de desarrollo |npm run test           # Ejecutar tests

| Build | `npm run build` | Build de producción |npm run lint           # Linter

| Preview | `npm run preview` | Previsualizar build |```

| Lint | `npm run lint` | ESLint |

### Frontend

---

```bash

## 🎨 Tecnologíasnpm run dev            # Modo desarrollo

npm run build          # Compilar para producción

- **React 19** - Biblioteca UInpm run preview        # Previsualizar build

- **Vite 7** - Build tool y dev server  npm run lint           # Linter

- **React Router DOM 7** - Enrutamiento```

- **Tailwind CSS 4** - Framework CSS
- **Material Tailwind 3** - Componentes UI
- **Axios 1.7** - Cliente HTTP
- **jsPDF** - Generación de PDFs

---

## 🔐 Autenticación

### Login Unificado

```javascript
import api from '../api/axios';

const response = await api.post('/api/auth/login', {
  correo: 'admin@univote.com',
  contrasena: 'admin123'
});

// Guardar token
localStorage.setItem('token', response.data.token);
```

### Peticiones Protegidas

```javascript
// El interceptor añade automáticamente el token JWT
const voters = await api.get('/voters');
```

---

## 🗺️ Rutas Principales

| Ruta | Componente | Rol Requerido |
|------|-----------|---------------|
| `/` | Login | Público |
| `/administrador` | Administrador | Admin |
| `/candidato` | Candidato | Candidato |
| `/votante` | Votante | Votante |
| `/gestionar-votantes` | Gestionar_votantes | Admin |
| `/ver-candidatos` | Ver_candidatos_adm | Admin |

---

## 💾 LocalStorage

El Frontend almacena en `localStorage`:

```javascript
// Token JWT
token

// Rol
userRole: 'admin' | 'candidate' | 'voter'

// Datos del usuario
adminData, candidateData, voterData

// IDs
adminId, candidateId, voterId
```

---

## 🚀 Despliegue

```bash
# 1. Configurar producción
echo "VITE_API_URL=https://api.univote.com" > .env.production

# 2. Build
npm run build

# 3. Los archivos estarán en /dist
```

---

## 📚 Documentación Adicional

- [README Principal](../README.md)
- [Guía de Instalación](../INSTALLATION.md)
- [Variables de Entorno](../ENV_VARIABLES.md)
- [Backend README](../Backend/README.md)

---

**Última actualización:** Noviembre 2024
