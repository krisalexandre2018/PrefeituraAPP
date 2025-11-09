# Backend - Sistema de Ocorrências Urbanas

API RESTful para gerenciamento de ocorrências urbanas registradas por vereadores.

## 🚀 Tecnologias

- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT para autenticação
- Cloudinary para armazenamento de imagens
- Nodemailer para envio de emails

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- Conta no Cloudinary (gratuita)
- Conta Gmail para envio de emails (ou outro SMTP)

## 🔧 Instalação

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Porta do servidor
PORT=3000

# Banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/vereadores_db"

# JWT
JWT_SECRET="sua_chave_secreta_muito_segura"
JWT_EXPIRES_IN="2h"

# Cloudinary
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="seuemail@gmail.com"
EMAIL_PASS="sua_senha_de_app"
EMAIL_FROM="Sistema Vereadores <seuemail@gmail.com>"
ADMIN_EMAIL="admin@exemplo.com"
```

### 3. Configurar Cloudinary

1. Crie uma conta gratuita em https://cloudinary.com
2. No dashboard, copie:
   - Cloud Name
   - API Key
   - API Secret
3. Cole no arquivo `.env`

### 4. Configurar Email (Gmail)

1. Acesse sua conta Google
2. Vá em "Gerenciar conta" → "Segurança"
3. Ative "Verificação em duas etapas"
4. Vá em "Senhas de app"
5. Gere uma senha para "Email"
6. Use essa senha no `.env` (campo `EMAIL_PASS`)

### 5. Criar banco de dados

```bash
# Conecte no PostgreSQL
psql -U postgres

# Crie o banco
CREATE DATABASE vereadores_db;
\q
```

### 6. Executar migrations

```bash
npm run prisma:migrate
npm run prisma:generate
```

## ▶️ Executar

### Modo desenvolvimento (com hot reload)
```bash
npm run dev
```

### Modo produção
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📚 Documentação da API

### Autenticação

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "nome": "João Silva",
  "cpf": "12345678900",
  "email": "joao@example.com",
  "senha": "senha123",
  "telefone": "11999999999"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

#### Obter dados do usuário logado
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Ocorrências

#### Criar nova ocorrência
```http
POST /api/ocorrencias
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "titulo": "Buraco na rua",
  "descricao": "Grande buraco na Rua X",
  "categoria": "INFRAESTRUTURA",
  "endereco": "Rua X, 123",
  "latitude": "-23.550520",
  "longitude": "-46.633308",
  "prioridade": "ALTA",
  "fotos": [arquivo1.jpg, arquivo2.jpg]
}
```

#### Listar ocorrências
```http
GET /api/ocorrencias?status=PENDENTE&page=1&limit=10
Authorization: Bearer {token}
```

#### Obter detalhes
```http
GET /api/ocorrencias/{id}
Authorization: Bearer {token}
```

#### Atualizar status (Jurídico/Admin)
```http
PATCH /api/ocorrencias/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "EM_ANALISE",
  "comentario": "Estamos analisando"
}
```

#### Deletar
```http
DELETE /api/ocorrencias/{id}
Authorization: Bearer {token}
```

#### Estatísticas (Jurídico/Admin)
```http
GET /api/ocorrencias/stats
Authorization: Bearer {token}
```

### Usuários (Admin)

#### Listar usuários pendentes
```http
GET /api/users/pending
Authorization: Bearer {token}
```

#### Aprovar usuário
```http
PATCH /api/users/{id}/approve
Authorization: Bearer {token}
```

#### Desativar usuário
```http
PATCH /api/users/{id}/deactivate
Authorization: Bearer {token}
```

#### Listar todos
```http
GET /api/users
Authorization: Bearer {token}
```

### Notificações

#### Listar notificações
```http
GET /api/notificacoes?lida=false
Authorization: Bearer {token}
```

#### Marcar como lida
```http
PATCH /api/notificacoes/{id}/read
Authorization: Bearer {token}
```

#### Marcar todas como lidas
```http
PATCH /api/notificacoes/read-all
Authorization: Bearer {token}
```

#### Contar não lidas
```http
GET /api/notificacoes/unread-count
Authorization: Bearer {token}
```

## 🗄️ Estrutura do Banco

### Enums

- **UserType**: ADMIN, VEREADOR, JURIDICO
- **UserStatus**: PENDENTE, ATIVO, INATIVO
- **OcorrenciaStatus**: PENDENTE, EM_ANALISE, RESOLVIDO, REJEITADO
- **Prioridade**: BAIXA, MEDIA, ALTA
- **Categoria**: INFRAESTRUTURA, ILUMINACAO, LIMPEZA, SAUDE, EDUCACAO, SEGURANCA, TRANSPORTE, MEIO_AMBIENTE, OUTROS

## 🔐 Segurança

- Senhas hasheadas com bcrypt
- Autenticação via JWT
- Rate limiting (100 req/15min)
- Validação de dados com express-validator
- CORS configurável
- Logs de auditoria

## 🛠️ Scripts Úteis

```bash
# Visualizar banco de dados
npm run prisma:studio

# Criar nova migration
npm run prisma:migrate

# Resetar banco (CUIDADO!)
npx prisma migrate reset
```

## 📦 Estrutura de Pastas

```
backend/
├── prisma/
│   └── schema.prisma          # Schema do banco
├── src/
│   ├── config/
│   │   └── database.js        # Configuração Prisma
│   ├── controllers/           # Lógica de negócio
│   │   ├── auth.controller.js
│   │   └── ocorrencia.controller.js
│   ├── middleware/            # Middlewares
│   │   └── auth.middleware.js
│   ├── routes/                # Rotas da API
│   │   ├── auth.routes.js
│   │   ├── ocorrencia.routes.js
│   │   ├── user.routes.js
│   │   └── notificacao.routes.js
│   ├── services/              # Serviços externos
│   │   ├── email.service.js
│   │   └── upload.service.js
│   └── server.js              # Ponto de entrada
├── .env                       # Variáveis de ambiente
├── .env.example               # Exemplo de .env
└── package.json
```

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme se a `DATABASE_URL` está correta no `.env`

### Erro no upload de imagens
- Verifique suas credenciais do Cloudinary
- Certifique-se de que as imagens não excedem 5MB

### Email não enviado
- Verifique se a "Senha de app" do Gmail está correta
- Certifique-se de que a verificação em 2 etapas está ativada

## 🚀 Deploy

### Render.com (Recomendado - Gratuito)

1. Crie conta no Render.com
2. Conecte seu repositório GitHub
3. Crie um PostgreSQL Database
4. Crie um Web Service
5. Configure as variáveis de ambiente
6. Deploy automático!

### Outras opções
- Railway.app
- Fly.io
- Heroku
- DigitalOcean

## 📄 Licença

MIT
