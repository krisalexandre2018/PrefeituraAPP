import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificacaoService } from '../../services/api';

const NotificacoesScreen = ({ navigation }) => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotificacoes();
  }, []);

  const loadNotificacoes = async () => {
    try {
      setLoading(true);
      const data = await notificacaoService.list();
      setNotificacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setNotificacoes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotificacoes();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificacaoService.markAsRead(id);
      loadNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificacaoService.markAllAsRead();
      loadNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      STATUS_ALTERADO: 'swap-horizontal',
      APROVACAO: 'checkmark-circle',
      DESATIVACAO: 'close-circle',
      REATIVACAO: 'refresh-circle',
      ALTERACAO_TIPO: 'person-circle',
      NOVA_OCORRENCIA: 'add-circle'
    };
    return icons[tipo] || 'notifications';
  };

  const getTipoColor = (tipo) => {
    const colors = {
      STATUS_ALTERADO: '#3b82f6',
      APROVACAO: '#10b981',
      DESATIVACAO: '#ef4444',
      REATIVACAO: '#10b981',
      ALTERACAO_TIPO: '#f59e0b',
      NOVA_OCORRENCIA: '#8b5cf6'
    };
    return colors[tipo] || '#64748b';
  };

  const renderNotificacao = ({ item }) => {
    const iconName = getTipoIcon(item.tipo);
    const iconColor = getTipoColor(item.tipo);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.lida && styles.notificationUnread
        ]}
        onPress={() => !item.lida && handleMarkAsRead(item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            {!item.lida && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.mensagem}>{item.mensagem}</Text>
          <Text style={styles.data}>
            {new Date(item.createdAt).toLocaleString('pt-BR')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const hasUnread = notificacoes.some(n => !n.lida);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Notificações</Text>
        {hasUnread && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Ionicons name="checkmark-done" size={20} color="#2563eb" />
            <Text style={styles.markAllText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista */}
      <FlatList
        data={notificacoes}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificacao}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhuma notificação</Text>
          </View>
        }
        contentContainerStyle={notificacoes.length === 0 ? styles.emptyList : styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pageHeader: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8
  },
  markAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600'
  },
  list: {
    padding: 16
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  notificationUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb'
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb'
  },
  mensagem: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20
  },
  data: {
    fontSize: 12,
    color: '#94a3b8'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyList: {
    flexGrow: 1
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16
  }
});

export default NotificacoesScreen;
