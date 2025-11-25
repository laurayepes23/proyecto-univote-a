# 🚀 Guía de Instalación y Configuración - Univote

Esta guía te ayudará a configurar y ejecutar el proyecto Univote en un entorno local desde cero.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación Rápida](#instalación-rápida)
3. [Configuración Detallada del Backend](#configuración-detallada-del-backend)
4. [Configuración del Frontend](#configuración-del-frontend)
5. [Base de Datos y Migraciones](#base-de-datos-y-migraciones)
6. [Datos de Prueba (Seed)](#datos-de-prueba-seed)
7. [Ejecución del Proyecto](#ejecución-del-proyecto)
8. [Verificación de la Instalación](#verificación-de-la-instalación)
9. [Solución de Problemas Comunes](#solución-de-problemas-comunes)
10. [Despliegue con Docker](#despliegue-con-docker)

---

## ✅ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### Software Requerido

| Software | Versión Mínima | Comando de Verificación |
|----------|----------------|------------------------|
| **Node.js** | 18.x o superior | `node --version` |
| **npm** | 9.x o superior | `npm --version` |
| **PostgreSQL** | 15.x o superior | `psql --version` |
| **Git** | 2.x | `git --version` |

### Instalación de Requisitos

#### Windows

1. **Node.js**: Descarga desde [nodejs.org](https://nodejs.org/)
2. **PostgreSQL**: Descarga desde [postgresql.org](https://www.postgresql.org/download/windows/)
   - Durante la instalación, recuerda la contraseña del usuario `postgres`
   - Puerto por defecto: `5432`
3. **Git**: Descarga desde [git-scm.com](https://git-scm.com/)

#### macOS

```bash
# Usando Homebrew
brew install node
brew install postgresql@15
brew install git

# Iniciar PostgreSQL
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian)

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Git
sudo apt-get install git
```

---

## 🚀 Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone https://github.com/laurayepes23/proyecto-univote-a.git
cd proyecto-univote-a
```

### 2. Crear Base de Datos

Abre una terminal de PostgreSQL:

```bash
# Windows (como administrador)
psql -U postgres

# Linux/macOS
sudo -u postgres psql
```

Ejecuta los siguientes comandos SQL:

```sql
-- Crear base de datos
CREATE DATABASE "Univote";

-- Verificar creación
\l

-- Salir
\q
```

### 3. Configurar Backend

```bash
cd Backend

# Instalar dependencias
npm install

# Copiar archivo de ejemplo de variables de entorno
cp .env.example .env.local

# Editar .env.local con tus configuraciones
# (ver sección de configuración detallada)
```

### 4. Configurar Frontend

```bash
cd ../Frontend

# Instalar dependencias
npm install

# Copiar archivo de ejemplo
cp .env.example .env

# El archivo .env ya viene con la configuración correcta por defecto
```

### 5. Ejecutar Migraciones y Seed

```bash
cd ../Backend

# Aplicar migraciones de base de datos
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Poblar base de datos con datos iniciales
npm run db:seed
```

### 6. Iniciar Servidores

**Terminal 1 - Backend:**
```bash
cd Backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

🎉 **¡Listo!** El proyecto debería estar corriendo:
- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Swagger Docs: http://localhost:3000/docs

---

## 🔧 Configuración Detallada del Backend

### Archivo `.env.local`

Crea el archivo `Backend/.env.local` con el siguiente contenido:

```bash
# === CONFIGURACIÓN DE BASE DE DATOS ===
# Formato: postgresql://[usuario]:[contraseña]@[host]:[puerto]/[nombre_db]?schema=public

# Para PostgreSQL local SIN contraseña
DATABASE_URL=postgresql://postgres:@localhost:5432/Univote?schema=public

# Para PostgreSQL local CON contraseña
# DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/Univote?schema=public

# === CONFIGURACIÓN DE JWT ===
# Secreto para firmar tokens (cambiar en producción)
JWT_SECRET=univote_local_dev_secret_2024

# Tiempo de expiración del token
JWT_EXPIRES_IN=24h

# === CONFIGURACIÓN DE CORS ===
# Orígenes permitidos (separados por coma)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# === CONFIGURACIÓN DE EMAIL (Opcional) ===
# Para funcionalidad de notificaciones por correo
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_app

# === CONFIGURACIÓN DEL PUERTO ===
PORT=3000
```

### Explicación de Variables

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | ✅ Sí |
| `JWT_SECRET` | Secreto para firmar tokens JWT | ✅ Sí |
| `JWT_EXPIRES_IN` | Duración del token (ej: 24h, 7d) | ❌ No (default: 24h) |
| `ALLOWED_ORIGINS` | URLs permitidas para CORS | ❌ No (default: localhost) |
| `EMAIL_USER` | Correo para envío de emails | ❌ No |
| `EMAIL_PASS` | Contraseña de app de Gmail | ❌ No |
| `PORT` | Puerto del servidor backend | ❌ No (default: 3000) |

### Configuración de Email (Gmail)

Si deseas habilitar el envío de correos:

1. Ve a tu cuenta de Gmail → Seguridad
2. Activa la verificación en 2 pasos
3. Genera una "Contraseña de aplicación"
4. Usa esa contraseña en `EMAIL_PASS`

---

## 🎨 Configuración del Frontend

### Archivo `.env`

Crea el archivo `Frontend/.env`:

```bash
# URL del Backend API
VITE_API_URL=http://localhost:3000
```

### Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL base del backend | http://localhost:3000 |

**Nota:** Las variables en Vite deben tener el prefijo `VITE_` para ser accesibles en el código.

---

## 🗄️ Base de Datos y Migraciones

### Estructura de Comandos Prisma

```bash
# Navegar a la carpeta Backend
cd Backend

# Ver estado de migraciones
npx prisma migrate status

# Aplicar migraciones pendientes (modo desarrollo)
npx prisma migrate dev

# Aplicar migraciones (producción)
npx prisma migrate deploy

# Generar cliente Prisma después de cambios en schema
npx prisma generate

# Abrir Prisma Studio (interfaz visual de DB)
npx prisma studio

# Resetear base de datos (¡CUIDADO! Elimina todos los datos)
npx prisma migrate reset
```

### Entender las Migraciones

El proyecto incluye migraciones que crean:

1. **Tablas principales:**
   - `Administrador` - Administradores del sistema
   - `Candidate` - Candidatos a elecciones
   - `Voter` - Votantes registrados
   - `Election` - Procesos electorales
   - `Vote` - Registro de votos emitidos
   - `Proposal` - Propuestas de candidatos
   - `Result` - Resultados de elecciones
   - `Career` - Carreras académicas
   - `Role` - Roles del sistema
   - `Notification` - Notificaciones para candidatos

2. **Relaciones:**
   - Candidatos y Votantes pertenecen a una Carrera y un Rol
   - Elecciones tienen múltiples Candidatos y Votantes
   - Votos relacionan Votante, Candidato y Elección
   - Propuestas pertenecen a Candidatos y Elecciones

### Verificar Migraciones Aplicadas

```bash
# Ver historial de migraciones
npx prisma migrate status

# Conectar a PostgreSQL y verificar tablas
psql -U postgres -d Univote -c "\dt"
```

---

## 🌱 Datos de Prueba (Seed)

### Ejecutar el Seed

```bash
cd Backend
npm run db:seed
```

### Datos Creados por el Seed

#### 1. **Roles** (3 roles)
- `ADMINISTRADOR` (id_role: 1)
- `CANDIDATO` (id_role: 2)
- `VOTANTE` (id_role: 3)

#### 2. **Carreras** (5 carreras)
- Ingeniería de Sistemas (id_career: 1)
- Ingeniería Industrial (id_career: 2)
- Administración de Empresas (id_career: 3)
- Contaduría Pública (id_career: 4)
- Diseño Gráfico (id_career: 5)

#### 3. **Administrador** (1 usuario)
```
Email: admin@univote.com
Contraseña: admin123
Rol: ADMINISTRADOR
```

#### 4. **Votantes** (10 usuarios)

| Email | Contraseña | Estado |
|-------|-----------|--------|
| juan.perez@estudiante.univote.com | voter123 | Activo |
| maria.gonzalez@estudiante.univote.com | voter123 | Activo |
| carlos.rodriguez@estudiante.univote.com | voter123 | Activo |
| ana.martinez@estudiante.univote.com | voter123 | Inactivo |
| luis.lopez@estudiante.univote.com | voter123 | Activo |
| sofia.hernandez@estudiante.univote.com | voter123 | Activo |
| diego.garcia@estudiante.univote.com | voter123 | Activo |
| valentina.ramirez@estudiante.univote.com | voter123 | Inactivo |
| andres.torres@estudiante.univote.com | voter123 | Activo |
| camila.flores@estudiante.univote.com | voter123 | Activo |

#### 5. **Candidatos** (10 usuarios)

| Email | Contraseña | Estado |
|-------|-----------|--------|
| roberto.sanchez@candidato.univote.com | candidate123 | Aprobado |
| laura.jimenez@candidato.univote.com | candidate123 | Aprobado |
| fernando.ruiz@candidato.univote.com | candidate123 | Aprobado |
| patricia.morales@candidato.univote.com | candidate123 | Pendiente |
| miguel.castro@candidato.univote.com | candidate123 | Aprobado |
| carolina.vargas@candidato.univote.com | candidate123 | Rechazado |
| ricardo.mendoza@candidato.univote.com | candidate123 | Aprobado |
| gabriela.ortiz@candidato.univote.com | candidate123 | Pendiente |
| javier.romero@candidato.univote.com | candidate123 | Aprobado |
| natalia.silva@candidato.univote.com | candidate123 | Aprobado |

### Verificar Datos del Seed

```bash
# Opción 1: Usando Prisma Studio
npx prisma studio

# Opción 2: Consultas SQL directas
psql -U postgres -d Univote

# Dentro de psql:
SELECT * FROM "Role";
SELECT * FROM "Career";
SELECT * FROM "Administrador";
SELECT COUNT(*) FROM "Voter";
SELECT COUNT(*) FROM "Candidate";
```

---

## ▶️ Ejecución del Proyecto

### Modo Desarrollo (Recomendado)

#### Opción 1: Dos Terminales Separadas

**Terminal 1 - Backend:**
```bash
cd Backend
npm run start:dev
```

Deberías ver:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] PrismaModule dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
Application is running on: http://localhost:3000
Swagger documentation: http://localhost:3000/docs
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

Deberías ver:
```
VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

#### Opción 2: Usando el Script de Desarrollo Local (Backend)

```bash
cd Backend
npm run dev:local
```

Este comando ejecuta automáticamente:
1. Migraciones de base de datos
2. Seed de datos
3. Inicio del servidor en modo watch

### Scripts Disponibles

#### Backend

```bash
# Desarrollo
npm run start:dev          # Modo desarrollo con hot-reload
npm run dev:local          # Migrar + seed + desarrollo (recomendado)
npm run dev:backend        # Alias para start:dev

# Producción
npm run build              # Compilar TypeScript
npm run start:prod         # Ejecutar versión compilada

# Base de Datos
npm run db:seed            # Ejecutar seed
npx prisma migrate dev     # Aplicar migraciones
npx prisma generate        # Generar cliente Prisma
npx prisma studio          # Abrir interfaz visual

# Testing
npm run test               # Tests unitarios
npm run test:e2e           # Tests end-to-end
npm run test:cov           # Tests con cobertura

# Calidad de Código
npm run lint               # ESLint con auto-fix
npm run format             # Prettier
```

#### Frontend

```bash
# Desarrollo
npm run dev                # Servidor de desarrollo

# Producción
npm run build              # Compilar para producción
npm run preview            # Previsualizar build

# Calidad de Código
npm run lint               # ESLint
```

---

## ✅ Verificación de la Instalación

### 1. Verificar Backend

Abre tu navegador en: http://localhost:3000

Deberías ver un mensaje de bienvenida de la API.

### 2. Verificar Swagger Documentation

Abre: http://localhost:3000/docs

Deberías ver la documentación completa de la API con todos los endpoints.

### 3. Probar Login de Administrador

**Usando Swagger:**
1. Ve a http://localhost:3000/docs
2. Busca el endpoint `POST /api/auth/login`
3. Haz clic en "Try it out"
4. Ingresa:
   ```json
   {
     "correo": "admin@univote.com",
     "contrasena": "admin123"
   }
   ```
5. Deberías recibir un token JWT

**Usando cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@univote.com","contrasena":"admin123"}'
```

Respuesta esperada:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Admin",
    "rol": "ADMIN",
    "correo": "admin@univote.com"
  }
}
```

### 4. Verificar Frontend

Abre: http://localhost:5173

Deberías ver la página de inicio de Univote con:
- Navbar
- Formulario de login
- Logo de Univote

### 5. Probar Login desde el Frontend

1. Abre http://localhost:5173
2. Ingresa credenciales de administrador:
   - Correo: `admin@univote.com`
   - Contraseña: `admin123`
3. Deberías ser redirigido al panel de administrador

### 6. Verificar Base de Datos

```bash
# Abrir Prisma Studio
cd Backend
npx prisma studio
```

Se abrirá una interfaz web en http://localhost:5555 donde podrás:
- Ver todas las tablas
- Inspeccionar datos
- Editar registros

---

## 🔧 Solución de Problemas Comunes

### Error: "Cannot find module '@prisma/client'"

**Causa:** Cliente Prisma no generado

**Solución:**
```bash
cd Backend
npx prisma generate
```

### Error: "P2021: The table does not exist"

**Causa:** Migraciones no aplicadas

**Solución:**
```bash
cd Backend
npx prisma migrate dev
```

### Error: "ECONNREFUSED localhost:5432"

**Causa:** PostgreSQL no está corriendo

**Solución:**

**Windows:**
```bash
# Abrir Services (services.msc)
# Buscar "postgresql" e iniciar el servicio
```

**macOS:**
```bash
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### Error: "Port 3000 is already in use"

**Causa:** Otro proceso usando el puerto

**Solución:**

**Windows:**
```bash
# Encontrar proceso
netstat -ano | findstr :3000

# Matar proceso (reemplaza PID)
taskkill /PID [número_pid] /F
```

**Linux/macOS:**
```bash
# Encontrar proceso
lsof -i :3000

# Matar proceso
kill -9 [PID]
```

### Error: "Seed script fails"

**Causa:** Datos duplicados o base de datos no limpia

**Solución:**
```bash
cd Backend

# Resetear base de datos
npx prisma migrate reset

# Aplicar migraciones
npx prisma migrate dev

# Ejecutar seed
npm run db:seed
```

### Error: "CORS policy blocking requests"

**Causa:** Frontend y Backend en orígenes diferentes

**Solución:**

Verifica que en `Backend/.env.local`:
```bash
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Error: "401 Unauthorized" en peticiones

**Causa:** Token JWT no enviado o inválido

**Solución:**
1. Verifica que el login funcione correctamente
2. Asegúrate de que el token se guarde en `localStorage`
3. Verifica que el interceptor de axios esté configurado

### Frontend no se conecta al Backend

**Verificaciones:**

1. **Backend corriendo:**
   ```bash
   curl http://localhost:3000
   ```

2. **Variable de entorno correcta:**
   ```bash
   # Frontend/.env
   VITE_API_URL=http://localhost:3000
   ```

3. **Reiniciar servidor de desarrollo:**
   ```bash
   cd Frontend
   npm run dev
   ```

### Problemas con contraseñas de PostgreSQL

**Si olvidaste la contraseña de postgres:**

**Windows:**
1. Edita `pg_hba.conf` (usualmente en `C:\Program Files\PostgreSQL\15\data\`)
2. Cambia `md5` a `trust` temporalmente
3. Reinicia PostgreSQL
4. Cambia la contraseña:
   ```sql
   ALTER USER postgres PASSWORD 'nueva_contraseña';
   ```
5. Revertir `pg_hba.conf` a `md5`

### Error: "Module not found" después de git pull

**Causa:** Nuevas dependencias agregadas

**Solución:**
```bash
# Backend
cd Backend
npm install

# Frontend
cd Frontend
npm install
```

---

## 🐳 Despliegue con Docker

### Requisitos

- Docker Desktop instalado
- Docker Compose

### Pasos

1. **Configurar variables de entorno:**

Crea `Backend/.env`:
```bash
DATABASE_URL=postgresql://postgres:admin@db:5432/Univote?schema=public
JWT_SECRET=your_production_secret_change_this
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin
POSTGRES_DB=Univote
```

2. **Iniciar servicios:**

```bash
cd Backend
docker-compose up -d
```

Esto levantará:
- PostgreSQL en puerto 5432
- Backend en puerto 3000
- pgAdmin en puerto 5050 (opcional)

3. **Ejecutar migraciones en contenedor:**

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run db:seed
```

4. **Ver logs:**

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo database
docker-compose logs -f db
```

5. **Detener servicios:**

```bash
docker-compose down

# Eliminar también volúmenes (¡CUIDADO! Elimina datos)
docker-compose down -v
```

---

## 📊 Verificación Final

### Checklist de Instalación Exitosa

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `Univote` creada
- [ ] Backend: dependencias instaladas (`npm install`)
- [ ] Backend: `.env.local` configurado correctamente
- [ ] Backend: migraciones aplicadas (`npx prisma migrate dev`)
- [ ] Backend: seed ejecutado (`npm run db:seed`)
- [ ] Backend: servidor corriendo en http://localhost:3000
- [ ] Backend: Swagger accesible en http://localhost:3000/docs
- [ ] Frontend: dependencias instaladas (`npm install`)
- [ ] Frontend: `.env` configurado
- [ ] Frontend: servidor corriendo en http://localhost:5173
- [ ] Login de administrador funciona
- [ ] Login de votante funciona
- [ ] Login de candidato funciona

### Usuarios de Prueba

Para probar la aplicación, usa estas credenciales:

**Administrador:**
- Email: `admin@univote.com`
- Contraseña: `admin123`

**Votante:**
- Email: `juan.perez@estudiante.univote.com`
- Contraseña: `voter123`

**Candidato:**
- Email: `roberto.sanchez@candidato.univote.com`
- Contraseña: `candidate123`

---

## 📚 Próximos Pasos

Ahora que tienes el proyecto corriendo:

1. **Explora la documentación de Swagger:** http://localhost:3000/docs
2. **Lee el README del Backend:** [Backend/README.md](./Backend/README.md)
3. **Revisa el código fuente** para entender la arquitectura
4. **Crea tu primera elección** desde el panel de administrador
5. **Postúlate como candidato** y crea propuestas
6. **Emite un voto** desde la cuenta de votante

---

## 🆘 Soporte

Si encuentras problemas no cubiertos en esta guía:

1. Revisa los logs del servidor (terminal donde corre el backend)
2. Verifica los errores en la consola del navegador (F12)
3. Consulta la documentación de [NestJS](https://docs.nestjs.com/)
4. Revisa la documentación de [Prisma](https://www.prisma.io/docs/)

---

## 📝 Notas Finales

- **Seguridad:** Las credenciales por defecto son solo para desarrollo. Cámbialas en producción.
- **Base de Datos:** Haz backups regulares de tu base de datos PostgreSQL.
- **Actualizaciones:** Ejecuta `git pull` regularmente para obtener las últimas actualizaciones.
- **Migraciones:** Siempre ejecuta `npx prisma migrate dev` después de hacer pull si hay cambios en el schema.

---

✨ **¡Feliz desarrollo con Univote!** ✨
