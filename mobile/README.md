# App Mobile - Sistema de Ocorrências Urbanas

Aplicativo React Native para vereadores registrarem ocorrências urbanas com fotos e localização.

## 🚀 Tecnologias

- React Native + Expo
- React Navigation
- Axios para requisições HTTP
- AsyncStorage para persistência
- Expo Camera e ImagePicker
- Expo Location
- React Native Maps

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Expo CLI instalado (`npm install -g expo-cli`)
- Backend rodando (veja pasta `backend/`)
- Dispositivo físico ou emulador Android/iOS

## 🔧 Instalação

### 1. Instalar dependências
```bash
cd mobile
npm install
```

### 2. Configurar URL da API

Edite o arquivo `src/services/api.js` e altere a URL da API:

```javascript
// ALTERE AQUI PARA O IP DO SEU COMPUTADOR
const API_URL = 'http://192.168.1.100:3000/api';
```

**Como descobrir o IP do seu computador:**

**Windows:**
```bash
ipconfig
# Procure por "IPv4 Address"
```

**Linux/Mac:**
```bash
ifconfig
# ou
ip addr show
```

⚠️ **IMPORTANTE:**
- NÃO use `localhost` ou `127.0.0.1` pois não funciona no dispositivo físico
- Use o IP local da sua rede (ex: `192.168.1.100`)
- Certifique-se de que o backend está rodando neste IP

### 3. Iniciar o app

```bash
npm start
```

Isso abrirá o Expo Dev Tools no navegador.

### 4. Executar no dispositivo

#### Opção A: Dispositivo Físico (Recomendado)

1. Instale o app **Expo Go** na Google Play Store ou App Store
2. Escaneie o QR Code que aparece no terminal ou navegador
3. O app será carregado no seu celular

#### Opção B: Emulador Android

```bash
npm run android
```

#### Opção C: Simulador iOS (apenas Mac)

```bash
npm run ios
```

## 📱 Funcionalidades

### Vereadores

- ✅ Login e cadastro
- ✅ Criar nova ocorrência com:
  - Título e descrição
  - Categoria (Infraestrutura, Limpeza, etc)
  - Prioridade (Baixa, Média, Alta)
  - Múltiplas fotos (até 5)
  - Localização GPS automática
  - Endereço
- ✅ Visualizar lista de ocorrências
- ✅ Ver detalhes completos
- ✅ Excluir ocorrências pendentes
- ✅ Ver histórico de alterações
- ✅ Perfil do usuário

### Sistema

- ✅ Autenticação JWT persistente
- ✅ Upload de imagens
- ✅ Captura de geolocalização
- ✅ Notificações de status
- ✅ Pull to refresh

## 📂 Estrutura do Projeto

```
mobile/
├── assets/                    # Imagens e ícones
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── home/
│   │   │   └── HomeScreen.js
│   │   ├── ocorrencias/
│   │   │   ├── NovaOcorrenciaScreen.js
│   │   │   └── DetalhesOcorrenciaScreen.js
│   │   └── profile/
│   │       └── ProfileScreen.js
│   ├── navigation/
│   │   └── AppNavigator.js    # Navegação do app
│   ├── context/
│   │   └── AuthContext.js     # Contexto de autenticação
│   ├── services/
│   │   └── api.js             # Cliente HTTP
│   └── utils/                 # Utilitários
├── App.js                     # Ponto de entrada
├── app.json                   # Configuração do Expo
└── package.json
```

## 🎨 Telas do App

### 1. Login
- Email e senha
- Link para cadastro

### 2. Cadastro
- Nome completo
- CPF (apenas números)
- Email
- Telefone
- Senha
- Status: Aguarda aprovação do admin

### 3. Home
- Lista de ocorrências do vereador
- Pull to refresh
- Cards com foto, título, status, endereço
- Filtro por status

### 4. Nova Ocorrência
- Título e descrição
- Seleção de categoria (scroll horizontal)
- Prioridade (Baixa, Média, Alta)
- Endereço (auto-preenchido pela localização)
- Fotos:
  - Tirar foto com câmera
  - Escolher da galeria
  - Até 5 fotos
- Localização GPS automática

### 5. Detalhes da Ocorrência
- Galeria de fotos (scroll horizontal)
- Status e prioridade
- Descrição completa
- Endereço com link para Google Maps
- Histórico de alterações
- Botão de excluir (se pendente)

### 6. Perfil
- Dados do usuário
- CPF, telefone, tipo de acesso
- Data de cadastro
- Status da conta
- Botão de logout

## 🔒 Permissões Necessárias

O app solicita as seguintes permissões:

### Android
- `CAMERA` - Para tirar fotos
- `ACCESS_FINE_LOCATION` - Para GPS
- `READ_EXTERNAL_STORAGE` - Para galeria
- `WRITE_EXTERNAL_STORAGE` - Para salvar fotos

### iOS
- Camera Usage
- Location When In Use
- Photo Library Usage

## 🐛 Troubleshooting

### Erro: "Network request failed"
- Verifique se o backend está rodando
- Confirme se o IP no `api.js` está correto
- Teste a URL no navegador: `http://SEU_IP:3000/health`

### Erro: "Expo Go has stopped"
- Limpe o cache: `expo start -c`
- Reinstale as dependências: `rm -rf node_modules && npm install`

### Câmera não funciona
- Verifique se as permissões foram concedidas
- No Android, vá em Configurações → Apps → Expo Go → Permissões

### GPS não funciona
- Ative a localização no dispositivo
- Conceda permissão de localização para o Expo Go

## 📦 Build de Produção

Para gerar um APK de produção para Android, siga a documentação completa:

### Documentação de Build

1. **NEXT_STEPS.md** - Resumo rápido e próximos passos
2. **BUILD_GUIDE.md** - Guia completo passo-a-passo
3. **PRE_BUILD_CHECKLIST.md** - Checklist detalhado pré-build
4. **API_CONFIG.md** - Configuração da URL da API

### Comandos Rápidos

```bash
# Instalar EAS CLI (uma vez)
npm install -g eas-cli

# Login no Expo
eas login

# Configurar projeto (apenas primeira vez)
eas init

# Build de produção (APK)
eas build --platform android --profile production

# Build de preview (testes internos)
eas build --platform android --profile preview
```

**IMPORTANTE:** Antes de fazer o build, leia **BUILD_GUIDE.md** para instruções completas.

### iOS (apenas com Mac)

```bash
eas build --platform ios --profile production
```

## 🚀 Próximos Passos

Melhorias futuras:
- [ ] Notificações push
- [ ] Modo offline (sincronização)
- [ ] Filtros avançados
- [ ] Busca de ocorrências
- [ ] Editar ocorrências
- [ ] Adicionar comentários
- [ ] Dashboard com estatísticas
- [ ] Dark mode
- [ ] Múltiplos idiomas

## 📄 Licença

MIT
