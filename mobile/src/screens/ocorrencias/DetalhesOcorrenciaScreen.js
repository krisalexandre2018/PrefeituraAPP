import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ocorrenciaService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DetalhesOcorrenciaScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useAuth();
  const [ocorrencia, setOcorrencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [comentario, setComentario] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOcorrencia();
  }, []);

  const loadOcorrencia = async () => {
    try {
      const data = await ocorrenciaService.getById(id);
      setOcorrencia(data);
    } catch (error) {
      console.error('Erro ao carregar ocorrência:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta ocorrência?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await ocorrenciaService.delete(id);
              Alert.alert('Sucesso', 'Ocorrência excluída', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Erro', error.response?.data?.error || 'Não foi possível excluir');
            }
          }
        }
      ]
    );
  };

  const openMap = () => {
    if (ocorrencia?.latitude && ocorrencia?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${ocorrencia.latitude},${ocorrencia.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleEditStatus = () => {
    setSelectedStatus(ocorrencia.status);
    setComentario('');
    setModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      Alert.alert('Erro', 'Selecione um status');
      return;
    }

    if (!comentario.trim()) {
      Alert.alert('Erro', 'Adicione um comentário explicando a mudança');
      return;
    }

    try {
      setUpdating(true);
      await ocorrenciaService.updateStatus(id, {
        status: selectedStatus,
        comentario: comentario.trim()
      });

      Alert.alert('Sucesso', 'Status atualizado com sucesso');
      setModalVisible(false);
      setComentario('');
      loadOcorrencia(); // Recarregar para ver o histórico atualizado
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', error.response?.data?.error || 'Não foi possível atualizar o status');
    } finally {
      setUpdating(false);
    }
  };

  const canEditStatus = () => {
    return user?.tipo === 'JURIDICO' || user?.tipo === 'ADMIN';
  };

  const getStatusInfo = (status) => {
    const info = {
      PENDENTE: { label: 'Pendente', color: '#f59e0b', icon: 'time' },
      EM_ANALISE: { label: 'Em Análise', color: '#3b82f6', icon: 'eye' },
      RESOLVIDO: { label: 'Resolvido', color: '#10b981', icon: 'checkmark-circle' },
      REJEITADO: { label: 'Rejeitado', color: '#ef4444', icon: 'close-circle' }
    };
    return info[status] || info.PENDENTE;
  };

  const getCategoriaLabel = (categoria) => {
    const labels = {
      INFRAESTRUTURA: 'Infraestrutura',
      ILUMINACAO: 'Iluminação',
      LIMPEZA: 'Limpeza',
      SAUDE: 'Saúde',
      EDUCACAO: 'Educação',
      SEGURANCA: 'Segurança',
      TRANSPORTE: 'Transporte',
      MEIO_AMBIENTE: 'Meio Ambiente',
      OUTROS: 'Outros'
    };
    return labels[categoria] || categoria;
  };

  const getPrioridadeInfo = (prioridade) => {
    const info = {
      BAIXA: { label: 'Baixa', color: '#10b981' },
      MEDIA: { label: 'Média', color: '#f59e0b' },
      ALTA: { label: 'Alta', color: '#ef4444' }
    };
    return info[prioridade] || info.MEDIA;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!ocorrencia) {
    return null;
  }

  const statusInfo = getStatusInfo(ocorrencia.status);
  const prioridadeInfo = getPrioridadeInfo(ocorrencia.prioridade);

  return (
    <ScrollView style={styles.container}>
      {/* Galeria de Fotos */}
      {ocorrencia.fotos && ocorrencia.fotos.length > 0 && (
        <ScrollView horizontal pagingEnabled style={styles.gallery}>
          {ocorrencia.fotos.map((foto, index) => (
            <Image
              key={foto.id}
              source={{ uri: foto.urlFoto }}
              style={styles.galleryImage}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.content}>
        {/* Status e Prioridade */}
        <View style={styles.headerRow}>
          <View style={styles.badges}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Ionicons name={statusInfo.icon} size={16} color="#fff" />
              <Text style={styles.statusText}>{statusInfo.label}</Text>
            </View>

            <View style={[styles.priorityBadge, { borderColor: prioridadeInfo.color }]}>
              <Text style={[styles.priorityText, { color: prioridadeInfo.color }]}>
                Prioridade {prioridadeInfo.label}
              </Text>
            </View>
          </View>

          {/* Botão Editar Status (apenas JURIDICO e ADMIN) */}
          {canEditStatus() && (
            <TouchableOpacity style={styles.editButton} onPress={handleEditStatus}>
              <Ionicons name="create-outline" size={20} color="#2563eb" />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Título e Categoria */}
        <Text style={styles.title}>{ocorrencia.titulo}</Text>
        <Text style={styles.category}>{getCategoriaLabel(ocorrencia.categoria)}</Text>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{ocorrencia.descricao}</Text>
        </View>

        {/* Localização */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color="#2563eb" />
            <Text style={styles.address}>{ocorrencia.endereco}</Text>
          </View>
          {ocorrencia.latitude && ocorrencia.longitude && (
            <TouchableOpacity style={styles.mapButton} onPress={openMap}>
              <Ionicons name="map" size={16} color="#2563eb" />
              <Text style={styles.mapButtonText}>Ver no mapa</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registrado em:</Text>
            <Text style={styles.infoValue}>
              {new Date(ocorrencia.createdAt).toLocaleString('pt-BR')}
            </Text>
          </View>
          {ocorrencia.updatedAt !== ocorrencia.createdAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Atualizado em:</Text>
              <Text style={styles.infoValue}>
                {new Date(ocorrencia.updatedAt).toLocaleString('pt-BR')}
              </Text>
            </View>
          )}
        </View>

        {/* Histórico */}
        {ocorrencia.historicos && ocorrencia.historicos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histórico</Text>
            {ocorrencia.historicos.map((hist) => (
              <View key={hist.id} style={styles.historyItem}>
                <View style={styles.historyDot} />
                <View style={styles.historyContent}>
                  <Text style={styles.historyAction}>{hist.acao.replace(/_/g, ' ')}</Text>
                  <Text style={styles.historyUser}>
                    {hist.usuario.nome} ({hist.usuario.tipo})
                  </Text>
                  {hist.comentario && (
                    <Text style={styles.historyComment}>{hist.comentario}</Text>
                  )}
                  <Text style={styles.historyDate}>
                    {new Date(hist.createdAt).toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Botão de Excluir (apenas se pendente) */}
        {ocorrencia.status === 'PENDENTE' && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Excluir Ocorrência</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal de Edição de Status */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Atualizar Status</Text>
            <Text style={styles.modalSubtitle}>
              Selecione o novo status e adicione um comentário:
            </Text>

            {/* Opções de Status */}
            <View style={styles.statusOptions}>
              {['PENDENTE', 'EM_ANALISE', 'RESOLVIDO', 'REJEITADO'].map((status) => {
                const statusInfo = getStatusInfo(status);
                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      selectedStatus === status && {
                        backgroundColor: statusInfo.color,
                        borderColor: statusInfo.color
                      }
                    ]}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <Ionicons
                      name={statusInfo.icon}
                      size={20}
                      color={selectedStatus === status ? '#fff' : statusInfo.color}
                    />
                    <Text
                      style={[
                        styles.statusOptionText,
                        selectedStatus === status && styles.statusOptionTextActive
                      ]}
                    >
                      {statusInfo.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Campo de Comentário */}
            <Text style={styles.inputLabel}>Comentário *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Recebido, vamos analisar..."
              value={comentario}
              onChangeText={setComentario}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Botões */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setModalVisible(false);
                  setComentario('');
                }}
                disabled={updating}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  updating && styles.modalButtonDisabled
                ]}
                onPress={handleUpdateStatus}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Atualizar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  gallery: {
    height: 300,
    backgroundColor: '#000'
  },
  galleryImage: {
    width: 400,
    height: 300,
    resizeMode: 'cover'
  },
  content: {
    padding: 20
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  badges: {
    flexDirection: 'row',
    gap: 12,
    flex: 1
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  editButtonText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2
  },
  priorityText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4
  },
  category: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12
  },
  description: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8
  },
  address: {
    fontSize: 16,
    color: '#334155',
    flex: 1
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8
  },
  mapButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b'
  },
  infoValue: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500'
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 16
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb',
    marginTop: 4,
    marginRight: 12
  },
  historyContent: {
    flex: 1
  },
  historyAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4
  },
  historyUser: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4
  },
  historyComment: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4
  },
  historyDate: {
    fontSize: 12,
    color: '#94a3b8'
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ef4444',
    marginTop: 16
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold'
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
    maxWidth: 500
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16
  },
  statusOptions: {
    gap: 10,
    marginBottom: 16
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc'
  },
  statusOptionText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600'
  },
  statusOptionTextActive: {
    color: '#fff'
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 16,
    minHeight: 100
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48
  },
  modalButtonCancel: {
    backgroundColor: '#94a3b8'
  },
  modalButtonConfirm: {
    backgroundColor: '#2563eb'
  },
  modalButtonDisabled: {
    opacity: 0.6
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default DetalhesOcorrenciaScreen;
