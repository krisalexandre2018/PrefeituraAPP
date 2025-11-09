import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ocorrenciaService } from '../../services/api';
import { compressImage } from '../../utils/imageCompressor';

const CATEGORIAS = [
  { value: 'INFRAESTRUTURA', label: 'Infraestrutura' },
  { value: 'ILUMINACAO', label: 'Iluminação' },
  { value: 'LIMPEZA', label: 'Limpeza' },
  { value: 'SAUDE', label: 'Saúde' },
  { value: 'EDUCACAO', label: 'Educação' },
  { value: 'SEGURANCA', label: 'Segurança' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'MEIO_AMBIENTE', label: 'Meio Ambiente' },
  { value: 'OUTROS', label: 'Outros' }
];

const PRIORIDADES = [
  { value: 'BAIXA', label: 'Baixa', color: '#10b981' },
  { value: 'MEDIA', label: 'Média', color: '#f59e0b' },
  { value: 'ALTA', label: 'Alta', color: '#ef4444' }
];

const NovaOcorrenciaScreen = ({ navigation }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('OUTROS');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [endereco, setEndereco] = useState('');
  const [fotos, setFotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    requestPermissions();
    getCurrentLocation();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

    if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'Este app precisa de acesso à câmera e localização para funcionar corretamente.'
      );
    }
  };

  const getCurrentLocation = async (showAlert = false) => {
    try {
      // Verificar se tem permissão primeiro
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de localização não concedida');
        if (showAlert) {
          Alert.alert(
            'Permissão necessária',
            'Por favor, conceda permissão de localização nas configurações do app.'
          );
        }
        return;
      }

      // Verificar se os serviços de localização estão habilitados
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.log('Serviços de localização desabilitados');
        if (showAlert) {
          Alert.alert(
            'GPS Desabilitado',
            'Por favor, ative os serviços de localização nas configurações do dispositivo.'
          );
        }
        return;
      }

      // Primeira tentativa: precisão balanceada
      let coords = null;
      try {
        const result = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 15000,
          maximumAge: 10000
        });
        coords = result.coords;
      } catch (firstError) {
        console.log('Primeira tentativa falhou, tentando com baixa precisão...', firstError.message);

        // Segunda tentativa: baixa precisão (mais rápido e confiável)
        try {
          const result = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
            timeout: 20000,
            maximumAge: 30000
          });
          coords = result.coords;
        } catch (secondError) {
          console.log('Segunda tentativa falhou, tentando última posição conhecida...', secondError.message);

          // Terceira tentativa: última posição conhecida
          const lastKnown = await Location.getLastKnownPositionAsync({
            maxAge: 300000, // 5 minutos
            requiredAccuracy: 1000 // 1km
          });

          if (lastKnown) {
            coords = lastKnown.coords;
            console.log('Usando última posição conhecida');
          } else {
            throw new Error('Não foi possível obter localização');
          }
        }
      }

      if (coords) {
        setLocation(coords);

        // Obter endereço da localização
        try {
          const [address] = await Location.reverseGeocodeAsync(coords);
          if (address) {
            const addressParts = [
              address.street,
              address.streetNumber,
              address.name,
              address.district || address.subregion,
              address.city
            ].filter(Boolean);

            const addressString = addressParts.join(', ');
            setEndereco(addressString);
          }
        } catch (geocodeError) {
          console.log('Erro ao obter endereço:', geocodeError.message);
          // GPS obtido, mas falha no geocoding - não é crítico
        }

        if (showAlert) {
          Alert.alert('Sucesso', 'Localização obtida com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      if (showAlert) {
        Alert.alert(
          'Erro de Localização',
          'Não foi possível obter sua localização. Você pode digitar o endereço manualmente.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const takePhoto = async () => {
    if (fotos.length >= 5) {
      Alert.alert('Limite atingido', 'Você pode adicionar no máximo 5 fotos');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1.0 // Qualidade máxima, vamos comprimir depois
      });

      if (!result.canceled) {
        setIsCompressing(true);
        const compressed = await compressImage(result.assets[0].uri, 1200, 0.7);
        setFotos([...fotos, { ...result.assets[0], uri: compressed.uri }]);
        setIsCompressing(false);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto. Tente novamente.');
      setIsCompressing(false);
    }
  };

  const pickImage = async () => {
    if (fotos.length >= 5) {
      Alert.alert('Limite atingido', 'Você pode adicionar no máximo 5 fotos');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1.0 // Qualidade máxima, vamos comprimir depois
      });

      if (!result.canceled) {
        setIsCompressing(true);
        const compressed = await compressImage(result.assets[0].uri, 1200, 0.7);
        setFotos([...fotos, { ...result.assets[0], uri: compressed.uri }]);
        setIsCompressing(false);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem. Tente novamente.');
      setIsCompressing(false);
    }
  };

  const removePhoto = (index) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validações
    if (!titulo.trim()) {
      Alert.alert('Erro', 'Por favor, informe o título');
      return;
    }

    if (!descricao.trim()) {
      Alert.alert('Erro', 'Por favor, informe a descrição');
      return;
    }

    if (!endereco.trim()) {
      Alert.alert('Erro', 'Por favor, informe o endereço');
      return;
    }

    if (fotos.length === 0) {
      Alert.alert('Atenção', 'Deseja enviar sem fotos?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar assim mesmo', onPress: submitOcorrencia }
      ]);
      return;
    }

    await submitOcorrencia();
  };

  const submitOcorrencia = async () => {
    setLoading(true);
    setUploadProgress(0);

    try {
      // Simular progresso (em produção, você implementaria progresso real)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      await ocorrenciaService.create({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        prioridade,
        endereco: endereco.trim(),
        latitude: location?.latitude,
        longitude: location?.longitude,
        fotos
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      Alert.alert(
        'Sucesso',
        'Ocorrência registrada com sucesso! A equipe jurídica foi notificada.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpar formulário
              setTitulo('');
              setDescricao('');
              setCategoria('OUTROS');
              setPrioridade('MEDIA');
              setFotos([]);
              setUploadProgress(0);
              getCurrentLocation();

              // Voltar para home
              navigation.navigate('Home');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao criar ocorrência:', error);
      const errorMessage = error.response?.data?.error ||
                          error.message ||
                          'Não foi possível registrar a ocorrência. Verifique sua conexão e tente novamente.';
      Alert.alert('Erro', errorMessage);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nova Ocorrência</Text>
        <Text style={styles.subtitle}>
          Registre problemas urbanos para análise jurídica
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Buraco na via"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Descrição *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva o problema em detalhes"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Categoria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryButton,
                categoria === cat.value && styles.categoryButtonActive
              ]}
              onPress={() => setCategoria(cat.value)}
            >
              <Text
                style={[
                  styles.categoryText,
                  categoria === cat.value && styles.categoryTextActive
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Prioridade</Text>
        <View style={styles.priorityContainer}>
          {PRIORIDADES.map((prior) => (
            <TouchableOpacity
              key={prior.value}
              style={[
                styles.priorityButton,
                prioridade === prior.value && {
                  backgroundColor: prior.color,
                  borderColor: prior.color
                }
              ]}
              onPress={() => setPrioridade(prior.value)}
            >
              <Text
                style={[
                  styles.priorityText,
                  prioridade === prior.value && styles.priorityTextActive
                ]}
              >
                {prior.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.locationHeader}>
          <Text style={styles.label}>Endereço *</Text>
          <TouchableOpacity
            style={styles.getLocationButton}
            onPress={() => getCurrentLocation(true)}
          >
            <Ionicons name="location" size={16} color="#2563eb" />
            <Text style={styles.getLocationText}>Obter GPS</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Rua, número, bairro"
          value={endereco}
          onChangeText={setEndereco}
        />
        {location && (
          <Text style={styles.gpsInfo}>
            GPS: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
        )}

        <Text style={styles.label}>Fotos ({fotos.length}/5)</Text>
        <View style={styles.photosContainer}>
          {fotos.map((foto, index) => (
            <View key={index} style={styles.photoItem}>
              <Image source={{ uri: foto.uri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}

          {fotos.length < 5 && (
            <>
              <TouchableOpacity style={styles.addPhotoButton} onPress={takePhoto}>
                <Ionicons name="camera" size={32} color="#64748b" />
                <Text style={styles.addPhotoText}>Câmera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                <Ionicons name="images" size={32} color="#64748b" />
                <Text style={styles.addPhotoText}>Galeria</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {isCompressing && (
          <View style={styles.compressingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.compressingText}>Otimizando imagem...</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, (loading || isCompressing) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || isCompressing}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" />
              {uploadProgress > 0 && (
                <Text style={styles.progressText}>
                  Enviando... {uploadProgress}%
                </Text>
              )}
            </View>
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Registrar Ocorrência</Text>
            </>
          )}
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
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  form: {
    padding: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 8
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  getLocationButton: {
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
  getLocationText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600'
  },
  gpsInfo: {
    fontSize: 11,
    color: '#10b981',
    marginTop: 4,
    fontStyle: 'italic'
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  categoryScroll: {
    marginBottom: 8
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8
  },
  categoryButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  categoryText: {
    fontSize: 14,
    color: '#64748b'
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  priorityText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600'
  },
  priorityTextActive: {
    color: '#fff'
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  photoItem: {
    position: 'relative'
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  addPhotoText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8
  },
  submitButtonDisabled: {
    opacity: 0.7
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  compressingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginBottom: 16
  },
  compressingText: {
    marginLeft: 8,
    color: '#2563eb',
    fontSize: 14
  },
  loadingContainer: {
    alignItems: 'center'
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4
  }
});

export default NovaOcorrenciaScreen;
