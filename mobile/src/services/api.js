import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// CONFIGURAÇÃO DE AMBIENTE
// ============================================
// Mude para 'production' para usar a API do Render
// Mude para 'development' para usar a API local
const ENVIRONMENT = 'production'; // 'development' | 'production'

const API_URLS = {
  development: 'http://192.168.2.104:8080/api', // IP local - ajuste conforme necessário
  production: 'https://vereadores-api.onrender.com/api' // API em produção no Render
};

const API_URL = API_URLS[ENVIRONMENT];

console.log(`📡 API conectada em: ${API_URL} (${ENVIRONMENT})`);
// ============================================

// Callback para notificar quando usuário não está autenticado
let onUnauthorizedCallback = null;

export const setUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 90000, // 90 segundos para aguardar API acordar no Render Free
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token JWT e CSRF automaticamente
api.interceptors.request.use(
  async (config) => {
    // Adicionar token JWT
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar token CSRF para métodos de modificação (POST, PUT, PATCH, DELETE)
    const modifyMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (modifyMethods.includes(config.method?.toUpperCase())) {
      const csrfToken = await AsyncStorage.getItem('@csrf_token');
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação e CSRF
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Erro 401 - Token JWT inválido ou expirado
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user');
      await AsyncStorage.removeItem('@csrf_token');

      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    // Erro 403 - Pode ser token CSRF inválido/expirado
    if (error.response?.status === 403 && error.response?.data?.error?.includes('CSRF')) {
      // Tentar obter novo token CSRF e refazer requisição (apenas 1 vez)
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        const newCsrfToken = await getCsrfToken();
        if (newCsrfToken) {
          originalRequest.headers['x-csrf-token'] = newCsrfToken;
          return api(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Função auxiliar para obter token CSRF
export const getCsrfToken = async () => {
  try {
    const response = await api.get('/csrf/token');
    const csrfToken = response.data.csrfToken;
    await AsyncStorage.setItem('@csrf_token', csrfToken);
    return csrfToken;
  } catch (error) {
    console.warn('Erro ao obter token CSRF:', error.message);
    return null;
  }
};

// Serviço de Autenticação
export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    if (response.data.token) {
      await AsyncStorage.setItem('@auth_token', response.data.token);
      await AsyncStorage.setItem('@user', JSON.stringify(response.data.user));

      // Buscar token CSRF após login
      await getCsrfToken();
    }
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@user');
    await AsyncStorage.removeItem('@csrf_token');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, novaSenha) => {
    const response = await api.post('/auth/reset-password', { token, novaSenha });
    return response.data;
  }
};

// Serviço de Ocorrências
export const ocorrenciaService = {
  create: async (data) => {
    const formData = new FormData();

    formData.append('titulo', data.titulo);
    formData.append('descricao', data.descricao);
    formData.append('categoria', data.categoria);
    formData.append('endereco', data.endereco);
    formData.append('prioridade', data.prioridade || 'MEDIA');

    if (data.latitude) formData.append('latitude', data.latitude.toString());
    if (data.longitude) formData.append('longitude', data.longitude.toString());

    // Adicionar fotos
    if (data.fotos && data.fotos.length > 0) {
      data.fotos.forEach((foto, index) => {
        formData.append('fotos', {
          uri: foto.uri,
          type: 'image/jpeg',
          name: `foto_${index}.jpg`
        });
      });
    }

    const response = await api.post('/ocorrencias', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  list: async (params = {}) => {
    const response = await api.get('/ocorrencias', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/ocorrencias/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/ocorrencias/${id}`);
    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await api.patch(`/ocorrencias/${id}/status`, data);
    return response.data;
  }
};

// Serviço de Notificações
export const notificacaoService = {
  list: async (lida) => {
    const params = lida !== undefined ? { lida } : {};
    const response = await api.get('/notificacoes', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notificacoes/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notificacoes/read-all');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notificacoes/unread-count');
    return response.data.count;
  }
};

// Serviço de Usuários (Admin)
export const userService = {
  list: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  listPending: async () => {
    const response = await api.get('/users/pending');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  approve: async (id, tipo) => {
    const response = await api.patch(`/users/${id}/approve`, { tipo });
    return response.data;
  },

  deactivate: async (id, motivo) => {
    const response = await api.patch(`/users/${id}/deactivate`, { motivo });
    return response.data;
  },

  reactivate: async (id) => {
    const response = await api.patch(`/users/${id}/reactivate`);
    return response.data;
  },

  updateType: async (id, tipo) => {
    const response = await api.patch(`/users/${id}/type`, { tipo });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  }
};

export default api;
