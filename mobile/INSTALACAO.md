# Guia de Instalacao - App Mobile Vereadores

## Requisitos

- Node.js 18 ou superior
- Expo CLI (instalado globalmente)
- Dispositivo fisico ou emulador Android/iOS
- Backend rodando (pasta backend/)

## Passos de Instalacao

### 1. Instalar Dependencias

```bash
cd mobile
npm install
```

### 2. Configurar URL da API

Edite o arquivo `src/services/api.js` na linha 5:

```javascript
const API_URL = 'http://SEU_IP_AQUI:3000/api';
```

**Como descobrir seu IP:**

**Windows:**
```bash
ipconfig
# Procure por "Endereco IPv4"
```

**Linux/Mac:**
```bash
ifconfig
# ou
ip addr show
```

**IMPORTANTE:**
- Nao use `localhost` ou `127.0.0.1`
- Use o IP da sua rede local (ex: 192.168.1.100)
- Certifique-se de que o backend esta rodando neste IP

### 3. Instalar Expo Go no Dispositivo

- **Android:** Google Play Store
- **iOS:** App Store

Busque por "Expo Go" e instale.

### 4. Iniciar o App

```bash
npm start
```

Isso abrira o Expo DevTools no navegador.

### 5. Executar no Dispositivo

**Opcao A: Dispositivo Fisico (Recomendado)**

1. Certifique-se de que seu celular esta na mesma rede Wi-Fi do computador
2. Abra o app Expo Go no celular
3. Escaneie o QR Code que aparece no terminal/navegador
4. O app sera carregado automaticamente

**Opcao B: Emulador Android**

```bash
npm run android
```

**Opcao C: Simulador iOS (apenas Mac)**

```bash
npm run ios
```

## Problemas Comuns

### "Network request failed"

**Causa:** App nao consegue se conectar ao backend

**Solucao:**
1. Verifique se o backend esta rodando: `http://SEU_IP:3000/health`
2. Confirme o IP no arquivo `src/services/api.js`
3. Certifique-se de que dispositivo e computador estao na mesma rede

### "Expo Go has stopped"

**Solucao:**
```bash
# Limpar cache
expo start -c

# Ou reinstalar dependencias
rm -rf node_modules
npm install
```

### Camera nao funciona

**Solucao:**
1. Va em Configuracoes do celular
2. Apps > Expo Go > Permissoes
3. Ative Camera e Localizacao

### GPS nao funciona

**Solucao:**
1. Ative o GPS no dispositivo
2. Conceda permissao de localizacao para Expo Go
3. Em iOS, conceda permissao "Sempre" ou "Ao Usar o App"

### Imagens nao aparecem

**Causa:** URL das imagens incorreta

**Solucao:**
Verifique se o backend esta servindo as imagens corretamente em:
`http://SEU_IP:3000/uploads/`

## Dependencias Instaladas

O projeto ja inclui:

- `expo` ~50.0.0
- `react-native` 0.73.0
- `@react-navigation/native` ^6.1.9
- `@react-navigation/native-stack` ^6.9.17
- `@react-navigation/bottom-tabs` ^6.5.11
- `axios` ^1.6.2
- `@react-native-async-storage/async-storage` 1.21.0
- `expo-camera` ~14.0.5
- `expo-image-picker` ~14.7.1
- `expo-image-manipulator` ~11.8.0
- `expo-location` ~16.5.1
- `@react-native-community/netinfo` 11.1.0

## Testes no Expo Go

### 1. Testar Login/Cadastro

1. Abra o app
2. Tente fazer login com credenciais invalidas (deve mostrar erro)
3. Va para tela de cadastro
4. Preencha os campos (validacao deve funcionar)
5. Envie o cadastro (aguarde aprovacao do admin)

### 2. Testar Nova Ocorrencia

1. Faca login como vereador aprovado
2. Va para aba "Nova Ocorrencia"
3. Tire uma foto com a camera (deve comprimir automaticamente)
4. Preencha titulo, descricao, categoria
5. Verifique se o endereco foi preenchido automaticamente
6. Envie (deve mostrar progresso e sucesso)

### 3. Testar Listagem

1. Va para aba "Inicio"
2. Puxe para baixo para atualizar (pull-to-refresh)
3. Toque em uma ocorrencia para ver detalhes
4. Se estiver pendente, teste o botao de excluir

### 4. Testar Perfil

1. Va para aba "Perfil"
2. Verifique se todos os dados aparecem
3. Teste o botao de logout

## Proximos Passos

Apos testar no Expo Go, voce pode:

1. **Gerar APK para distribuicao:**
   ```bash
   npm install -g eas-cli
   eas build -p android --profile preview
   ```

2. **Publicar na Play Store/App Store:**
   ```bash
   eas build -p android --profile production
   eas build -p ios --profile production
   ```

## Suporte

Em caso de duvidas:
1. Consulte o README.md principal
2. Verifique os logs no terminal
3. Use o console do Expo DevTools para debug
