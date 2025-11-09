import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, setUnauthorizedCallback } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadStoredData();

    // Registrar callback para auto-logout quando token expirar
    setUnauthorizedCallback(() => {
      handleUnauthorized();
    });

    return () => {
      // Limpar callback quando componente for desmontado
      setUnauthorizedCallback(null);
    };
  }, []);

  const loadStoredData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@user');
      const token = await AsyncStorage.getItem('@auth_token');

      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, senha) => {
    try {
      const response = await authService.login(email, senha);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao fazer login';
      return { success: false, error: message };
    }
  };

  const signUp = async (data) => {
    try {
      await authService.register(data);
      return {
        success: true,
        message: 'Cadastro realizado! Aguarde a aprovação do administrador.'
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao realizar cadastro';
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const updateUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const handleUnauthorized = async () => {
    // Chamado pelo interceptor quando token expira (401)
    setUser(null);
    setIsAuthenticated(false);
    // Dados já foram removidos do AsyncStorage pelo interceptor
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        updateUser,
        handleUnauthorized
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
