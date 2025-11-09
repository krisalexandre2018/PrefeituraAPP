import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/api';

const ResetPasswordScreen = ({ navigation, route }) => {
  const [token, setToken] = useState(route.params?.token || '');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!token || token.trim().length === 0) {
      newErrors.token = 'Token é obrigatório';
    }

    if (!novaSenha) {
      newErrors.novaSenha = 'Nova senha é obrigatória';
    } else if (novaSenha.length < 6) {
      newErrors.novaSenha = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!confirmarSenha) {
      newErrors.confirmarSenha = 'Confirme sua senha';
    } else if (novaSenha !== confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(token.trim(), novaSenha);

      Alert.alert(
        'Senha redefinida!',
        'Sua senha foi alterada com sucesso. Faça login com sua nova senha.',
        [
          {
            text: 'Ir para Login',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao redefinir senha';

      if (message.includes('Token inválido') || message.includes('expirado')) {
        Alert.alert(
          'Token Inválido',
          'O token de recuperação é inválido ou expirou. Solicite um novo link de recuperação.',
          [
            {
              text: 'Solicitar Novo',
              onPress: () => navigation.navigate('ForgotPassword')
            },
            {
              text: 'Cancelar',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Erro', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#2563eb" />
          </TouchableOpacity>
          <Ionicons name="key-outline" size={80} color="#2563eb" />
          <Text style={styles.title}>Redefinir Senha</Text>
          <Text style={styles.subtitle}>
            Digite o código que você recebeu por email e sua nova senha
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Token */}
          <View style={styles.inputContainer}>
            <Ionicons name="receipt-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Código de recuperação"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          {errors.token && <Text style={styles.errorText}>{errors.token}</Text>}

          {/* Nova Senha */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nova senha"
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>
          {errors.novaSenha && <Text style={styles.errorText}>{errors.novaSenha}</Text>}

          {/* Confirmar Senha */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar nova senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmarSenha && <Text style={styles.errorText}>{errors.confirmarSenha}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Redefinir senha</Text>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
          >
            <Ionicons name="mail-outline" size={16} color="#2563eb" />
            <Text style={styles.linkText}>Não recebeu o código?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Ionicons name="arrow-back-outline" size={16} color="#64748b" />
            <Text style={[styles.linkText, { color: '#64748b' }]}>Voltar ao login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20
  },
  form: {
    width: '100%'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1e293b'
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0.1
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default ResetPasswordScreen;
