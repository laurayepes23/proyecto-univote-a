import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    headers: { "Content-Type": "application/json" },
});

// Interceptor para adjuntar JWT si existe
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Manejo centralizado de errores de autenticación
api.interceptors.response.use(
    (resp) => resp,
    (error) => {
        if (error.response) {
            const status = error.response.status;

            // Token expirado o inválido
            if (status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                // Redirigir a login solo si no estamos ya en login
                if (!window.location.pathname.includes("/login")) {
                    window.location.href = "/login";
                }
            }

            // Forbidden - usuario no tiene permisos
            if (status === 403) {
                console.error("Acceso denegado: no tiene permisos para esta acción");
            }
        }

        return Promise.reject(error);
    }
);

export default api;