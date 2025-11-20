import axios from 'axios';
import { Platform } from 'react-native';

// Configuración de URLs por plataforma
const getBaseURL = () => {
  if (__DEV__) {
    // Modo desarrollo
    if (Platform.OS === 'android') {
      // Emulador Android
      return 'http://10.0.2.2:3000';
    } else if (Platform.OS === 'ios') {
      // Simulador iOS
      return 'http://localhost:3000';
    } else {
      // Web o dispositivo físico - usa tu IP local
      return 'http://localhost:3000'; // Cambiar por tu IP: http://192.168.x.x:3000
    }
  } else {
    // Producción - cambiar por URL de producción
    return 'https://tu-api-produccion.com';
  }
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos timeout
});

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Timeout: La petición tardó demasiado');
    } else if (error.message === 'Network Error') {
      console.error('🌐 Error de red: Verifica tu conexión o la URL del backend');
    } else {
      console.error('❌ Error de API:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;