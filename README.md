# 🗳️ Univote - Sistema de Votaciones Universitarias

<div align="center">

![Univote Logo](./Frontend/public/img/logo.png)

**Plataforma integral para la gestión de procesos electorales universitarios**

[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?style=flat&logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)

[Documentación](#-documentación) •
[Instalación](#-instalación-rápida) •
[Características](#-características-principales) •
[Tecnologías](#-stack-tecnológico) •
[Licencia](#-licencia)

</div>

---

## 📖 Descripción

**Univote** es una plataforma completa de votación electrónica diseñada específicamente para entornos universitarios. Permite administrar procesos electorales de manera segura, transparente y eficiente, garantizando la integridad del voto y facilitando la participación democrática estudiantil.

### 🎯 Objetivos del Sistema

- **Democratización:** Facilitar la participación estudiantil en procesos electorales
- **Transparencia:** Garantizar resultados verificables y audítables
- **Seguridad:** Proteger la integridad del voto mediante autenticación JWT
- **Accesibilidad:** Interfaz intuitiva para todos los roles de usuario
- **Escalabilidad:** Arquitectura preparada para crecer con las necesidades institucionales

---

## ✨ Características Principales

### 🔐 Sistema Multi-Rol con Autenticación JWT

- **Administradores:** Gestión completa de elecciones, candidatos y sistema
- **Candidatos:** Postulación, creación de propuestas y seguimiento de resultados
- **Votantes:** Consulta de elecciones, candidatos y emisión de voto

### 🗳️ Gestión de Elecciones

- ✅ Creación y configuración de procesos electorales
- ✅ Definición de fechas de inicio y cierre
- ✅ Validación automática de requisitos para iniciar votación
- ✅ Cierre automático y generación de resultados
- ✅ Estadísticas en tiempo real

### 👥 Gestión de Candidatos

- ✅ Proceso de postulación con validación
- ✅ Sistema de aprobación/rechazo de candidatos
- ✅ Subida de foto de perfil
- ✅ Notificaciones de estado de candidatura
- ✅ Gestión de propuestas de campaña

### 🎯 Sistema de Propuestas

- ✅ Creación y edición de propuestas
- ✅ Activación/desactivación de propuestas
- ✅ Visualización organizada por elección
- ✅ Control de propuestas activas por candidato

### 🗳️ Proceso de Votación

- ✅ Emisión de voto único por elección
- ✅ Soporte para "Voto en Blanco"
- ✅ Validación de elegibilidad del votante
- ✅ Registro seguro y anónimo del voto
- ✅ Prevención de doble votación

### 📊 Resultados y Estadísticas

- ✅ Conteo automático de votos
- ✅ Resultados por candidato
- ✅ Gráficas y visualizaciones
- ✅ Exportación de resultados
- ✅ Dashboard de estadísticas

### 🔔 Sistema de Notificaciones

- ✅ Notificaciones de aprobación/rechazo de candidatura
- ✅ Alertas de eventos importantes
- ✅ Historial de notificaciones
- ✅ Marcado de leídas/no leídas

---

## 🚀 Instalación Rápida

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 15+
- npm 9+
- Git

### Instalación en 5 Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/laurayepes23/proyecto-univote-a.git
cd proyecto-univote-a

# 2. Crear base de datos PostgreSQL
psql -U postgres -c "CREATE DATABASE \"Univote\";"

# 3. Configurar y ejecutar Backend
cd Backend
npm install
cp .env.example .env.local
# Editar .env.local con tus configuraciones
npx prisma migrate dev
npm run db:seed
npm run start:dev

# 4. En otra terminal, configurar Frontend
cd Frontend
npm install
cp .env.example .env
npm run dev

# 5. Abrir en navegador
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# Swagger Docs: http://localhost:3000/docs
```

**📚 Para instalación detallada paso a paso, consulta:** [INSTALLATION.md](./INSTALLATION.md)

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| **[INSTALLATION.md](./INSTALLATION.md)** | 🚀 Guía completa de instalación y configuración |
| **[Backend/README.md](./Backend/README.md)** | 📖 Documentación técnica del Backend (NestJS + Prisma) |
| **[Frontend/README.md](./Frontend/README.md)** | 🎨 Documentación del Frontend (React + Vite) |
| **[CHANGELOG.md](./CHANGELOG.md)** | 📝 Historial de cambios y versiones |
| **[RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md)** | 📊 Resumen ejecutivo del proyecto |

### 🔍 Documentación API

La documentación interactiva de la API está disponible a través de Swagger:

**URL:** http://localhost:3000/docs

Características de Swagger:
- Exploración interactiva de todos los endpoints
- Prueba de peticiones directamente desde el navegador
- Esquemas de datos detallados
- Autenticación JWT integrada
- Ejemplos de request/response

---

## 🛠️ Stack Tecnológico

### Backend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **NestJS** | 11.0 | Framework backend Node.js |
| **TypeScript** | 5.0 | Lenguaje de programación |
| **Prisma ORM** | 6.0 | ORM para PostgreSQL |
| **PostgreSQL** | 15+ | Base de datos relacional |
| **JWT** | - | Autenticación y autorización |
| **Bcrypt** | 6.0 | Hash de contraseñas |
| **Passport** | 11.0 | Estrategias de autenticación |
| **Swagger** | 11.0 | Documentación API |
| **Multer** | - | Subida de archivos |
| **Nodemailer** | - | Envío de emails |

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **React** | 19.0 | Biblioteca UI |
| **Vite** | 7.0 | Build tool y dev server |
| **React Router** | 7.0 | Enrutamiento |
| **Tailwind CSS** | 4.0 | Framework CSS |
| **Material Tailwind** | 3.0 | Componentes UI |
| **Axios** | 1.7 | Cliente HTTP |
| **jsPDF** | - | Generación de PDFs |

### Herramientas de Desarrollo

- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Jest** - Testing unitario
- **Supertest** - Testing E2E
- **Docker** - Containerización (opcional)
- **Git** - Control de versiones

---

## 📂 Estructura del Proyecto

```
proyecto-univote-a/
├── Backend/                    # Servidor NestJS
│   ├── src/
│   │   ├── administrators/     # Módulo de administradores
│   │   ├── auth/              # Autenticación JWT
│   │   ├── candidates/        # Módulo de candidatos
│   │   ├── careers/           # Carreras académicas
│   │   ├── elections/         # Gestión de elecciones
│   │   ├── email/             # Servicio de correo
│   │   ├── notications/       # Sistema de notificaciones
│   │   ├── proposals/         # Propuestas de candidatos
│   │   ├── results/           # Resultados de elecciones
│   │   ├── role/              # Roles del sistema
│   │   ├── voters/            # Módulo de votantes
│   │   ├── votes/             # Gestión de votos
│   │   ├── prisma/            # Servicio Prisma
│   │   └── main.ts            # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de base de datos
│   │   ├── migrations/        # Migraciones de DB
│   │   └── seed.ts            # Datos iniciales
│   ├── test/                  # Tests E2E
│   ├── uploads/               # Archivos subidos
│   └── package.json
│
├── Frontend/                   # Aplicación React
│   ├── src/
│   │   ├── api/               # Configuración Axios
│   │   ├── assets/            # Recursos estáticos
│   │   ├── components/        # Componentes reutilizables
│   │   ├── context/           # Context API de React
│   │   ├── pages/             # Páginas/Rutas
│   │   ├── App.jsx            # Componente raíz
│   │   └── main.jsx           # Punto de entrada
│   ├── public/
│   │   ├── img/               # Imágenes
│   │   └── videos/            # Videos
│   └── package.json
│
├── UnivoteMobile/             # App móvil React Native (WIP)
│
├── INSTALLATION.md            # Guía de instalación
├── CHANGELOG.md               # Historial de cambios
└── README.md                  # Este archivo
```

---

## 🗄️ Modelo de Datos

### Entidades Principales

```
Administrador
├── Gestiona Elecciones
└── Aprueba/Rechaza Candidatos

Election (Elección)
├── Tiene múltiples Candidatos
├── Tiene múltiples Votantes
├── Tiene múltiples Propuestas
├── Tiene múltiples Votos
└── Genera Resultados

Candidate (Candidato)
├── Pertenece a una Carrera
├── Tiene un Rol
├── Crea Propuestas
├── Recibe Votos
└── Recibe Notificaciones

Voter (Votante)
├── Pertenece a una Carrera
├── Tiene un Rol
└── Emite Votos

Vote (Voto)
├── Asociado a Votante
├── Asociado a Candidato
└── Asociado a Elección

Proposal (Propuesta)
├── Pertenece a Candidato
└── Asociada a Elección

Career (Carrera)
├── Agrupa Votantes
└── Agrupa Candidatos

Role (Rol)
├── Define permisos
└── Asigna tipo de usuario
```

---

## 👥 Roles y Permisos

### 🔑 Administrador

**Permisos:**
- ✅ Crear, editar y eliminar elecciones
- ✅ Aprobar o rechazar candidatos
- ✅ Gestionar votantes (activar/desactivar)
- ✅ Iniciar y cerrar votaciones
- ✅ Consultar resultados y estadísticas
- ✅ Administrar carreras y roles
- ✅ Acceso completo al sistema

**Credenciales por defecto:**
- Email: `admin@univote.com`
- Contraseña: `admin123`

### 🎓 Candidato

**Permisos:**
- ✅ Postularse a elecciones
- ✅ Crear y gestionar propuestas
- ✅ Subir foto de perfil
- ✅ Ver estado de candidatura
- ✅ Recibir notificaciones
- ✅ Consultar resultados

**Estados:**
- `Pendiente` - En espera de aprobación
- `Aprobado` - Puede participar en elecciones
- `Rechazado` - Candidatura rechazada

### 🗳️ Votante

**Permisos:**
- ✅ Ver elecciones disponibles
- ✅ Consultar candidatos y propuestas
- ✅ Emitir voto (una vez por elección)
- ✅ Ver resultados de elecciones cerradas

**Estados:**
- `Activo` - Puede votar
- `Inactivo` - No puede votar

---

## 🔒 Seguridad

### Implementado

- ✅ **Autenticación JWT:** Tokens seguros con expiración configurable
- ✅ **Hash de contraseñas:** Bcrypt con factor de costo 10
- ✅ **Validación de datos:** class-validator en todos los DTOs
- ✅ **Guards de autorización:** Verificación de roles en endpoints protegidos
- ✅ **CORS configurado:** Solo orígenes autorizados
- ✅ **Sanitización de inputs:** Prevención de inyección SQL
- ✅ **BigInt handling:** Manejo seguro de números grandes

### Recomendaciones para Producción

- 🔐 Cambiar `JWT_SECRET` a valor aleatorio fuerte
- 🔐 Implementar rate limiting en endpoints de login
- 🔐 Usar HTTPS en todas las comunicaciones
- 🔐 Implementar refresh tokens para sesiones largas
- 🔐 Añadir Helmet para headers de seguridad
- 🔐 Configurar backups automáticos de base de datos
- 🔐 Implementar logging y monitoreo de seguridad

---

## 🧪 Testing

### Backend

```bash
cd Backend

# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Tests Implementados

- ✅ Login de administrador
- ✅ Login de candidato
- ✅ Login de votante
- ✅ Endpoints protegidos
- ✅ Validación de roles
- ✅ Aprobación de candidatos

---

## 📦 Scripts Disponibles

### Backend

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Inicia servidor en modo desarrollo |
| `npm run dev:local` | Migra DB + Seed + Desarrollo |
| `npm run build` | Compila TypeScript |
| `npm run start:prod` | Ejecuta versión de producción |
| `npm run lint` | ESLint con auto-fix |
| `npm run format` | Formateo con Prettier |
| `npm run db:seed` | Ejecuta seed de base de datos |
| `npm run test:e2e` | Tests end-to-end |

### Frontend

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint |

---

## 🌱 Datos Iniciales (Seed)

El script de seed (`npm run db:seed`) crea:

### Roles (3)
- ADMINISTRADOR
- CANDIDATO
- VOTANTE

### Carreras (5)
- Ingeniería de Sistemas
- Ingeniería Industrial
- Administración de Empresas
- Contaduría Pública
- Diseño Gráfico

### Usuarios de Prueba

**1 Administrador:**
- `admin@univote.com` / `admin123`

**10 Votantes:**
- `juan.perez@estudiante.univote.com` / `voter123`
- `maria.gonzalez@estudiante.univote.com` / `voter123`
- ... (ver INSTALLATION.md para lista completa)

**10 Candidatos:**
- `roberto.sanchez@candidato.univote.com` / `candidate123`
- `laura.jimenez@candidato.univote.com` / `candidate123`
- ... (ver INSTALLATION.md para lista completa)

---

## 🐳 Docker

### Iniciar con Docker Compose

```bash
cd Backend
docker-compose up -d
```

### Servicios Incluidos

- **Backend:** NestJS en puerto 3000
- **PostgreSQL:** Base de datos en puerto 5432
- **pgAdmin:** Administración de DB en puerto 5050

### Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Resetear todo (incluyendo datos)
docker-compose down -v
```

---

## 📊 Estado del Proyecto

### ✅ Completado

- [x] Sistema de autenticación JWT multi-rol
- [x] Gestión completa de elecciones
- [x] Módulo de candidatos con aprobación
- [x] Sistema de propuestas
- [x] Proceso de votación
- [x] Resultados y estadísticas
- [x] Sistema de notificaciones
- [x] Documentación Swagger
- [x] Tests E2E básicos
- [x] Frontend responsivo
- [x] Seed de datos iniciales

### 🚧 En Desarrollo

- [ ] Aplicación móvil (UnivoteMobile)
- [ ] Tests unitarios completos
- [ ] Internacionalización (i18n)
- [ ] Modo oscuro en Frontend

### 📋 Roadmap Futuro

- [ ] Dashboard de analytics avanzado
- [ ] Sistema de auditoría completo
- [ ] Exportación de resultados en múltiples formatos
- [ ] Notificaciones push
- [ ] Verificación en dos pasos (2FA)
- [ ] Integración con sistemas universitarios
- [ ] API pública para integraciones
- [ ] Panel de monitoreo en tiempo real

---

## 🤝 Contribución

Este es un proyecto privado en desarrollo. Si eres parte del equipo:

1. Crea una rama feature: `git checkout -b feature/nueva-caracteristica`
2. Haz commit de tus cambios: `git commit -m 'Add: nueva característica'`
3. Push a la rama: `git push origin feature/nueva-caracteristica`
4. Abre un Pull Request

### Convenciones de Commits

- `Add:` Nueva funcionalidad
- `Fix:` Corrección de bug
- `Update:` Actualización de código existente
- `Docs:` Cambios en documentación
- `Style:` Formateo, sin cambios de código
- `Refactor:` Refactorización de código
- `Test:` Añadir o actualizar tests
- `Chore:` Tareas de mantenimiento

---

## 📝 Changelog

Ver [CHANGELOG.md](./CHANGELOG.md) para el historial completo de cambios.

### Última Versión (Noviembre 2024)

- ✨ Implementación de autenticación JWT unificada
- ✨ Sistema de notificaciones para candidatos
- 🐛 Corrección de errores de ESLint
- 📚 Documentación completa de instalación
- 🔧 Mejoras en configuración de ambiente

---

## 🆘 Soporte y Problemas

### Problemas Comunes

Consulta [INSTALLATION.md](./INSTALLATION.md#solución-de-problemas-comunes) para soluciones a:
- Errores de Prisma
- Problemas de conexión a PostgreSQL
- Errores de CORS
- Problemas con puertos ocupados
- Y más...

### Recursos

- 📖 [Documentación de NestJS](https://docs.nestjs.com/)
- 📖 [Documentación de Prisma](https://www.prisma.io/docs/)
- 📖 [Documentación de React](https://react.dev/)
- 📖 [Documentación de Vite](https://vitejs.dev/)

---

## 👨‍💻 Autores

**Equipo Univote**

- Desarrollo Backend: Sistema de votaciones con NestJS
- Desarrollo Frontend: Interfaz React
- Arquitectura: Diseño de base de datos con Prisma

---

## 📄 Licencia

Este proyecto es software privado (UNLICENSED). 

Código de uso interno únicamente. Para despliegue público, evaluar adopción de licencia apropiada.

---

## 🙏 Agradecimientos

- NestJS por el excelente framework backend
- Prisma por facilitar el manejo de base de datos
- React y Vite por el desarrollo frontend moderno
- La comunidad open source por las herramientas utilizadas

---

<div align="center">

**Univote** - Democratizando la participación estudiantil

Hecho con ❤️ por el equipo Univote

[⬆️ Volver arriba](#-univote---sistema-de-votaciones-universitarias)

</div>
