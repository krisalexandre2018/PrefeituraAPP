import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import HomeScreen from '../screens/home/HomeScreen';
import NovaOcorrenciaScreen from '../screens/ocorrencias/NovaOcorrenciaScreen';
import DetalhesOcorrenciaScreen from '../screens/ocorrencias/DetalhesOcorrenciaScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import GerenciarUsuariosScreen from '../screens/admin/GerenciarUsuariosScreen';
import NotificacoesScreen from '../screens/notificacoes/NotificacoesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegação principal com tabs
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Nova') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Notificacoes') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen
        name="Nova"
        component={NovaOcorrenciaScreen}
        options={{ tabBarLabel: 'Nova Ocorrência' }}
      />
      <Tab.Screen
        name="Notificacoes"
        component={NotificacoesScreen}
        options={{ tabBarLabel: 'Notificações' }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// Navegação principal
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Telas de autenticação
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      ) : (
        // Telas principais
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="DetalhesOcorrencia"
            component={DetalhesOcorrenciaScreen}
            options={{
              headerShown: true,
              title: 'Detalhes da Ocorrência'
            }}
          />
          <Stack.Screen
            name="GerenciarUsuarios"
            component={GerenciarUsuariosScreen}
            options={{
              headerShown: true,
              title: 'Gerenciar Usuários'
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
