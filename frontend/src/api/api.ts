import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? (import.meta.env.VITE_API_URL.endsWith('/api') 
        ? import.meta.env.VITE_API_URL 
        : `${import.meta.env.VITE_API_URL}/api`)
    : 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição - adiciona token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta - tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não fazer nada com erro 429 (Too Many Requests) - deixar o componente tratar
    if (error.response?.status === 429) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedProject');
      // Redirecionar para login apenas se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

