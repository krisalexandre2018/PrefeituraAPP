<div align="center">

# 🏛️ Sistema de Ocorrências Urbanas

### Plataforma completa para gestão de problemas urbanos com app mobile e API REST

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/krisalexandre2018/PrefeituraAPP?style=flat-square)](https://github.com/krisalexandre2018/PrefeituraAPP/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/krisalexandre2018/PrefeituraAPP?style=flat-square)](https://github.com/krisalexandre2018/PrefeituraAPP/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/krisalexandre2018/PrefeituraAPP?style=flat-square)](https://github.com/krisalexandre2018/PrefeituraAPP/pulls)

[Demo](#-demo) • [Funcionalidades](#-funcionalidades) • [Instalação](#-instalação) • [Documentação](#-documentação) • [Contribuir](#-contribuindo)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#️-arquitetura)
- [Instalação](#-instalação)
- [Configuração](#️-configuração)
- [Uso](#-uso)
- [API](#-api)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Documentação](#-documentação)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Contato](#-contato)

---

## 🎯 Sobre o Projeto

O **Sistema de Ocorrências Urbanas** é uma solução completa para vereadores registrarem e acompanharem problemas urbanos. Desenvolvido com tecnologias modernas, o sistema oferece:

- 📱 **App Mobile** React Native para vereadores em campo
- 🔧 **API REST** robusta com Node.js e PostgreSQL
- 📸 **Upload de fotos** com geolocalização automática
- 🔔 **Notificações** em tempo real
- 📧 **Emails** automáticos para equipe jurídica
- 📊 **Dashboard** com estatísticas e relatórios

### 🎥 Demo

> 🚧 Em breve: screenshots e vídeo demonstrativo

---

## ✨ Funcionalidades

### Para Vereadores 👔
- ✅ Cadastro e autenticação segura (JWT)
- ✅ Registro de ocorrências com até 5 fotos
- ✅ Captura automática de GPS e endereço
- ✅ Categorização (Infraestrutura, Limpeza, Saúde, etc)
- ✅ Acompanhamento de status em tempo real
- ✅ Notificações push de atualizações
- ✅ Histórico completo de alterações
- ✅ Recuperação de senha

### Para Equipe Jurídica ⚖️
- ✅ Visualização de todas as ocorrências
- ✅ Atualização de status (Pendente → Em Análise → Resolvido)
- ✅ Adicionar comentários e observações
- ✅ Filtros por categoria, status e prioridade
- ✅ Relatórios e estatísticas

### Para Administradores 👨‍💼
- ✅ Aprovação de cadastros de vereadores
- ✅ Gerenciamento de usuários
- ✅ Dashboard com métricas completas
- ✅ Logs de auditoria
- ✅ Configurações do sistema

### Segurança 🔐
- ✅ Autenticação JWT (2h de expiração)
- ✅ Rate limiting (100 req/15min)
- ✅ CSRF protection
- ✅ Helmet.js security headers
- ✅ Validação de inputs (express-validator)
- ✅ Senhas hasheadas (bcrypt)
- ✅ Auto-logout em token expirado

---

## 🚀 Tecnologias

### Backend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 18.x | Runtime JavaScript |
| Express | 4.x | Framework web |
| PostgreSQL | 14.x | Banco de dados relacional |
| Prisma ORM | 5.x | ORM e migrations |
| JWT | 9.x | Autenticação |
| Cloudinary | 1.x | Armazenamento de imagens |
| Nodemailer | 6.x | Envio de emails |
| Jest | 29.x | Testes |
| Helmet | 7.x | Segurança HTTP |

### Mobile
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React Native | 0.73.x | Framework mobile |
| Expo | 50.x | Toolchain e SDK |
| React Navigation | 6.x | Navegação |
| Axios | 1.x | HTTP client |
| AsyncStorage | 1.x | Persistência local |
| Expo Camera | 14.x | Câmera nativa |
| Expo Location | 16.x | GPS e geolocalização |

### DevOps
- **CI/CD:** GitHub Actions
- **Containerização:** Docker (opcional)
- **Deploy:** Render.com, Railway, Vercel
- **Monitoramento:** (planejado)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      MOBILE APP (Expo)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │  Home    │  │  Camera  │  │ Profile  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                           │                                 │
│                      Axios API                              │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ HTTPS/JWT
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API REST (Express)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │  Users   │  │Ocorrencia│  │Notificação│  │
│  │Controller│  │Controller│  │Controller│  │Controller │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │      │
│         └──────────────┴──────────────┴──────────────┘      │
│                           │                                 │
│                      Prisma ORM                             │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │  PostgreSQL   │
                   └───────────────┘

         ┌─────────────┐         ┌─────────────┐
         │ Cloudinary  │         │   Gmail     │
         │   (Fotos)   │         │  (Emails)   │
         └─────────────┘         └─────────────┘
```

### Estrutura de Pastas

```
PrefeituraAPP/
├── backend/                    # API REST Node.js
│   ├── src/
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── routes/            # Endpoints da API
│   │   ├── services/          # Serviços externos (email, upload)
│   │   ├── middleware/        # Auth, validação, CSRF
│   │   ├── config/            # Configurações
│   │   └── utils/             # Utilitários
│   ├── prisma/
│   │   └── schema.prisma      # Schema do banco de dados
│   ├── tests/                 # Testes unitários e integração
│   ├── .env.example           # Template de variáveis de ambiente
│   └── package.json
│
├── mobile/                     # App React Native
│   ├── src/
│   │   ├── screens/           # Telas do app
│   │   ├── navigation/        # Configuração de rotas
│   │   ├── context/           # Context API (AuthContext)
│   │   ├── services/          # API client (Axios)
│   │   └── utils/             # Helpers
│   ├── assets/                # Imagens, ícones
│   ├── app.json               # Configuração Expo
│   ├── eas.json               # Configuração de build
│   └── package.json
│
├── docs/                       # Documentação adicional
├── .github/
│   └── workflows/             # GitHub Actions (CI/CD)
├── README.md                  # Este arquivo
├── ARQUITETURA.md             # Documentação técnica detalhada
└── CLAUDE.md                  # Guia para desenvolvimento
```

---

## 📥 Instalação

### Pré-requisitos

- **Node.js** 18.x ou superior ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x ou superior ([Download](https://www.postgresql.org/download/))
- **npm** ou **yarn**
- **Expo CLI** (para mobile)
- **Conta Cloudinary** ([Criar conta grátis](https://cloudinary.com/users/register/free))
- **Conta Gmail** (para envio de emails)

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/krisalexandre2018/PrefeituraAPP.git
cd PrefeituraAPP
```

### 2️⃣ Configure o Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas credenciais
# (PostgreSQL, JWT_SECRET, Cloudinary, Email)
nano .env  # ou use seu editor preferido

# Executar migrations do Prisma
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate

# Iniciar servidor de desenvolvimento
npm run dev
```

✅ Backend rodando em: `http://localhost:3000`

### 3️⃣ Configure o Mobile

```bash
cd mobile

# Instalar dependências
npm install

# Configurar URL da API
# Edite mobile/src/services/api.js
# Linha 5: const API_URL = 'http://SEU_IP:3000/api'
# Substitua SEU_IP pelo IP local da sua máquina (192.168.x.x)

# Iniciar Expo
npm start
```

✅ Escaneie o QR Code com **Expo Go** no seu celular!

### 4️⃣ Criar Primeiro Admin

Após o primeiro cadastro no app, promova para admin via SQL:

```sql
-- Conecte ao PostgreSQL
psql -U postgres -d vereadores_db

-- Promover usuário
UPDATE users
SET tipo = 'ADMIN', status = 'ATIVO'
WHERE email = 'seu@email.com';
```

---

## ⚙️ Configuração

### Variáveis de Ambiente (Backend)

Edite o arquivo `backend/.env`:

```env
# Servidor
PORT=3000

# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/vereadores_db"

# JWT
JWT_SECRET="sua_chave_secreta_forte_aqui_min_32_chars"
JWT_EXPIRES_IN="2h"

# Cloudinary (Criar conta em cloudinary.com)
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"

# Email (Gmail com senha de app)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="seuemail@gmail.com"
EMAIL_PASS="senha_de_app_do_google"
EMAIL_FROM="Sistema Vereadores <seuemail@gmail.com>"
ADMIN_EMAIL="admin@exemplo.com"
```

### Configuração da API no Mobile

Edite `mobile/src/services/api.js`:

```javascript
// Desenvolvimento (IP da sua máquina na rede local)
const API_URL = 'http://192.168.1.100:3000/api';

// Produção (após deploy)
// const API_URL = 'https://api.seudominio.com/api';
```

**Descobrir seu IP local:**

```bash
# Windows
ipconfig

# Mac/Linux
ifconfig

# Procure pelo IPv4 da sua rede WiFi
```

---

## 💻 Uso

### Fluxo Completo

1. **Vereador se cadastra** no app mobile
2. **Sistema envia email** para admin notificando novo cadastro
3. **Admin aprova** o cadastro via web ou Prisma Studio
4. **Vereador faz login** com suas credenciais
5. **Vereador tira foto** de um problema urbano
6. **Sistema captura GPS** automaticamente
7. **Vereador preenche** título, descrição e categoria
8. **Sistema envia email** para equipe jurídica
9. **Jurídico visualiza** e atualiza status
10. **Vereador recebe notificação** da atualização

### Comandos Úteis

#### Backend
```bash
npm run dev              # Iniciar em desenvolvimento (nodemon)
npm start                # Iniciar em produção
npm test                 # Executar testes
npm run test:coverage    # Testes com cobertura
npm run prisma:studio    # Interface visual do banco
npm run prisma:migrate   # Criar nova migration
npm run prisma:generate  # Gerar Prisma Client
```

#### Mobile
```bash
npm start                # Iniciar Expo Dev Server
npm run android          # Abrir no emulador Android
npm run ios              # Abrir no simulador iOS (Mac only)
expo start -c            # Limpar cache do Expo
npx expo-doctor          # Diagnosticar problemas
npm run build:android    # Gerar APK de produção
```

---

## 🔌 API

### Endpoints Principais

#### Autenticação
```http
POST   /api/auth/register              # Cadastro de usuário
POST   /api/auth/login                 # Login (retorna JWT)
GET    /api/auth/me                    # Dados do usuário logado
POST   /api/auth/forgot-password       # Solicitar recuperação de senha
POST   /api/auth/reset-password        # Redefinir senha
```

#### Ocorrências
```http
GET    /api/ocorrencias                # Listar ocorrências
POST   /api/ocorrencias                # Criar ocorrência (multipart/form-data)
GET    /api/ocorrencias/:id            # Detalhes da ocorrência
PATCH  /api/ocorrencias/:id/status     # Atualizar status (jurídico/admin)
DELETE /api/ocorrencias/:id            # Deletar ocorrência
GET    /api/ocorrencias/stats          # Estatísticas (jurídico/admin)
```

#### Usuários (Admin)
```http
GET    /api/users                      # Listar usuários
GET    /api/users/pending              # Listar cadastros pendentes
PATCH  /api/users/:id/approve          # Aprovar cadastro
PATCH  /api/users/:id/deactivate       # Desativar usuário
GET    /api/users/stats                # Estatísticas de usuários
```

#### Notificações
```http
GET    /api/notificacoes               # Listar notificações
PATCH  /api/notificacoes/:id/read      # Marcar como lida
PATCH  /api/notificacoes/read-all      # Marcar todas como lidas
GET    /api/notificacoes/unread-count  # Contar não lidas
```

### Autenticação

Todas as rotas (exceto `/auth/register` e `/auth/login`) requerem token JWT:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Exemplo de Requisição

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "vereador@exemplo.com", "senha": "senha123"}'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "vereador@exemplo.com",
    "tipo": "VEREADOR",
    "status": "ATIVO"
  }
}

# Listar Ocorrências (com token)
curl -X GET http://localhost:3000/api/ocorrencias \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

📚 **Documentação completa:** [API_REFERENCE.md](./API_REFERENCE.md)

---

## 🧪 Testes

### Backend

```bash
cd backend

# Executar todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em watch mode
npm test -- --watch

# Teste específico
npm test -- user.controller.test.js
```

### Cobertura Atual

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   70.82 |    64.72 |   67.72 |   71.08 |
 controllers        |   85.64 |    85.67 |   89.48 |   85.57 |
 middleware         |   69.40 |    57.35 |   42.85 |   69.40 |
 services           |   78.26 |   100.00 |   87.50 |   77.77 |
--------------------|---------|----------|---------|---------|
```

### Mobile

Testes planejados para próxima fase:
- [ ] Testes de componentes (React Native Testing Library)
- [ ] Testes de navegação
- [ ] Testes de integração com API mock

---

## 🚀 Deploy

### Backend (Render.com)

1. **Crie conta** em [Render.com](https://render.com/)

2. **Crie PostgreSQL Database:**
   - Dashboard → New PostgreSQL
   - Copie a `INTERNAL_DATABASE_URL`

3. **Crie Web Service:**
   - Dashboard → New Web Service
   - Conecte repositório GitHub
   - Branch: `main`
   - Build Command: `cd backend && npm install && npx prisma generate`
   - Start Command: `cd backend && npm start`

4. **Configure Environment Variables:**
   ```
   DATABASE_URL=<internal_database_url>
   JWT_SECRET=<chave_secreta_forte>
   CLOUDINARY_CLOUD_NAME=<seu_cloud_name>
   CLOUDINARY_API_KEY=<sua_api_key>
   CLOUDINARY_API_SECRET=<seu_api_secret>
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<seu_email>
   EMAIL_PASS=<senha_de_app>
   ```

5. **Deploy!** 🎉

✅ URL da API: `https://seu-app.onrender.com`

### Mobile (APK Android)

1. **Instale EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login no Expo:**
   ```bash
   cd mobile
   eas login
   ```

3. **Configure projeto:**
   ```bash
   eas init
   ```

4. **Atualize URL da API** em `src/services/api.js`:
   ```javascript
   const API_URL = 'https://seu-app.onrender.com/api';
   ```

5. **Gere o APK:**
   ```bash
   eas build --platform android --profile production
   ```

6. **Aguarde 15-25 minutos** e faça download do APK!

📱 **Guia completo:** [mobile/BUILD_GUIDE.md](./mobile/BUILD_GUIDE.md)

---

## 📚 Documentação

### Documentos Principais

| Documento | Descrição |
|-----------|-----------|
| [README.md](./README.md) | Este arquivo - visão geral |
| [ARQUITETURA.md](./ARQUITETURA.md) | Arquitetura técnica detalhada |
| [CLAUDE.md](./CLAUDE.md) | Guia de desenvolvimento e padrões |
| [backend/README.md](./backend/README.md) | Documentação do backend |
| [mobile/README.md](./mobile/README.md) | Documentação do mobile |
| [mobile/BUILD_GUIDE.md](./mobile/BUILD_GUIDE.md) | Como gerar APK |
| [API_REFERENCE.md](./API_REFERENCE.md) | Referência completa da API |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Como contribuir |

### Diagramas

- **Fluxo de Autenticação:** Ver [ARQUITETURA.md#autenticacao](./ARQUITETURA.md#autenticacao)
- **Fluxo de Ocorrências:** Ver [ARQUITETURA.md#ocorrencias](./ARQUITETURA.md#ocorrencias)
- **Schema do Banco:** Ver [backend/prisma/schema.prisma](./backend/prisma/schema.prisma)

---

## 🗺️ Roadmap

### ✅ Versão 1.0 (MVP) - Concluída
- [x] Sistema de autenticação completo
- [x] CRUD de ocorrências
- [x] Upload de fotos com Cloudinary
- [x] GPS e geolocalização
- [x] Notificações no app
- [x] Emails automáticos
- [x] Testes unitários e integração
- [x] Segurança (JWT, CSRF, Helmet)
- [x] Recuperação de senha

### 🚧 Versão 1.1 - Em Planejamento
- [ ] Notificações push (Firebase Cloud Messaging)
- [ ] Dashboard web para admin (React)
- [ ] Relatórios em PDF (pdfkit)
- [ ] Gráficos e estatísticas avançadas
- [ ] Busca e filtros melhorados
- [ ] Modo offline com sincronização

### 📅 Versão 2.0 - Futuro
- [ ] Edição de ocorrências
- [ ] Sistema de comentários em threads
- [ ] Dark mode
- [ ] Internacionalização (i18n)
- [ ] App iOS
- [ ] API v2 (GraphQL)
- [ ] WebSockets para real-time

**Veja issues abertas:** [GitHub Issues](https://github.com/krisalexandre2018/PrefeituraAPP/issues)

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! 🎉

### Como Contribuir

1. **Fork** o repositório
2. **Clone** seu fork:
   ```bash
   git clone https://github.com/SEU_USUARIO/PrefeituraAPP.git
   ```
3. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/minha-nova-feature
   ```
4. **Faça suas alterações** seguindo os padrões do projeto
5. **Commit** suas mudanças:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   ```
6. **Push** para sua branch:
   ```bash
   git push origin feature/minha-nova-feature
   ```
7. **Abra um Pull Request** no GitHub

### Padrões de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem mudar funcionalidade
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

### Diretrizes

- ✅ Siga os padrões de código existentes
- ✅ Adicione testes para novas funcionalidades
- ✅ Atualize a documentação se necessário
- ✅ Certifique-se que os testes passam (`npm test`)
- ✅ Mantenha commits pequenos e focados

📖 **Leia mais:** [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2024 Sistema de Ocorrências Urbanas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[Texto completo da licença MIT...]
```

---

## 📞 Contato

### Mantenedores

- **GitHub:** [@krisalexandre2018](https://github.com/krisalexandre2018)
- **Repositório:** [PrefeituraAPP](https://github.com/krisalexandre2018/PrefeituraAPP)

### Reportar Problemas

- **Bugs:** [Abrir Issue](https://github.com/krisalexandre2018/PrefeituraAPP/issues/new?template=bug_report.md)
- **Features:** [Sugerir Feature](https://github.com/krisalexandre2018/PrefeituraAPP/issues/new?template=feature_request.md)
- **Dúvidas:** [Discussions](https://github.com/krisalexandre2018/PrefeituraAPP/discussions)

---

## 🌟 Agradecimentos

- **Expo Team** - Framework mobile incrível
- **Prisma Team** - ORM moderno e type-safe
- **React Native Community** - Ecossistema vibrante
- **Todos os contribuidores** - Obrigado! ❤️

---

<div align="center">

### ⭐ Se este projeto foi útil, considere dar uma estrela!

[![GitHub Stars](https://img.shields.io/github/stars/krisalexandre2018/PrefeituraAPP?style=social)](https://github.com/krisalexandre2018/PrefeituraAPP/stargazers)

**Desenvolvido com ❤️ para melhorar a gestão pública**

[⬆ Voltar ao topo](#️-sistema-de-ocorrências-urbanas)

</div>
