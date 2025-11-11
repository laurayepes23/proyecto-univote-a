# 🚀 PLAN DE IMPLEMENTACIÓN JWT - UNIVOTE

## ⚠️ ESTADO ACTUAL: CRÍTICO

### Problemas Identificados
1. **Backend**: Login sin JWT, endpoints desprotegidos
2. **Frontend**: AuthContext falso, sin comunicación real con API
3. **Seguridad**: Vulnerable a fraude electoral y suplantación

---

## 📋 IMPLEMENTACIÓN EN 7 DÍAS

### **DÍA 1: Setup Inicial Backend**

**Tiempo estimado: 4 horas**

#### 1. Instalar dependencias
```bash
cd Backend
npm install @nestjs/jwt @nestjs/passport passport passport-jwt @nestjs/config
npm install --save-dev @types/passport-jwt
```

#### 2. Configurar variables de entorno
- Copiar `.env.example` a `.env.local`
- Generar JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 3. Crear estructura de archivos
```bash
# Crear módulo auth
npx nest g module auth
npx nest g service auth
npx nest g controller auth

# Crear subdirectorios
mkdir -p src/auth/strategies
mkdir -p src/auth/guards
mkdir -p src/auth/decorators
mkdir -p src/auth/dto
```

**Entregables:**
- ✅ Dependencias instaladas
- ✅ Variables de entorno configuradas
- ✅ Estructura de carpetas creada

---

### **DÍA 2: Core de Autenticación**

**Tiempo estimado: 6 horas**

#### Archivos a crear:

1. **DTOs** (`src/auth/dto/`)
   - `login.dto.ts` - Validación de credenciales
   - `auth-response.dto.ts` - Estructura de respuesta

2. **Auth Service** (`src/auth/auth.service.ts`)
   - Método `login()` que valida y genera JWT
   - Soporte para 3 tipos de usuario
   - Validación con bcrypt

3. **Auth Controller** (`src/auth/auth.controller.ts`)
   - `POST /auth/login` - Endpoint de login
   - `GET /auth/profile` - Verificar token

**Pruebas:**
```bash
# Probar login con curl
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@univote.edu",
    "contrasena": "password123",
    "tipo": "administrador"
  }'
```

**Entregables:**
- ✅ Login funcional con JWT
- ✅ Token validado correctamente

---

### **DÍA 3: Guards y Strategy**

**Tiempo estimado: 5 horas**

#### Archivos a crear:

1. **JWT Strategy** (`src/auth/strategies/jwt.strategy.ts`)
   - Validación automática de tokens

2. **Guards** (`src/auth/guards/`)
   - `jwt-auth.guard.ts` - Verifica autenticación
   - `roles.guard.ts` - Verifica autorización

3. **Decorators** (`src/auth/decorators/`)
   - `roles.decorator.ts` - Define roles permitidos
   - `current-user.decorator.ts` - Extrae usuario del request

**Entregables:**
- ✅ Estrategia JWT funcionando
- ✅ Guards creados y testeados

---

### **DÍA 4: Proteger Endpoints Críticos**

**Tiempo estimado: 6 horas**

#### Endpoints a proteger (prioridad):

1. **CRÍTICO** - `VotesController`
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('votante')
   @Post()
   async create(@CurrentUser() user, @Body() dto) {
     // Solo votantes autenticados
     // ID del votante desde el token (no falsificable)
   }
   ```

2. **ALTO** - `ElectionsController`
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('administrador')
   @Post()
   async create(@Body() dto) {
     // Solo administradores
   }
   ```

3. **MEDIO** - `CandidatesController`, `ProposalsController`

**Entregables:**
- ✅ Endpoints críticos protegidos
- ✅ Control de acceso por roles funcionando

---

### **DÍA 5: Frontend - Auth Context Real**

**Tiempo estimado: 6 horas**

#### Archivos a crear/modificar:

1. **Axios configurado** (`src/api/axios.js`)
   - Interceptor para agregar token
   - Manejo de errores 401/403

2. **Auth API** (`src/api/auth.api.js`)
   - Servicios de login, logout, getProfile

3. **AuthContext nuevo** (`src/context/AuthContext.jsx`)
   - Reemplazar el actual
   - Integración real con backend
   - Manejo de estado de autenticación

4. **Hook useAuth** (`src/hooks/useAuth.js`)

**Entregables:**
- ✅ Context API integrado con backend real
- ✅ Login funcional desde React

---

### **DÍA 6: Frontend - Protección de Rutas**

**Tiempo estimado: 5 horas**

#### Archivos a crear:

1. **PrivateRoute** (`src/components/PrivateRoute.jsx`)
   - Verifica autenticación

2. **RoleRoute** (`src/components/RoleRoute.jsx`)
   - Verifica rol específico

3. **App.jsx actualizado**
   - Envolver rutas con protección

4. **Login.jsx actualizado**
   - Integrar con AuthContext real

**Entregables:**
- ✅ Rutas protegidas por autenticación
- ✅ Rutas protegidas por rol
- ✅ Redirecciones automáticas

---

### **DÍA 7: Testing y Ajustes**

**Tiempo estimado: 6 horas**

#### Pruebas exhaustivas:

1. **Backend**
   - Login con 3 tipos de usuario
   - Endpoints protegidos rechazan sin token
   - Endpoints verifican roles correctamente

2. **Frontend**
   - Login exitoso redirige correctamente
   - Rutas protegidas funcionan
   - Logout limpia sesión

3. **Integración**
   - Token se envía automáticamente
   - Errores 401 manejan correctamente
   - Expiración de token funciona

**Entregables:**
- ✅ Sistema completo funcionando
- ✅ Todos los tests pasando
- ✅ Documentación actualizada

---

## 📊 CHECKLIST FINAL

### Backend
- [ ] AuthModule creado e integrado
- [ ] Login genera JWT válido
- [ ] JwtStrategy valida tokens
- [ ] Guards protegen endpoints
- [ ] Votos solo por votantes autenticados
- [ ] Elecciones solo gestionables por admins

### Frontend
- [ ] Axios con interceptores configurado
- [ ] AuthContext integrado con backend
- [ ] Login redirige según rol
- [ ] Rutas protegidas funcionan
- [ ] Logout limpia sesión
- [ ] Token se renueva automáticamente

### Seguridad
- [ ] JWT_SECRET seguro (64 bytes)
- [ ] Tokens expiran en 15 minutos
- [ ] CORS configurado correctamente
- [ ] Sin vulnerabilidades npm audit

---

## 🚨 ROLLBACK PLAN

Si algo falla:
1. **NO eliminar código antiguo** hasta validar el nuevo
2. Mantener endpoint antiguo de login paralelo
3. Backup de base de datos antes de migrar
4. Documentar todos los problemas encontrados

---

## 📈 MÉTRICAS DE ÉXITO

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Seguridad de votos | 🔴 0% | ✅ 100% |
| Endpoints protegidos | 🔴 0% | ✅ 100% |
| Autenticación real | ❌ No | ✅ Sí |
| Fraude posible | 🚨 Sí | ✅ No |

---

## 💡 RECOMENDACIONES CRÍTICAS

### DO ✅
1. Seguir la documentación existente (docs/estrategia-jwt/)
2. Implementar en rama separada (`feature/jwt-implementation`)
3. Probar cada cambio antes de continuar
4. Hacer commits pequeños y frecuentes
5. Documentar problemas encontrados

### DON'T ❌
1. No implementar en producción sin testing exhaustivo
2. No eliminar código antiguo hasta validar el nuevo
3. No hardcodear secretos en el código
4. No saltarse los guards de protección
5. No ignorar errores de validación

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **AHORA**: Revisar este plan y confirmar entendimiento
2. **DÍA 1**: Instalar dependencias y crear estructura
3. **DÍA 2**: Implementar AuthService y probar login
4. **DÍA 3-4**: Guards y protección de endpoints
5. **DÍA 5-6**: Frontend con autenticación real
6. **DÍA 7**: Testing y validación final

---

**Creado**: Noviembre 9, 2025  
**Estado**: ⚠️ PENDIENTE IMPLEMENTACIÓN  
**Prioridad**: 🔴 CRÍTICA
