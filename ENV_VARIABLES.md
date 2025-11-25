# 🔐 Variables de Entorno - Univote

Guía de referencia rápida para configurar las variables de entorno del proyecto.

---

## 📋 Tabla de Contenidos

- [Backend (.env.local)](#backend-envlocal)
- [Frontend (.env)](#frontend-env)
- [Docker (.env)](#docker-env)
- [Ejemplos por Entorno](#ejemplos-por-entorno)
- [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Backend (.env.local)

### Ubicación
```
Backend/.env.local
```

### Variables Requeridas

| Variable | Tipo | Descripción | Ejemplo |
|----------|------|-------------|---------|
| `DATABASE_URL` | String | Cadena de conexión PostgreSQL | `postgresql://postgres:@localhost:5432/Univote?schema=public` |
| `JWT_SECRET` | String | Secreto para firmar tokens JWT | `univote_local_dev_secret_2024` |

### Variables Opcionales

| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `JWT_EXPIRES_IN` | String | `24h` | Duración del token JWT |
| `ALLOWED_ORIGINS` | String | `http://localhost:5173,http://localhost:3000` | Orígenes CORS permitidos |
| `EMAIL_USER` | String | - | Usuario SMTP Gmail |
| `EMAIL_PASS` | String | - | Contraseña de aplicación Gmail |
| `PORT` | Number | `3000` | Puerto del servidor |

### Plantilla Completa

```bash
# === BASE DE DATOS ===
# Formato: postgresql://[usuario]:[contraseña]@[host]:[puerto]/[database]?schema=public

# Sin contraseña (desarrollo local)
DATABASE_URL=postgresql://postgres:@localhost:5432/Univote?schema=public

# Con contraseña
# DATABASE_URL=postgresql://postgres:mi_contraseña@localhost:5432/Univote?schema=public

# === JWT ===
JWT_SECRET=univote_local_dev_secret_2024
JWT_EXPIRES_IN=24h

# === CORS ===
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# === EMAIL (Opcional) ===
# Para Gmail: https://myaccount.google.com/apppasswords
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# === SERVIDOR ===
PORT=3000
```

---

## 🎨 Frontend (.env)

### Ubicación
```
Frontend/.env
```

### Variables

| Variable | Tipo | Descripción | Ejemplo |
|----------|------|-------------|---------|
| `VITE_API_URL` | String | URL base del Backend | `http://localhost:3000` |

### Plantilla

```bash
# Backend API URL
VITE_API_URL=http://localhost:3000
```

**⚠️ Importante:** En Vite, todas las variables de entorno deben tener prefijo `VITE_` para ser accesibles en el código.

---

## 🐳 Docker (.env)

### Ubicación
```
Backend/.env
```

### Variables Docker Compose

```bash
# === POSTGRESQL ===
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin
POSTGRES_DB=Univote

# === PRISMA / BACKEND ===
# Nota: 'db' es el nombre del servicio en docker-compose
DATABASE_URL=postgresql://postgres:admin@db:5432/Univote?schema=public

# === JWT ===
JWT_SECRET=change_this_in_production_use_strong_random_string
JWT_EXPIRES_IN=24h

# === CORS ===
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# === PGADMIN (Opcional) ===
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin

# === EMAIL ===
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 📝 Ejemplos por Entorno

### Desarrollo Local (Windows)

**Backend/.env.local:**
```bash
DATABASE_URL=postgresql://postgres:@localhost:5432/Univote?schema=public
JWT_SECRET=dev_secret_local_2024
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
PORT=3000
```

**Frontend/.env:**
```bash
VITE_API_URL=http://localhost:3000
```

### Desarrollo Local (Linux/macOS)

**Backend/.env.local:**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/Univote?schema=public
JWT_SECRET=dev_secret_local_2024
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
PORT=3000
```

**Frontend/.env:**
```bash
VITE_API_URL=http://localhost:3000
```

### Docker

**Backend/.env:**
```bash
DATABASE_URL=postgresql://postgres:admin@db:5432/Univote?schema=public
JWT_SECRET=docker_dev_secret_2024
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin
POSTGRES_DB=Univote
```

### Producción (Ejemplo)

**Backend/.env.production:**
```bash
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@prod-db.example.com:5432/univote_prod?schema=public&sslmode=require
JWT_SECRET=GENERATE_RANDOM_STRING_32_CHARS_MINIMUM_HERE
JWT_EXPIRES_IN=12h
ALLOWED_ORIGINS=https://univote.example.com,https://www.univote.example.com
EMAIL_USER=noreply@univote.example.com
EMAIL_PASS=production_email_password
PORT=3000
```

**Frontend/.env.production:**
```bash
VITE_API_URL=https://api.univote.example.com
```

---

## 🔒 Seguridad - Variables Sensibles

### ⚠️ NUNCA Subir a Git

Asegúrate de que estos archivos estén en `.gitignore`:
- `.env`
- `.env.local`
- `.env.production`
- `.env.*.local`

### ✅ Sí Subir a Git

Estos archivos de ejemplo SÍ deben estar en el repositorio:
- `.env.example`

### Generación de JWT_SECRET Seguro

**Node.js:**
```javascript
require('crypto').randomBytes(32).toString('hex')
```

**Linux/macOS:**
```bash
openssl rand -hex 32
```

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Online:**
- https://randomkeygen.com/
- Usar "Fort Knox Passwords" de 504-bit

---

## 🔍 Verificación de Variables

### Backend

Crea un endpoint temporal para verificar (eliminar en producción):

```typescript
// src/app.controller.ts
@Get('check-env')
checkEnv() {
  return {
    database: process.env.DATABASE_URL ? '✅ Configurado' : '❌ Falta',
    jwt: process.env.JWT_SECRET ? '✅ Configurado' : '❌ Falta',
    port: process.env.PORT || '3000 (default)',
  };
}
```

### Frontend

En consola del navegador:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

---

## 🔧 Solución de Problemas

### Error: "Cannot connect to database"

**Causa:** `DATABASE_URL` incorrecta o PostgreSQL no corriendo

**Verificaciones:**
```bash
# 1. PostgreSQL está corriendo
# Windows
sc query postgresql-x64-15

# Linux/macOS
sudo systemctl status postgresql

# 2. Probar conexión
psql -U postgres -d Univote
```

**Solución:**
- Verifica usuario, contraseña, host y puerto en `DATABASE_URL`
- Asegúrate de que la base de datos existe: `CREATE DATABASE "Univote";`

### Error: "JWT must be provided"

**Causa:** `JWT_SECRET` no configurado

**Solución:**
```bash
# Backend/.env.local
JWT_SECRET=tu_secreto_aqui_minimo_32_caracteres
```

### Error: "CORS policy blocking"

**Causa:** Frontend no incluido en `ALLOWED_ORIGINS`

**Solución:**
```bash
# Backend/.env.local
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Error: "VITE_API_URL is not defined"

**Causa:** Variable sin prefijo `VITE_` o servidor no reiniciado

**Solución:**
```bash
# 1. Verifica el prefijo en Frontend/.env
VITE_API_URL=http://localhost:3000

# 2. Reinicia el servidor
npm run dev
```

### Error: "Email sending failed"

**Causa:** Credenciales de email incorrectas o no configuradas

**Solución:**
1. Activa verificación en 2 pasos en Gmail
2. Genera contraseña de aplicación: https://myaccount.google.com/apppasswords
3. Usa esa contraseña en `EMAIL_PASS`

### Variables no se cargan después de cambios

**Solución:**
```bash
# 1. Detener servidor (Ctrl+C)
# 2. Reiniciar
npm run start:dev
```

---

## 📋 Checklist de Configuración

### Antes de iniciar desarrollo

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `Univote` creada
- [ ] `Backend/.env.local` creado y configurado
- [ ] `Frontend/.env` creado y configurado
- [ ] `DATABASE_URL` apunta a base de datos correcta
- [ ] `JWT_SECRET` configurado (mínimo 32 caracteres)
- [ ] `VITE_API_URL` apunta a backend correcto
- [ ] Migraciones aplicadas: `npx prisma migrate dev`
- [ ] Seed ejecutado: `npm run db:seed`

### Antes de desplegar a producción

- [ ] `JWT_SECRET` cambiado a valor aleatorio fuerte
- [ ] `DATABASE_URL` con SSL habilitado (`sslmode=require`)
- [ ] Contraseña de PostgreSQL fuerte
- [ ] `ALLOWED_ORIGINS` restringido a dominios de producción
- [ ] Variables de email configuradas con cuenta de producción
- [ ] Archivos `.env*` en `.gitignore`
- [ ] Backups automáticos de base de datos configurados
- [ ] Variables almacenadas en servicio seguro (AWS Secrets, etc.)

---

## 📚 Referencias

- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

**Última actualización:** Noviembre 2024
