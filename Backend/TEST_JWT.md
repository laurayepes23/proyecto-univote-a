# 🧪 TESTS JWT - UNIVOTE

## ✅ PASOS PARA PROBAR

### 1. Iniciar el servidor
```bash
npm run start:dev
```

### 2. Probar LOGIN (Administrador)

**Request:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"admin@univote.edu\",\"contrasena\":\"tu_password\",\"tipo\":\"administrador\"}"
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "correo": "admin@univote.edu",
    "nombre": "Nombre",
    "apellido": "Apellido",
    "rol": "administrador",
    "tipo": "administrador"
  }
}
```

### 3. Probar ENDPOINT PROTEGIDO

**Con token (debe funcionar):**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Sin token (debe fallar 401):**
```bash
curl -X GET http://localhost:3000/auth/profile
```

### 4. Probar VOTAR (Solo votantes)

**Login como votante primero:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"votante@univote.edu\",\"contrasena\":\"password\",\"tipo\":\"votante\"}"
```

**Luego votar:**
```bash
curl -X POST http://localhost:3000/votes \
  -H "Authorization: Bearer TOKEN_VOTANTE" \
  -H "Content-Type: application/json" \
  -d "{\"candidateId\":1,\"electionId\":1}"
```

### 5. Probar CREAR ELECCIÓN (Solo admin)

**Con token de admin (debe funcionar):**
```bash
curl -X POST http://localhost:3000/elections \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d "{\"nombre_election\":\"Test\",\"fecha_inicio\":\"2025-01-01\",\"fecha_fin\":\"2025-12-31\",\"estado_election\":\"Pendiente\",\"id_admin\":1}"
```

**Con token de votante (debe fallar 403):**
```bash
curl -X POST http://localhost:3000/elections \
  -H "Authorization: Bearer TOKEN_VOTANTE" \
  -H "Content-Type: application/json" \
  -d "{...}"
```

---

## 🎯 CHECKLIST DE VALIDACIÓN

- [ ] Login retorna token JWT válido
- [ ] Token expira según el tipo de usuario
- [ ] Endpoints sin token retornan 401
- [ ] Endpoints con rol incorrecto retornan 403
- [ ] Votos solo por votantes autenticados
- [ ] No se puede votar dos veces en la misma elección
- [ ] Elecciones solo gestionables por admins

---

## 🔍 DEBUGGING

Si algo falla:

1. **Verificar .env.local existe y tiene JWT_SECRET**
2. **Verificar base de datos tiene usuarios**
3. **Verificar logs del servidor**
4. **Probar con Postman en lugar de curl**
