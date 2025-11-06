
#### 3. Configurar el Frontend

```bash
cd Frontend
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Instalación con Docker

```bash
cd Backend
docker-compose up -d
```

Esto iniciará tanto la base de datos PostgreSQL como el backend de la aplicación.

## 📚 Documentación Adicional

Para información detallada sobre cada componente del proyecto:

- [📖 Documentación del Backend](./Backend/README.md)
- [📖 Documentación del Frontend](./Frontend/README.md)

## 🗄️ Modelo de Datos

El sistema maneja las siguientes entidades principales:

- **Administrador**: Gestiona el sistema y las elecciones
- **Voter (Votante)**: Usuarios con derecho a voto
- **Candidate (Candidato)**: Usuarios postulados a elecciones
- **Election (Elección)**: Procesos electorales
- **Vote (Voto)**: Registro de votos emitidos
- **Proposal (Propuesta)**: Propuestas de campaña de los candidatos
- **Career (Carrera)**: Carreras académicas
- **Role (Rol)**: Roles del sistema
- **Result (Resultado)**: Resultados de las elecciones

## 🔐 Roles y Permisos

### Administrador

- Crear y gestionar elecciones
- Aprobar o rechazar candidatos
- Gestionar votantes
- Iniciar y cerrar votaciones
- Consultar resultados

### Votante

- Registrarse en el sistema
- Ver elecciones disponibles
- Emitir voto (una vez por elección)
- Consultar candidatos y propuestas
- Ver resultados

### Candidato

- Registrarse como candidato
- Postularse a elecciones
- Crear y gestionar propuestas
- Ver resultados de elecciones

## 🛠️ Stack Tecnológico

### Backend

- NestJS 11
- TypeScript 5
- Prisma 6
- PostgreSQL 15
- Bcrypt
- Axios
- Express

### Frontend

- React 19
- Vite 7
- React Router DOM 7
- Tailwind CSS 4
- Material Tailwind
- Axios
- jsPDF

### Herramientas de Desarrollo

- ESLint
- Prettier
- Jest (Testing)
- Docker
- Git

## 📝 Scripts Disponibles

### Backend

```bash
npm run start:dev      # Modo desarrollo
npm run build          # Compilar proyecto
npm run start:prod     # Modo producción
npm run test           # Ejecutar tests
npm run lint           # Linter
```

### Frontend

```bash
npm run dev            # Modo desarrollo
npm run build          # Compilar para producción
npm run preview        # Previsualizar build
npm run lint           # Linter
```
