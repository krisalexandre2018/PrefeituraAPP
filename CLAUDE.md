# CLAUDE.md

Este arquivo fornece orientação ao Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Visão Geral do Sistema

Sistema de Ocorrências Urbanas para Vereadores - plataforma completa para registro e acompanhamento de problemas urbanos, com app mobile React Native para vereadores e API REST Node.js/Express para backend.

## Arquitetura

### Estrutura Monorepo
```
Prefeitura App/
├── backend/     # API REST (Node.js + Express + PostgreSQL)
├── mobile/      # App React Native (Expo)
└── docs/        # README.md, ARQUITETURA.md, etc.
```

### Stack Tecnológico

**Backend:**
- Node.js + Express (API REST)
- PostgreSQL + Prisma ORM (banco de dados)
- JWT (autenticação)
- Cloudinary (armazenamento de imagens)
- Nodemailer (envio de emails)
- bcryptjs (hash de senhas)
- express-validator (validação)
- express-rate-limit (rate limiting: 100 req/15min)

**Mobile:**
- React Native + Expo SDK 50
- React Navigation (navegação)
- AsyncStorage (persistência local)
- Axios (HTTP client)
- Expo Camera, ImagePicker, Location (funcionalidades nativas)

### Tipos de Usuários e Permissões

1. **ADMIN**: Aprovar cadastros, gerenciar usuários, visualizar relatórios
2. **VEREADOR**: Criar ocorrências com fotos/GPS, visualizar suas ocorrências, acompanhar status
3. **JURIDICO**: Visualizar todas ocorrências, atualizar status, adicionar comentários

Status de usuários: `PENDENTE` (novo cadastro) → `ATIVO` (aprovado) ou `INATIVO` (desativado)

### Fluxo de Dados Principal

1. Vereador cria ocorrência no app (fotos + GPS + descrição)
2. Backend faz upload de fotos para Cloudinary
3. Sistema envia email para equipe jurídica
4. Jurídico atualiza status da ocorrência
5. Vereador recebe notificação da atualização
6. Histórico é registrado em cada alteração

## Comandos de Desenvolvimento

### Backend

```bash
cd backend

# Instalação
npm install

# Desenvolvimento (hot reload com nodemon)
npm run dev

# Produção
npm start

# Banco de dados
npm run prisma:migrate      # Executar migrations
npm run prisma:generate     # Gerar Prisma Client
npm run prisma:studio       # Visualizar/editar dados (GUI)

# Resetar banco (CUIDADO - apaga todos os dados)
npx prisma migrate reset
```

O backend roda em `http://localhost:3000` por padrão.

### Mobile

```bash
cd mobile

# Instalação
npm install

# Iniciar desenvolvimento
npm start              # Abre Expo Dev Tools
npm run android        # Executar no Android
npm run ios            # Executar no iOS (apenas Mac)

# Limpar cache (útil para resolver bugs)
expo start -c
```

**IMPORTANTE:** Configurar URL da API em `mobile/src/services/api.js` com o IP local do computador (não usar localhost/127.0.0.1 pois não funciona em dispositivos físicos).

## Modelo de Dados

### Principais Entidades (ver backend/prisma/schema.prisma)

**User**
- id (UUID), nome, cpf (único), email (único), senha (hash bcrypt)
- tipo: ADMIN | VEREADOR | JURIDICO
- status: PENDENTE | ATIVO | INATIVO
- telefone, fotoPerfil (opcional)

**Ocorrencia**
- id (UUID), vereadorId (FK), titulo, descricao
- categoria: INFRAESTRUTURA | ILUMINACAO | LIMPEZA | SAUDE | EDUCACAO | SEGURANCA | TRANSPORTE | MEIO_AMBIENTE | OUTROS
- status: PENDENTE | EM_ANALISE | RESOLVIDO | REJEITADO
- prioridade: BAIXA | MEDIA | ALTA
- endereco, latitude, longitude (GPS)
- createdAt, updatedAt

**Foto**
- id (UUID), ocorrenciaId (FK), urlFoto (Cloudinary), thumbnailUrl, ordem
- Cascade delete quando ocorrência é excluída

**Historico**
- Log de todas alterações em ocorrências
- id (UUID), ocorrenciaId (FK), usuarioId (FK), acao, comentario, createdAt

**Notificacao**
- id (UUID), usuarioId (FK), tipo, titulo, mensagem, lida (boolean)

### Relacionamentos
- User 1:N Ocorrencias (vereador pode ter várias ocorrências)
- Ocorrencia 1:N Fotos (até 5 fotos por ocorrência)
- Ocorrencia 1:N Historico (log de alterações)
- User 1:N Notificacoes

## Estrutura de Código

### Backend (backend/src/)

```
src/
├── server.js                          # Entry point, configuração Express
├── config/
│   └── database.js                    # Prisma Client singleton
├── middleware/
│   └── auth.middleware.js             # Verificação JWT, autorização por tipo de usuário
├── controllers/
│   ├── auth.controller.js             # Login, registro, me, recuperação de senha
│   └── ocorrencia.controller.js       # CRUD ocorrências, upload fotos, estatísticas
├── routes/
│   ├── auth.routes.js                 # POST /api/auth/register, /login, /me
│   ├── ocorrencia.routes.js           # CRUD /api/ocorrencias, filtros, stats
│   ├── user.routes.js                 # GET /api/users, aprovação, desativação (admin)
│   └── notificacao.routes.js          # GET /api/notificacoes, marcar lidas
└── services/
    ├── email.service.js               # Nodemailer - emails transacionais
    └── upload.service.js              # Cloudinary - upload e exclusão de imagens
```

### Mobile (mobile/src/)

```
src/
├── services/
│   └── api.js                         # Axios client, interceptors JWT, configuração base URL
├── context/
│   └── AuthContext.js                 # Contexto global de autenticação, AsyncStorage
├── navigation/
│   └── AppNavigator.js                # Stack + Tab navigation, conditional routing
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.js             # Email + senha, link para registro
│   │   └── RegisterScreen.js          # Formulário completo, status PENDENTE após cadastro
│   ├── home/
│   │   └── HomeScreen.js              # FlatList ocorrências, pull-to-refresh, filtro por status
│   ├── ocorrencias/
│   │   ├── NovaOcorrenciaScreen.js    # Formulário + câmera + GPS + upload múltiplas fotos
│   │   └── DetalhesOcorrenciaScreen.js # Galeria fotos, histórico, link para Google Maps
│   └── profile/
│       └── ProfileScreen.js           # Dados usuário, logout
```

## Configuração e Variáveis de Ambiente

### Backend (.env)

Copiar `backend/.env.example` para `backend/.env` e configurar:

```env
PORT=3000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/vereadores_db"
JWT_SECRET="chave_secreta_forte"
JWT_EXPIRES_IN="2h"

# Cloudinary (criar conta gratuita)
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"

# Email (Gmail com senha de app)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="seuemail@gmail.com"
EMAIL_PASS="senha_de_app_google"
EMAIL_FROM="Sistema Vereadores <seuemail@gmail.com>"
ADMIN_EMAIL="admin@exemplo.com"
```

### Criar Primeiro Admin

Após primeiro usuário se cadastrar, promover para admin manualmente:

```sql
UPDATE users SET tipo = 'ADMIN', status = 'ATIVO' WHERE email = 'seu@email.com';
```

## Padrões de Código e Convenções

### Backend

- **Autenticação**: Middleware `authenticateToken` em todas rotas protegidas
- **Autorização**: Middleware `authorize(['ADMIN', 'JURIDICO'])` para restringir por tipo
- **Validação**: express-validator em todos endpoints que recebem dados
- **Erros**: Retornar status HTTP apropriado (400, 401, 403, 404, 500) com mensagem clara
- **Async/Await**: Usar try-catch em todos controllers
- **Prisma**: Usar transações quando operações precisam ser atômicas (ex: criar ocorrência + fotos + histórico)
- **Upload**: Limitar tamanho imagens (5MB), validar tipos (JPEG, PNG)

### Mobile

- **Autenticação**: Token JWT salvo em AsyncStorage, interceptor Axios adiciona header automaticamente
- **Navegação**: Conditional rendering baseado em `isAuthenticated` do AuthContext
- **Erros**: Mostrar Alert com mensagem amigável, logar erro no console
- **Permissões**: Sempre verificar permissões (Camera, Location) antes de usar, mostrar mensagem se negado
- **Loading**: Mostrar ActivityIndicator durante requisições/uploads
- **GPS**: Capturar location em NovaOcorrenciaScreen, fazer reverse geocoding para obter endereço

## Segurança

- Senhas hasheadas com bcrypt (salt rounds: 10)
- JWT tokens com expiração curta (2h)
- Rate limiting: 100 requisições por 15 minutos por IP
- CORS configurável (apenas origens permitidas em produção)
- Validação rigorosa de inputs com express-validator
- Logs de auditoria em tabela Historico (quem fez o que e quando)
- Fotos armazenadas no Cloudinary (não no servidor)
- Não expor stack traces em produção

## Troubleshooting Comum

### Backend

**Erro de conexão PostgreSQL:**
- Verificar se PostgreSQL está rodando: `pg_isready`
- Confirmar DATABASE_URL no .env
- Testar conexão: `npx prisma db pull`

**Erro upload Cloudinary:**
- Verificar credenciais no .env
- Limite gratuito: 25GB/mês

**Email não enviado:**
- Gmail requer senha de app (não senha normal)
- Ativar verificação em 2 etapas primeiro

### Mobile

**"Network request failed":**
- Backend deve estar rodando
- Usar IP local da rede (192.168.x.x), não localhost
- Testar URL no navegador: `http://SEU_IP:3000/health`
- Celular e computador devem estar na mesma rede Wi-Fi

**Câmera não funciona:**
- Verificar permissões concedidas
- Android: Configurações → Apps → Expo Go → Permissões

**GPS não captura localização:**
- Ativar serviços de localização no dispositivo
- Conceder permissão ao Expo Go
- Testar ao ar livre (GPS precisa de linha de visão para satélites)

## API Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Cadastro (status PENDENTE)
- `POST /api/auth/login` - Login (retorna token JWT)
- `GET /api/auth/me` - Dados do usuário logado (requer token)

### Ocorrências
- `GET /api/ocorrencias` - Listar (vereador vê só suas, jurídico/admin vê todas)
- `POST /api/ocorrencias` - Criar (multipart/form-data para upload fotos)
- `GET /api/ocorrencias/:id` - Detalhes + histórico
- `PATCH /api/ocorrencias/:id/status` - Atualizar status (jurídico/admin)
- `DELETE /api/ocorrencias/:id` - Excluir (vereador pode excluir se PENDENTE)
- `GET /api/ocorrencias/stats` - Estatísticas (jurídico/admin)

### Usuários (Admin)
- `GET /api/users` - Listar todos
- `GET /api/users/pending` - Listar cadastros pendentes
- `PATCH /api/users/:id/approve` - Aprovar cadastro
- `PATCH /api/users/:id/deactivate` - Desativar usuário

### Notificações
- `GET /api/notificacoes` - Listar notificações do usuário
- `PATCH /api/notificacoes/:id/read` - Marcar como lida
- `PATCH /api/notificacoes/read-all` - Marcar todas como lidas
- `GET /api/notificacoes/unread-count` - Contar não lidas

## Testes Manuais Recomendados

1. **Fluxo completo de cadastro:**
   - Cadastrar vereador no app
   - Verificar status PENDENTE no banco
   - Admin aprovar via API ou Prisma Studio
   - Vereador fazer login

2. **Fluxo de ocorrência:**
   - Criar ocorrência com fotos e GPS
   - Verificar upload no Cloudinary
   - Verificar email enviado para jurídico
   - Jurídico atualizar status
   - Verificar notificação criada para vereador
   - Verificar histórico registrado

3. **Testes de permissões:**
   - Vereador não pode acessar endpoints de admin
   - Vereador não pode ver ocorrências de outros
   - Vereador não pode atualizar status

## Documentação Adicional

- **ARQUITETURA.md** - Arquitetura detalhada, módulos/agentes, fluxos
- **backend/README.md** - Documentação completa do backend, deploy, troubleshooting
- **mobile/README.md** - Documentação completa do app, build, permissões
- **README.md** - Visão geral, instalação rápida, primeiros passos

## Futuras Melhorias Planejadas

- Notificações push (Firebase Cloud Messaging)
- Dashboard web para admin (React + Vite)
- Relatórios em PDF (pdfkit ou puppeteer)
- Modo offline com sincronização
- Edição de ocorrências
- Sistema de comentários em threads
- Dark mode
- Busca e filtros avançados
