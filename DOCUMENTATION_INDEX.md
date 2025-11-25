# 📚 Índice de Documentación - Univote

Este documento te guía a la documentación correcta según lo que necesites.

---

## 🚀 Empezando

### ¿Primera vez con el proyecto?

1. **[README.md](./README.md)** - Comienza aquí
   - Visión general del proyecto
   - Características principales
   - Stack tecnológico
   - Usuarios de prueba

2. **[INSTALLATION.md](./INSTALLATION.md)** - Instalación paso a paso
   - Requisitos previos
   - Instalación completa
   - Configuración de base de datos
   - Datos de prueba (seed)
   - Solución de problemas

3. **[ENV_VARIABLES.md](./ENV_VARIABLES.md)** - Configuración de variables
   - Variables del Backend
   - Variables del Frontend
   - Ejemplos por entorno
   - Generación de secretos seguros

---

## 📖 Documentación Técnica

### Backend (NestJS + Prisma)

**[Backend/README.md](./Backend/README.md)**
- Arquitectura del sistema
- Modelo de datos (Prisma)
- Autenticación JWT unificada
- Endpoints de la API
- Migraciones y seed
- Tests E2E
- Problemas comunes

**Temas Clave:**
- Sistema multi-rol (Admin, Candidato, Votante)
- Guards de autorización (@Roles)
- Gestión de elecciones
- Sistema de propuestas
- Votación y resultados
- Notificaciones

### Frontend (React + Vite)

**[Frontend/README.md](./Frontend/README.md)**
- Estructura del proyecto
- Componentes principales
- Rutas y navegación
- Autenticación con JWT
- Almacenamiento local
- Despliegue

**Temas Clave:**
- Interceptores Axios
- Context API
- Rutas protegidas
- Material Tailwind
- Responsive design

---

## 🔧 Configuración

### Variables de Entorno

**[ENV_VARIABLES.md](./ENV_VARIABLES.md)**

Consulta este documento para:
- ✅ Configurar `.env.local` del Backend
- ✅ Configurar `.env` del Frontend
- ✅ Entender cada variable
- ✅ Ver ejemplos por entorno
- ✅ Generar `JWT_SECRET` seguro
- ✅ Configurar email (Gmail)
- ✅ Solucionar problemas de configuración

### Base de Datos

**[Backend/README.md](./Backend/README.md#base-de-datos-y-migraciones)**

Para:
- Crear base de datos PostgreSQL
- Aplicar migraciones (`npx prisma migrate dev`)
- Ejecutar seed (`npm run db:seed`)
- Ver estructura de datos
- Usar Prisma Studio

---

## 🚦 Guías Rápidas

### Instalación Rápida

```bash
# 1. Clonar repositorio
git clone https://github.com/laurayepes23/proyecto-univote-a.git
cd proyecto-univote-a

# 2. Crear base de datos
psql -U postgres -c "CREATE DATABASE \"Univote\";"

# 3. Backend
cd Backend
npm install
cp .env.example .env.local
# Editar .env.local
npx prisma migrate dev
npm run db:seed
npm run start:dev

# 4. Frontend (nueva terminal)
cd Frontend
npm install
cp .env.example .env
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/docs

### Login de Prueba

**Administrador:**
```
Email: admin@univote.com
Contraseña: admin123
```

**Votante:**
```
Email: juan.perez@estudiante.univote.com
Contraseña: voter123
```

**Candidato:**
```
Email: roberto.sanchez@candidato.univote.com
Contraseña: candidate123
```

---

## 🔍 Buscar por Tema

### Autenticación y Seguridad

- **JWT Token:** [Backend/README.md](./Backend/README.md#autenticación-y-autorización)
- **Login Unificado:** [Backend/README.md](./Backend/README.md#sistema-de-autenticación-unificado)
- **Guards y Roles:** [Backend/README.md](./Backend/README.md#guards-de-autorización)
- **Frontend Auth:** [Frontend/README.md](./Frontend/README.md#autenticación)
- **Variables Seguras:** [ENV_VARIABLES.md](./ENV_VARIABLES.md#seguridad---variables-sensibles)

### Base de Datos

- **Modelo de Datos:** [Backend/README.md](./Backend/README.md#modelado-de-datos-prisma)
- **Migraciones:** [INSTALLATION.md](./INSTALLATION.md#base-de-datos-y-migraciones)
- **Seed:** [INSTALLATION.md](./INSTALLATION.md#datos-de-prueba-seed)
- **Prisma Studio:** [Backend/README.md](./Backend/README.md#base-de-datos-y-migraciones)

### Configuración de Entorno

- **Backend .env:** [ENV_VARIABLES.md](./ENV_VARIABLES.md#backend-envlocal)
- **Frontend .env:** [ENV_VARIABLES.md](./ENV_VARIABLES.md#frontend-env)
- **Docker .env:** [ENV_VARIABLES.md](./ENV_VARIABLES.md#docker-env)
- **Ejemplos:** [ENV_VARIABLES.md](./ENV_VARIABLES.md#ejemplos-por-entorno)

### Desarrollo

- **Scripts Backend:** [Backend/README.md](./Backend/README.md#scripts-npm-backend)
- **Scripts Frontend:** [Frontend/README.md](./Frontend/README.md#scripts-disponibles)
- **Estructura Backend:** [Backend/README.md](./Backend/README.md#estructura-del-proyecto-backend)
- **Estructura Frontend:** [Frontend/README.md](./Frontend/README.md#estructura-del-proyecto)

### Testing

- **Tests E2E:** [Backend/README.md](./Backend/README.md#pruebas-jest--supertest)
- **Ejecutar Tests:** [Backend/README.md](./Backend/README.md#scripts-npm-backend)

### Despliegue

- **Build Frontend:** [Frontend/README.md](./Frontend/README.md#despliegue)
- **Docker:** [INSTALLATION.md](./INSTALLATION.md#despliegue-con-docker)
- **Producción:** [ENV_VARIABLES.md](./ENV_VARIABLES.md#producción-ejemplo)

### Problemas Comunes

- **Instalación:** [INSTALLATION.md](./INSTALLATION.md#solución-de-problemas-comunes)
- **Variables de Entorno:** [ENV_VARIABLES.md](./ENV_VARIABLES.md#solución-de-problemas)
- **Backend:** [Backend/README.md](./Backend/README.md#problemas-comunes-y-solución)
- **Migraciones Prisma:** [INSTALLATION.md](./INSTALLATION.md#solución-de-problemas-comunes)

---

## 📋 Documentos Adicionales

### CHANGELOG.md
Historial de cambios y versiones del proyecto.

### RESUMEN_EJECUTIVO.md
Resumen ejecutivo del proyecto para stakeholders.

### CORRECCIONES_CRITICAS.md
Registro de correcciones críticas implementadas.

---

## 🎯 Guías por Objetivo

### "Quiero instalar el proyecto"
1. [README.md](./README.md) - Visión general
2. [INSTALLATION.md](./INSTALLATION.md) - Guía paso a paso
3. [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Configuración

### "Necesito entender la arquitectura"
1. [Backend/README.md](./Backend/README.md) - Arquitectura backend
2. [Frontend/README.md](./Frontend/README.md) - Arquitectura frontend
3. [README.md](./README.md#modelo-de-datos) - Modelo de datos

### "Tengo un error"
1. [INSTALLATION.md](./INSTALLATION.md#solución-de-problemas-comunes) - Problemas de instalación
2. [ENV_VARIABLES.md](./ENV_VARIABLES.md#solución-de-problemas) - Problemas de configuración
3. [Backend/README.md](./Backend/README.md#problemas-comunes-y-solución) - Problemas de backend

### "Quiero agregar una funcionalidad"
1. [Backend/README.md](./Backend/README.md) - Entender el backend
2. [Frontend/README.md](./Frontend/README.md) - Entender el frontend
3. [Backend/README.md](./Backend/README.md#autenticación-y-autorización) - Sistema de permisos

### "Voy a desplegar a producción"
1. [ENV_VARIABLES.md](./ENV_VARIABLES.md#producción-ejemplo) - Variables de producción
2. [ENV_VARIABLES.md](./ENV_VARIABLES.md#seguridad---variables-sensibles) - Seguridad
3. [Frontend/README.md](./Frontend/README.md#despliegue) - Build de frontend
4. [INSTALLATION.md](./INSTALLATION.md#despliegue-con-docker) - Docker

---

## 🔗 Enlaces Rápidos

| Necesito... | Ir a... |
|------------|---------|
| Instalar el proyecto | [INSTALLATION.md](./INSTALLATION.md) |
| Configurar variables | [ENV_VARIABLES.md](./ENV_VARIABLES.md) |
| Entender la API | [Backend/README.md](./Backend/README.md) |
| Ver endpoints | http://localhost:3000/docs (Swagger) |
| Ejecutar seed | [INSTALLATION.md](./INSTALLATION.md#datos-de-prueba-seed) |
| Solucionar errores | [INSTALLATION.md](./INSTALLATION.md#solución-de-problemas-comunes) |
| Ver modelo de datos | [Backend/README.md](./Backend/README.md#modelado-de-datos-prisma) |
| Generar JWT_SECRET | [ENV_VARIABLES.md](./ENV_VARIABLES.md#generación-de-jwt_secret-seguro) |
| Configurar email | [ENV_VARIABLES.md](./ENV_VARIABLES.md#backend-envlocal) |
| Usar Docker | [INSTALLATION.md](./INSTALLATION.md#despliegue-con-docker) |

---

## 📞 Soporte

Si no encuentras lo que buscas:

1. **Revisa los logs:**
   - Backend: Terminal donde corre `npm run start:dev`
   - Frontend: Consola del navegador (F12)

2. **Consulta documentación oficial:**
   - [NestJS](https://docs.nestjs.com/)
   - [Prisma](https://www.prisma.io/docs/)
   - [React](https://react.dev/)
   - [Vite](https://vitejs.dev/)

3. **Verifica configuración:**
   - [ENV_VARIABLES.md](./ENV_VARIABLES.md#verificación-de-variables)
   - [INSTALLATION.md](./INSTALLATION.md#verificación-de-la-instalación)

---

## ✅ Checklist General

### Primera Instalación
- [ ] Leer [README.md](./README.md)
- [ ] Seguir [INSTALLATION.md](./INSTALLATION.md)
- [ ] Configurar [ENV_VARIABLES.md](./ENV_VARIABLES.md)
- [ ] Verificar instalación exitosa

### Desarrollo Diario
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] PostgreSQL corriendo
- [ ] Variables de entorno configuradas

### Antes de Commit
- [ ] Tests pasando (`npm run test:e2e`)
- [ ] Linter sin errores (`npm run lint`)
- [ ] Build exitoso (`npm run build`)

---

**Última actualización:** Noviembre 2024

✨ **¡Feliz desarrollo con Univote!** ✨
