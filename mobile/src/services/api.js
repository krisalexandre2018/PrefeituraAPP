import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ALTERE AQUI PARA O IP DO SEU COMPUTADOR OU URL DA API
const API_URL = 'http://192.168.2.104:3000/api';

// Callback para notificar quando usuário não está autenticado
let onUnauthorizedCallback = null;

export const setUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado - limpar dados locais
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user');

      // Notificar AuthContext para atualizar estado
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

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
    }
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@user');
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
