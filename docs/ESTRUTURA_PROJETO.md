# Estrutura do Projeto - Sistema de Ocorrências Urbanas

## Visão Geral da Arquitetura

Este é um monorepo contendo o backend (API REST) e o aplicativo mobile (React Native) do Sistema de Ocorrências Urbanas para Vereadores.

## Estrutura de Diretórios

```
Prefeitura App/
├── backend/                    # API REST Node.js + Express
│   ├── prisma/
│   │   └── schema.prisma      # Definição do banco de dados
│   ├── src/
│   │   ├── config/            # Configurações (database, etc)
│   │   ├── controllers/       # Lógica de negócio dos endpoints
│   │   ├── middleware/        # Auth, validação, error handling
│   │   ├── models/            # Modelos personalizados (opcional)
│   │   ├── routes/            # Definição de rotas da API
│   │   ├── services/          # Serviços externos (email, upload)
│   │   ├── utils/             # Funções utilitárias
│   │   └── server.js          # Entry point da aplicação
│   ├── .env.example           # Template de variáveis de ambiente
│   └── package.json
│
├── mobile/                     # App React Native + Expo
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── context/           # Context API (AuthContext, etc)
│   │   ├── navigation/        # Configuração de navegação
│   │   ├── screens/           # Telas do aplicativo
│   │   │   ├── auth/          # Login, Registro
│   │   │   ├── home/          # Home/Dashboard
│   │   │   ├── ocorrencias/   # Nova ocorrência, detalhes
│   │   │   └── profile/       # Perfil do usuário
│   │   ├── services/          # API client (Axios)
│   │   └── utils/             # Funções utilitárias
│   ├── .env.example           # Template de variáveis de ambiente
│   ├── App.js                 # Entry point do app
│   ├── app.json               # Configuração Expo
│   └── package.json
│
├── docs/                       # Documentação do projeto
│   └── ESTRUTURA_PROJETO.md   # Este arquivo
│
├── .env.docker                 # Variáveis para Docker Compose
├── docker-compose.yml          # Configuração Docker
├── package.json                # Scripts raiz do monorepo
├── ARQUITETURA.md              # Arquitetura detalhada
├── CLAUDE.md                   # Orientações para Claude Code
├── INICIO_RAPIDO.md            # Guia de início rápido
└── README.md                   # Visão geral do projeto
```

## Backend - Estrutura Detalhada

### Controllers (backend/src/controllers/)
- `auth.controller.js` - Login, registro, recuperação de senha
- `user.controller.js` - Gerenciamento de usuários (admin)
- `ocorrencia.controller.js` - CRUD de ocorrências
- `notificacao.controller.js` - Sistema de notificações

### Routes (backend/src/routes/)
- `auth.routes.js` - POST /api/auth/register, /login, /me
- `user.routes.js` - GET /api/users, aprovação de cadastros
- `ocorrencia.routes.js` - CRUD /api/ocorrencias
- `notificacao.routes.js` - GET /api/notificacoes
- `health.routes.js` - GET /health (health check)

### Middleware (backend/src/middleware/)
- `auth.middleware.js` - Autenticação JWT + autorização por tipo de usuário
- `error.middleware.js` - Tratamento global de erros
- `validation.middleware.js` - Validação de dados de entrada

### Services (backend/src/services/)
- `email.service.js` - Envio de emails (Nodemailer)
- `upload.service.js` - Upload de imagens (Cloudinary)

### Utils (backend/src/utils/)
- `logger.js` - Sistema de logs

## Mobile - Estrutura Detalhada

### Screens (mobile/src/screens/)

#### Auth
- `LoginScreen.js` - Tela de login
- `RegisterScreen.js` - Cadastro de novo vereador

#### Home
- `HomeScreen.js` - Lista de ocorrências com filtros

#### Ocorrências
- `NovaOcorrenciaScreen.js` - Formulário de nova ocorrência
- `DetalhesOcorrenciaScreen.js` - Detalhes + histórico

#### Profile
- `ProfileScreen.js` - Perfil do usuário + logout

### Context (mobile/src/context/)
- `AuthContext.js` - Estado global de autenticação

### Navigation (mobile/src/navigation/)
- `AppNavigator.js` - Configuração Stack + Tab Navigation

### Services (mobile/src/services/)
- `api.js` - Axios client configurado

### Utils (mobile/src/utils/)
- `imageCompressor.js` - Compressão de imagens
- `network.js` - Utilitários de rede
- `validation.js` - Validação de formulários

## Banco de Dados

### Modelos Prisma (backend/prisma/schema.prisma)

**User** - Usuários do sistema
- Tipos: ADMIN, VEREADOR, JURIDICO
- Status: PENDENTE, ATIVO, INATIVO

**Ocorrencia** - Registro de problemas urbanos
- Status: PENDENTE, EM_ANALISE, RESOLVIDO, REJEITADO
- Categorias: INFRAESTRUTURA, ILUMINACAO, LIMPEZA, etc.

**Foto** - Imagens das ocorrências
- Armazenadas no Cloudinary
- Cascade delete com ocorrência

**Historico** - Log de alterações
- Rastreabilidade de ações

**Notificacao** - Sistema de notificações
- Push notifications futuras

**PasswordReset** - Tokens de recuperação de senha

## Configuração

### Backend (.env)
Copiar `backend/.env.example` para `backend/.env` e configurar:
- DATABASE_URL (PostgreSQL)
- JWT_SECRET
- Cloudinary (CLOUD_NAME, API_KEY, API_SECRET)
- Email (HOST, PORT, USER, PASS)

### Mobile (.env)
Copiar `mobile/.env.example` para `mobile/.env` e configurar:
- API_BASE_URL (IP local para teste em dispositivo físico)

## Scripts Disponíveis

### Raiz do Monorepo
```bash
npm run setup           # Instalação completa + Prisma generate
npm run dev             # Inicia backend e mobile simultaneamente
npm run dev:backend     # Apenas backend
npm run dev:mobile      # Apenas mobile
npm run prisma:migrate  # Executar migrations
npm run prisma:studio   # GUI para visualizar dados
```

### Backend
```bash
cd backend
npm run dev             # Desenvolvimento (nodemon)
npm start               # Produção
npm run prisma:migrate  # Rodar migrations
```

### Mobile
```bash
cd mobile
npm start               # Expo Dev Tools
npm run android         # Android
npm run ios             # iOS (apenas Mac)
```

## Tecnologias

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT (autenticação)
- Cloudinary (imagens)
- Nodemailer (emails)
- bcryptjs (hash de senhas)

### Mobile
- React Native + Expo SDK 50
- React Navigation
- AsyncStorage
- Axios
- Expo Camera/ImagePicker/Location

## Próximos Passos

1. Configurar variáveis de ambiente (.env)
2. Instalar dependências: `npm run install:all`
3. Gerar Prisma Client: `npm run prisma:generate`
4. Rodar migrations: `npm run prisma:migrate`
5. Iniciar desenvolvimento: `npm run dev`

## Segurança

- Senhas hasheadas com bcrypt (10 salt rounds)
- JWT tokens com expiração (2h)
- Rate limiting (100 req/15min)
- CORS configurável
- Validação rigorosa de inputs
- Logs de auditoria (Historico)
- Imagens no Cloudinary (não no servidor)

## Documentação Adicional

- `ARQUITETURA.md` - Arquitetura e módulos do sistema
- `CLAUDE.md` - Guia completo para desenvolvimento
- `INICIO_RAPIDO.md` - Setup rápido
- `README.md` - Visão geral
- `backend/README.md` - Documentação do backend
- `mobile/README.md` - Documentação do mobile
