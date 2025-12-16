import axios from 'axios';

// Determinar a URL base da API
const getApiBaseURL = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    // Se já termina com /api, retorna como está
    if (envUrl.endsWith('/api')) {
      return envUrl;
    }
    // Caso contrário, adiciona /api
    return `${envUrl}/api`;
  }
  
  // Fallback para localhost (apenas em desenvolvimento)
  const isProduction = import.meta.env.PROD;
  if (isProduction) {
    console.error(
      '⚠️ VITE_API_URL não está configurada! ' +
      'Configure a variável de ambiente no Vercel com a URL pública do backend. ' +
      'Acesse: Settings → Environment Variables → Adicione VITE_API_URL'
    );
  }
  
  return 'http://localhost:3000/api';
};

export const api = axios.create({
  baseURL: getApiBaseURL(),
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

