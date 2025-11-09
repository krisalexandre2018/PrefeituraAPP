import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut }
      ]
    );
  };

  const getStatusInfo = (status) => {
    const info = {
      PENDENTE: { label: 'Pendente', color: '#f59e0b', icon: 'time' },
      ATIVO: { label: 'Ativo', color: '#10b981', icon: 'checkmark-circle' },
      INATIVO: { label: 'Inativo', color: '#64748b', icon: 'close-circle' }
    };
    return info[status] || info.ATIVO;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      ADMIN: 'Administrador',
      VEREADOR: 'Vereador',
      JURIDICO: 'Equipe Jurídica'
    };
    return labels[tipo] || tipo;
  };

  const statusInfo = getStatusInfo(user?.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.nome}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <Ionicons name={statusInfo.icon} size={14} color="#fff" />
          <Text style={styles.statusText}>{statusInfo.label}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="card" size={20} color="#2563eb" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>CPF</Text>
                <Text style={styles.infoValue}>{user?.cpf}</Text>
              </View>
            </View>

            {user?.telefone && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="call" size={20} color="#2563eb" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Telefone</Text>
                  <Text style={styles.infoValue}>{user.telefone}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#2563eb" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tipo de Acesso</Text>
                <Text style={styles.infoValue}>{getTipoLabel(user?.tipo)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar" size={20} color="#2563eb" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Membro desde</Text>
                <Text style={styles.infoValue}>
                  {new Date(user?.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {user?.isSuperAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administração</Text>
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => navigation.navigate('GerenciarUsuarios')}
            >
              <View style={styles.adminButtonContent}>
                <View style={styles.adminIcon}>
                  <Ionicons name="people" size={24} color="#fff" />
                </View>
                <View style={styles.adminTextContainer}>
                  <Text style={styles.adminButtonTitle}>Gerenciar Usuários</Text>
                  <Text style={styles.adminButtonSubtitle}>
                    Aprovar cadastros e gerenciar contas
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#64748b" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o App</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              Sistema de Registro de Ocorrências Urbanas
            </Text>
            <Text style={styles.aboutVersion}>Versão 1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 40,
    paddingTop: 80,
    alignItems: 'center'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  email: {
    fontSize: 14,
    color: '#bfdbfe',
    marginBottom: 12
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
    fontSize: 12,
    fontWeight: 'bold'
  },
  content: {
    padding: 20
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  infoContent: {
    flex: 1
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500'
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  aboutText: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 8
  },
  aboutVersion: {
    fontSize: 12,
    color: '#94a3b8'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ef4444',
    marginTop: 8
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold'
  },
  adminButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  adminButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  adminIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  adminTextContainer: {
    flex: 1
  },
  adminButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4
  },
  adminButtonSubtitle: {
    fontSize: 12,
    color: '#64748b'
  }
});

export default ProfileScreen;
