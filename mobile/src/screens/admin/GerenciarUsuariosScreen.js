import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { userService } from '../../services/api';

export default function GerenciarUsuariosScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('PENDENTE'); // PENDENTE, ATIVO, INATIVO, TODOS
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalApprovalVisible, setModalApprovalVisible] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState('VEREADOR');
  const [motivo, setMotivo] = useState('');
  const [stats, setStats] = useState(null);

  const loadUsuarios = async () => {
    try {
      setLoading(true);

      let data;
      if (filter === 'PENDENTE') {
        data = await userService.listPending();
      } else if (filter === 'TODOS') {
        const response = await userService.list();
        data = response.users;
      } else {
        const response = await userService.list({ status: filter });
        data = response.users;
      }

      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os usuários');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await userService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  useEffect(() => {
    loadUsuarios();
    loadStats();
  }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsuarios();
    loadStats();
  }, [filter]);

  const handleAprovar = async (userId) => {
    setSelectedUser(userId);
    setSelectedTipo('VEREADOR'); // Tipo padrão
    setModalApprovalVisible(true);
  };

  const confirmarAprovacao = async () => {
    try {
      await userService.approve(selectedUser, selectedTipo);
      Alert.alert('Sucesso', `Usuário aprovado como ${selectedTipo} com sucesso`);
      setModalApprovalVisible(false);
      setSelectedUser(null);
      loadUsuarios();
      loadStats();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao aprovar usuário');
    }
  };

  const handleDesativar = async (userId) => {
    setSelectedUser(userId);
    setModalVisible(true);
  };

  const confirmarDesativacao = async () => {
    try {
      await userService.deactivate(selectedUser, motivo);
      Alert.alert('Sucesso', 'Usuário desativado com sucesso');
      setModalVisible(false);
      setMotivo('');
      setSelectedUser(null);
      loadUsuarios();
      loadStats();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao desativar usuário');
    }
  };

  const handleReativar = async (userId) => {
    Alert.alert(
      'Reativar Usuário',
      'Deseja reativar este usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reativar',
          onPress: async () => {
            try {
              await userService.reactivate(userId);
              Alert.alert('Sucesso', 'Usuário reativado com sucesso');
              loadUsuarios();
              loadStats();
            } catch (error) {
              Alert.alert('Erro', error.response?.data?.error || 'Erro ao reativar usuário');
            }
          }
        }
      ]
    );
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'ADMIN': return '#e74c3c';
      case 'JURIDICO': return '#f39c12';
      case 'VEREADOR': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ATIVO': return '#27ae60';
      case 'PENDENTE': return '#f39c12';
      case 'INATIVO': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const renderUsuario = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.nome}>{item.nome}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getTipoColor(item.tipo) }]}>
            <Text style={styles.badgeText}>{item.tipo}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.info}>Email: {item.email}</Text>
        <Text style={styles.info}>CPF: {item.cpf}</Text>
        {item.telefone && <Text style={styles.info}>Tel: {item.telefone}</Text>}
        <Text style={styles.info}>
          Cadastro: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <View style={styles.actions}>
        {item.status === 'PENDENTE' && (
          <TouchableOpacity
            style={[styles.button, styles.buttonApprove]}
            onPress={() => handleAprovar(item.id)}
          >
            <Text style={styles.buttonText}>Aprovar</Text>
          </TouchableOpacity>
        )}

        {item.status === 'ATIVO' && (
          <TouchableOpacity
            style={[styles.button, styles.buttonDeactivate]}
            onPress={() => handleDesativar(item.id)}
          >
            <Text style={styles.buttonText}>Desativar</Text>
          </TouchableOpacity>
        )}

        {item.status === 'INATIVO' && (
          <TouchableOpacity
            style={[styles.button, styles.buttonReactivate]}
            onPress={() => handleReativar(item.id)}
          >
            <Text style={styles.buttonText}>Reativar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Estatísticas */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendentes}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.ativos}</Text>
            <Text style={styles.statLabel}>Ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.inativos}</Text>
            <Text style={styles.statLabel}>Inativos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      )}

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['PENDENTE', 'ATIVO', 'INATIVO', 'TODOS'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de Usuários */}
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id}
        renderItem={renderUsuario}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum usuário {filter.toLowerCase()} encontrado
            </Text>
          </View>
        }
        contentContainerStyle={usuarios.length === 0 ? styles.emptyList : null}
      />

      {/* Modal de Aprovação */}
      <Modal
        visible={modalApprovalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalApprovalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aprovar Usuário</Text>
            <Text style={styles.modalSubtitle}>
              Selecione o tipo de perfil para este usuário:
            </Text>

            <View style={styles.tipoContainer}>
              {['VEREADOR', 'JURIDICO', 'ADMIN'].map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.tipoButton,
                    selectedTipo === tipo && styles.tipoButtonActive,
                    { backgroundColor: selectedTipo === tipo ? getTipoColor(tipo) : '#ecf0f1' }
                  ]}
                  onPress={() => setSelectedTipo(tipo)}
                >
                  <Text
                    style={[
                      styles.tipoButtonText,
                      selectedTipo === tipo && styles.tipoButtonTextActive
                    ]}
                  >
                    {tipo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.tipoDescription}>
              {selectedTipo === 'VEREADOR' && (
                <Text style={styles.descriptionText}>
                  • Pode criar e gerenciar suas próprias ocorrências{'\n'}
                  • Visualiza apenas suas ocorrências{'\n'}
                  • Recebe notificações de atualizações
                </Text>
              )}
              {selectedTipo === 'JURIDICO' && (
                <Text style={styles.descriptionText}>
                  • Visualiza todas as ocorrências{'\n'}
                  • Pode atualizar status e adicionar comentários{'\n'}
                  • Acesso a relatórios e estatísticas
                </Text>
              )}
              {selectedTipo === 'ADMIN' && (
                <Text style={styles.descriptionText}>
                  • Acesso total ao sistema{'\n'}
                  • Gerencia usuários e aprovações{'\n'}
                  • Acesso a todas funcionalidades administrativas
                </Text>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setModalApprovalVisible(false);
                  setSelectedUser(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: '#27ae60' }]}
                onPress={confirmarAprovacao}
              >
                <Text style={styles.modalButtonText}>Aprovar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Desativação */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Desativar Usuário</Text>
            <Text style={styles.modalSubtitle}>
              Informe o motivo da desativação (opcional):
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Motivo da desativação"
              value={motivo}
              onChangeText={setMotivo}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setModalVisible(false);
                  setMotivo('');
                  setSelectedUser(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmarDesativacao}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    marginRight: 8
  },
  filterButtonActive: {
    backgroundColor: '#3498db'
  },
  filterText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '600'
  },
  filterTextActive: {
    color: '#fff'
  },
  card: {
    backgroundColor: '#fff',
    margin: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1
  },
  badges: {
    flexDirection: 'row',
    gap: 4
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  infoContainer: {
    marginBottom: 12
  },
  info: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center'
  },
  buttonApprove: {
    backgroundColor: '#27ae60'
  },
  buttonDeactivate: {
    backgroundColor: '#e74c3c'
  },
  buttonReactivate: {
    backgroundColor: '#3498db'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
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
    color: '#7f8c8d',
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: 'top'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  modalButtonCancel: {
    backgroundColor: '#95a5a6'
  },
  modalButtonConfirm: {
    backgroundColor: '#e74c3c'
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  tipoContainer: {
    marginVertical: 16,
    gap: 8
  },
  tipoButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  tipoButtonActive: {
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  tipoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d'
  },
  tipoButtonTextActive: {
    color: '#fff'
  },
  tipoDescription: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 80
  },
  descriptionText: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 20
  }
});
