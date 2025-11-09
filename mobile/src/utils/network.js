import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

/**
 * Verifica se há conexão com a internet
 */
export const checkNetworkConnection = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable;
};

/**
 * Mostra alerta se não houver conexão
 */
export const showNoConnectionAlert = () => {
  Alert.alert(
    'Sem Conexão',
    'Você está sem conexão com a internet. Algumas funcionalidades podem não funcionar.',
    [{ text: 'OK' }]
  );
};

/**
 * Hook para monitorar conexão
 */
export const setupNetworkListener = (onConnectionChange) => {
  return NetInfo.addEventListener(state => {
    onConnectionChange(state.isConnected && state.isInternetReachable);
  });
};
