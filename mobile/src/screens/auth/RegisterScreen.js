import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  validateEmail,
  validateCPF,
  validatePhone,
  validatePassword,
  onlyNumbers
} from '../../utils/validation';

const RegisterScreen = ({ navigation }) => {
  const { signUp } = useAuth();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados de erro
  const [errors, setErrors] = useState({});

  const formatCPF = (text) => {
    return onlyNumbers(text).slice(0, 11);
  };

  const formatTelefone = (text) => {
    return onlyNumbers(text).slice(0, 11);
  };

  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleRegister = async () => {
    // Limpar erros anteriores
    const newErrors = {};

    // Validações
    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(email.trim())) {
      newErrors.email = 'Email inválido';
    }

    if (telefone && !validatePhone(telefone)) {
      newErrors.telefone = 'Telefone inválido (10 ou 11 dígitos)';
    }

    if (!senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (!validatePassword(senha)) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!confirmarSenha) {
      newErrors.confirmarSenha = 'Confirme sua senha';
    } else if (senha !== confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    // Se houver erros, exibir e retornar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const result = await signUp({
      nome,
      cpf,
      email: email.trim(),
      telefone,
      senha
    });
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Sucesso',
        result.message,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Cadastro de Vereador</Text>
          <Text style={styles.subtitle}>
            Preencha os dados abaixo para solicitar acesso
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            style={[styles.input, errors.nome && styles.inputError]}
            placeholder="João Silva"
            value={nome}
            onChangeText={(text) => {
              setNome(text);
              clearError('nome');
            }}
            autoCapitalize="words"
            editable={!loading}
          />
          {errors.nome ? <Text style={styles.errorText}>{errors.nome}</Text> : null}

          <Text style={styles.label}>CPF *</Text>
          <TextInput
            style={[styles.input, errors.cpf && styles.inputError]}
            placeholder="12345678900"
            value={cpf}
            onChangeText={(text) => {
              setCpf(formatCPF(text));
              clearError('cpf');
            }}
            keyboardType="numeric"
            maxLength={11}
            editable={!loading}
          />
          {errors.cpf ? <Text style={styles.errorText}>{errors.cpf}</Text> : null}

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="email@exemplo.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              clearError('email');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={[styles.input, errors.telefone && styles.inputError]}
            placeholder="11999999999"
            value={telefone}
            onChangeText={(text) => {
              setTelefone(formatTelefone(text));
              clearError('telefone');
            }}
            keyboardType="phone-pad"
            maxLength={11}
            editable={!loading}
          />
          {errors.telefone ? <Text style={styles.errorText}>{errors.telefone}</Text> : null}

          <Text style={styles.label}>Senha *</Text>
          <TextInput
            style={[styles.input, errors.senha && styles.inputError]}
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChangeText={(text) => {
              setSenha(text);
              clearError('senha');
            }}
            secureTextEntry
            editable={!loading}
          />
          {errors.senha ? <Text style={styles.errorText}>{errors.senha}</Text> : null}

          <Text style={styles.label}>Confirmar Senha *</Text>
          <TextInput
            style={[styles.input, errors.confirmarSenha && styles.inputError]}
            placeholder="Digite a senha novamente"
            value={confirmarSenha}
            onChangeText={(text) => {
              setConfirmarSenha(text);
              clearError('confirmarSenha');
            }}
            secureTextEntry
            editable={!loading}
          />
          {errors.confirmarSenha ? <Text style={styles.errorText}>{errors.confirmarSenha}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkText}>
              Já tem conta? Faça login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60
  },
  header: {
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b'
  },
  form: {
    width: '100%'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 4,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center'
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14
  }
});

export default RegisterScreen;
