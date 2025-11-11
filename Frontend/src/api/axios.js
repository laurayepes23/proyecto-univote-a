import axios from 'axios';

// Cliente axios centralizado
const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // enviar cookies (access_token) al backend
});

// ------- Micro-caché en memoria para GET -------
const cacheStore = new Map(); // key -> { data, expiry }
const DEFAULT_TTL = 800; // ms

const buildKey = (url, params) => `${url}|${params ? JSON.stringify(params) : ''}`;

export const getWithCache = async (url, { params, ttl = DEFAULT_TTL } = {}) => {
    const key = buildKey(url, params);
    const now = Date.now();
    const cached = cacheStore.get(key);

    if (cached && cached.expiry > now) {
        return { data: cached.data };
    }

    const response = await api.get(url, { params });
    cacheStore.set(key, { data: response.data, expiry: now + ttl });
    return response;
};

export const invalidateCacheByPrefix = (prefix) => {
    for (const key of cacheStore.keys()) {
        if (key.startsWith(prefix)) {
            cacheStore.delete(key);
        }
    }
};

// Adjuntar token automáticamente si existe (placeholder por si se necesita en el futuro)
api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// Invalidar cache después de operaciones de escritura en endpoints de elecciones
api.interceptors.response.use(
        (response) => {
            try {
                const method = response?.config?.method?.toUpperCase();
                const url = response?.config?.url || '';
                if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && url.startsWith('/elections')) {
                    invalidateCacheByPrefix('/elections');
                }
            } catch {
                // no-op: cache invalidation is best-effort
            }
            return response;
        },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
                window.location.href = '/Login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;