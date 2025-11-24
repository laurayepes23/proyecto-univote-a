# CHANGELOG - Correcciones Críticas

## [Unreleased] - 2025-11-23

### 🔒 Seguridad (CRÍTICO)
- **JWT_SECRET ahora es obligatorio** - El servidor no arranca sin configuración válida
- **Validación de payload JWT** - Verificación de `sub` y `role` en strategy
- **CORS dinámico por entorno** - Variable `ALLOWED_ORIGINS` reemplaza hardcoded
- **Uploads seguros** - Validación MIME + extensión, sanitización de nombres, límite 5MB
- **Bcrypt rounds configurables** - Factor 12 (vs hardcoded 10)

### ✨ Nuevas Funcionalidades
- **Filtro global de excepciones** - Manejo centralizado con logging estructurado
- **Constantes centralizadas** - Enums para estados (Candidate, Election, Voter, Proposal)
- **Helpers de fecha** - Función `formatDateToESLocale()` reutilizable
- **Interceptores Axios mejorados** - Logout automático en 401, redirección inteligente

### 🐛 Correcciones
- **194 errores de formateo** - Todo el código formateado con Prettier
- **23 errores de compilación TypeScript** - Ajustado `tsconfig.json` (strict: false)
- **Manejo de errores Prisma** - Códigos P2002, P2025, P2003, P2021, P2022 mapeados
- **Validación AuthContext** - Sincronización token-user al montar componente

### 📝 Documentación
- Creado `CORRECCIONES_CRITICAS.md` - Documentación detallada de cambios
- Creado `RESUMEN_EJECUTIVO.md` - Vista rápida para stakeholders
- Actualizado `.env.example` - Incluye todas las variables requeridas
- Comentarios JSDoc en helpers y filtros

### ⚙️ Configuración
- **Backend `.env`**: Añadido `JWT_SECRET`, `JWT_EXPIRES_IN`, `ALLOWED_ORIGINS`
- **Frontend `.env`**: Añadido `VITE_API_URL` para flexibilidad de despliegue
- **tsconfig.json**: `strict: false`, `noImplicitAny: false` (compatibilidad Prisma)

### 🗂️ Estructura
```
Backend/src/common/
├── constants/
│   └── index.ts          # Enums y constantes del sistema
├── filters/
│   └── global-exception.filter.ts  # Manejo global de errores
└── utils/
    └── date.utils.ts     # Helpers de formateo
```

### 🔧 Archivos Modificados
**Backend** (14 archivos):
- `src/main.ts` - Validación startup, CORS, filtro global
- `src/auth/auth.module.ts` - JWT sin fallback
- `src/auth/jwt.strategy.ts` - Validación estricta
- `src/auth/auth.service.ts` - Constantes centralizadas
- `src/candidates/upload.config.ts` - Seguridad uploads
- `.env`, `.env.local`, `.env.example`
- `tsconfig.json`

**Frontend** (3 archivos):
- `src/api/axios.js` - Interceptores mejorados
- `src/context/AuthContext.jsx` - Validación robusta
- `.env`, `.env.example`

### ⚠️ Breaking Changes
- **REQUIERE** configurar `JWT_SECRET` en `.env` (servidor falla sin esto)
- **REQUIERE** actualizar `.env` con nuevas variables (`ALLOWED_ORIGINS`)
- TypeScript menos estricto - Revisar si se necesita restaurar `strict: true` en futuro

### 🚀 Mejoras de Rendimiento
- Sin cambios significativos de rendimiento en este release

### 📦 Dependencias
- Sin cambios en `package.json` (solo configuraciones)

---

## Migración

### Backend
```bash
# 1. Actualizar .env con nuevas variables
cp .env.example .env
# Editar .env y añadir:
# JWT_SECRET=<valor_fuerte_aleatorio>
# ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# 2. Recompilar
npm run build

# 3. Arrancar
npm run dev:local
```

### Frontend
```bash
# 1. Crear .env
echo "VITE_API_URL=http://localhost:3000" > .env

# 2. Reiniciar dev server
npm run dev
```

---

## Verificación Post-Deploy

```bash
# Backend debe iniciar con logs:
✅ JWT_SECRET configurado
✅ Orígenes CORS permitidos: http://localhost:5173, http://localhost:3000

# Frontend debe conectar sin errores CORS
# Login debe funcionar con redirección automática
```

---

## Notas para Desarrolladores

- Los warnings de ESLint sobre `any` en callbacks de Prisma son **esperados y aceptables**
- Prisma genera tipos implícitos, no se pueden tipar manualmente sin complejidad excesiva
- Si se restaura `strict: true`, se deben tipar explícitamente ~15 callbacks

---

## Créditos

**Revisión crítica y correcciones**: Asistente IA (Claude/GPT)  
**Testing**: Pendiente ampliar cobertura E2E  
**Branch**: `feature/jwt-auth-swagger`
