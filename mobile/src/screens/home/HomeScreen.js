import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ocorrenciaService } from '../../services/api';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOcorrencias();
  }, []);

  const loadOcorrencias = async () => {
    try {
      setError(null);
      const response = await ocorrenciaService.list();
      setOcorrencias(response.ocorrencias || []);
    } catch (error) {
      console.error('Erro ao carregar ocorrências:', error);
      const errorMessage = error.response?.data?.error ||
                          error.message ||
                          'Não foi possível carregar as ocorrências. Verifique sua conexão.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOcorrencias();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      PENDENTE: '#f59e0b',
      EM_ANALISE: '#3b82f6',
      RESOLVIDO: '#10b981',
      REJEITADO: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDENTE: 'Pendente',
      EM_ANALISE: 'Em Análise',
      RESOLVIDO: 'Resolvido',
      REJEITADO: 'Rejeitado'
    };
    return labels[status] || status;
  };

  const renderOcorrencia = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DetalhesOcorrencia', { id: item.id })}
    >
      {item.fotos && item.fotos.length > 0 && (
        <Image
          source={{ uri: item.fotos[0].thumbnailUrl || item.fotos[0].urlFoto }}
          style={styles.cardImage}
        />
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.titulo}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.descricao}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardInfo}>
            <Ionicons name="location-outline" size={14} color="#64748b" />
            <Text style={styles.cardInfoText} numberOfLines={1}>
              {item.endereco}
            </Text>
          </View>

          <Text style={styles.cardDate}>
            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.nome?.split(' ')[0]}</Text>
          <Text style={styles.subgreeting}>Suas ocorrências registradas</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadOcorrencias} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={ocorrencias}
        renderItem={renderOcorrencia}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !error && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                Nenhuma ocorrência registrada
              </Text>
              <Text style={styles.emptySubtext}>
                Toque em "Nova Ocorrência" para começar
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  subgreeting: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  list: {
    padding: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e2e8f0'
  },
  cardContent: {
    padding: 16
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    marginRight: 8
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  cardInfoText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4
  },
  cardDate: {
    fontSize: 12,
    color: '#94a3b8'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  errorText: {
    flex: 1,
    color: '#991b1b',
    fontSize: 14,
    marginLeft: 8
  },
  retryButton: {
    marginTop: 8,
    marginLeft: 28,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ef4444',
    borderRadius: 4
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  }
});

export default HomeScreen;
