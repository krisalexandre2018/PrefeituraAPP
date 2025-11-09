# Guia de Deploy - Sistema de Ocorrências Urbanas

Este documento contém instruções completas para fazer deploy do sistema de ocorrências urbanas para vereadores.

## Índice

1. [Visão Geral](#visão-geral)
2. [Deploy do Backend (Render.com)](#deploy-do-backend-rendercom)
3. [Deploy do Mobile (Expo)](#deploy-do-mobile-expo)
4. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
5. [Troubleshooting](#troubleshooting)
6. [Monitoramento e Logs](#monitoramento-e-logs)

---

## Visão Geral

### Arquitetura de Deploy

```
┌─────────────────┐
│   Mobile App    │
│  (Expo/EAS)     │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐      ┌──────────────┐
│   Backend API   │─────►│  PostgreSQL  │
│   (Render.com)  │      │  (Render.com)│
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│   Cloudinary    │
│  (Image Upload) │
└─────────────────┘
```

### Requisitos

- Conta no [Render.com](https://render.com) (gratuita ou paga)
- Conta no [Expo](https://expo.dev) (gratuita)
- Conta no [Cloudinary](https://cloudinary.com) (gratuita)
- Git configurado e repositório no GitHub

---

## Deploy do Backend (Render.com)

### Passo 1: Criar PostgreSQL no Render

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `vereadores-db`
   - **Database**: `vereadores_db`
   - **User**: `postgres` (ou outro)
   - **Region**: Escolha a região mais próxima
   - **Plan**: Free ou Starter
4. Clique em **Create Database**
5. Aguarde provisionamento (~2 minutos)
6. Copie a **Internal Database URL** (formato: `postgresql://...`)

### Passo 2: Criar Web Service para Backend

1. No Render Dashboard, clique em **New +** → **Web Service**
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `vereadores-backend`
   - **Region**: Mesma do banco de dados
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: Free ou Starter

### Passo 3: Configurar Variáveis de Ambiente

No Render, vá em **Environment** e adicione:

```bash
# Obrigatório
NODE_ENV=production
PORT=3000
DATABASE_URL=<Internal Database URL do Render>
JWT_SECRET=<gerar com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=2h

# Cloudinary (obrigatório para upload de imagens)
CLOUDINARY_CLOUD_NAME=<seu_cloud_name>
CLOUDINARY_API_KEY=<sua_api_key>
CLOUDINARY_API_SECRET=<seu_api_secret>

# Email (Nodemailer com Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<seu_email@gmail.com>
EMAIL_PASS=<senha_de_app_do_gmail>
EMAIL_FROM=Sistema Vereadores <seu_email@gmail.com>
ADMIN_EMAIL=<email_do_admin>

# CORS (URL do app mobile)
FRONTEND_URL=*

# Rate Limiting (opcional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info
```

### Passo 4: Deploy Automático

O Render fará deploy automaticamente ao:
- Fazer push para a branch `main`
- Alterar variáveis de ambiente
- Disparar deploy manual

### Passo 5: Verificar Deploy

Após deploy bem-sucedido (5-10 minutos):

1. Acesse: `https://vereadores-backend.onrender.com/health`
2. Deve retornar:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-11-02T...",
     "uptime": 123,
     "environment": "production"
   }
   ```

3. Teste detalhado: `https://vereadores-backend.onrender.com/health/detailed`

### Configuração do Cloudinary

1. Acesse [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copie:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Cole nas variáveis de ambiente do Render

### Configuração de Email (Gmail)

1. Acesse [Google Account Security](https://myaccount.google.com/security)
2. Ative **2-Step Verification**
3. Vá em **App Passwords**
4. Gere uma senha para "Mail"
5. Use essa senha em `EMAIL_PASS`

---

## Deploy do Mobile (Expo)

### Opção 1: Expo Go (Desenvolvimento)

**Para testar:**

```bash
cd mobile
npm start
```

- Escaneie QR Code com Expo Go no celular
- Não requer build
- Ideal para desenvolvimento

### Opção 2: EAS Build (Produção)

#### Passo 1: Instalar EAS CLI

```bash
npm install -g eas-cli
eas login
```

#### Passo 2: Configurar Projeto

```bash
cd mobile
eas build:configure
```

Isso cria `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### Passo 3: Configurar app.json

Edite `mobile/app.json`:

```json
{
  "expo": {
    "name": "Vereadores",
    "slug": "vereadores-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.vereadores.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.vereadores.app",
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "extra": {
      "apiUrl": "https://vereadores-backend.onrender.com"
    }
  }
}
```

#### Passo 4: Criar .env no Mobile

```bash
# mobile/.env
API_URL=https://vereadores-backend.onrender.com
```

Atualize código para usar:

```javascript
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.apiUrl || 'http://localhost:3000';
```

#### Passo 5: Build para Android

```bash
# Development build
eas build --platform android --profile development

# Production APK
eas build --platform android --profile production

# Para Google Play Store (AAB)
eas build --platform android --profile production
```

#### Passo 6: Build para iOS (Requer Mac + Apple Developer Account)

```bash
eas build --platform ios --profile production
```

#### Passo 7: Baixar e Distribuir

Após build (10-20 min):
1. Acesse [Expo Dashboard](https://expo.dev)
2. Baixe o APK/IPA
3. Distribua via link ou stores

### Opção 3: Expo Application Services (OTA Updates)

Configure updates over-the-air:

```bash
eas update:configure
```

Publicar update:

```bash
cd mobile
eas update --branch production --message "Correções de bugs"
```

---

## Configuração de Variáveis de Ambiente

### Backend (.env)

```bash
# Gerar JWT_SECRET forte
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Obter Database URL do Render
# Formato: postgresql://user:pass@host:port/database
```

### Mobile (app.json)

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://seu-backend.onrender.com"
    }
  }
}
```

---

## Troubleshooting

### Backend não inicia

**Erro**: `Error: P1001: Can't reach database server`

**Solução**:
- Verifique DATABASE_URL
- Confirme que PostgreSQL está online
- Use **Internal Database URL** (não External)

**Erro**: `Prisma schema not found`

**Solução**:
```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

### Mobile não conecta

**Erro**: `Network request failed`

**Solução**:
- Verifique API_URL em `app.json`
- Teste backend: `curl https://seu-backend.onrender.com/health`
- Verifique CORS no backend

### Cloudinary falha

**Erro**: `Must supply api_key`

**Solução**:
- Verifique variáveis CLOUDINARY_* no Render
- Teste credenciais manualmente

### Rate Limit muito restritivo

Aumente em produção:

```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

---

## Monitoramento e Logs

### Logs do Backend (Render)

1. Acesse Render Dashboard
2. Selecione seu service
3. Vá em **Logs**
4. Logs estruturados em JSON:
   ```json
   {"timestamp":"2025-11-02T...","level":"INFO","message":"GET /api/ocorrencias"}
   ```

### Health Checks

Configure em Render:
- **Health Check Path**: `/health/ready`
- **Health Check Interval**: 30 segundos

### Monitoramento Externo

Ferramentas recomendadas:
- [UptimeRobot](https://uptimerobot.com) - Monitora uptime
- [Sentry](https://sentry.io) - Error tracking
- [LogRocket](https://logrocket.com) - Session replay

### Backup do Banco

**Automático (Render Pro)**:
- Backups diários automáticos

**Manual**:
```bash
# Local
npm run backup:db

# Render (via CLI)
render psql vereadores-db
\! pg_dump -U postgres vereadores_db > backup.sql
```

### Métricas Importantes

- **Response Time**: < 500ms
- **Error Rate**: < 1%
- **Uptime**: > 99.5%
- **Database Connections**: < 10 (free tier)

---

## Checklist de Deploy

### Antes do Deploy

- [ ] Testar localmente com `npm run dev`
- [ ] Executar `npm run validate:env`
- [ ] Commit e push para GitHub
- [ ] Criar backup do banco (se houver dados)

### Backend

- [ ] PostgreSQL criado no Render
- [ ] Web Service criado
- [ ] Variáveis de ambiente configuradas
- [ ] DATABASE_URL correta (Internal URL)
- [ ] JWT_SECRET gerado (64+ caracteres)
- [ ] Cloudinary configurado
- [ ] Email configurado (senha de app)
- [ ] Deploy bem-sucedido
- [ ] Health check retorna 200
- [ ] Migrations aplicadas

### Mobile

- [ ] API_URL atualizada em app.json
- [ ] Build configurado com EAS
- [ ] Permissões Android/iOS definidas
- [ ] Ícones e splash screen criados
- [ ] Build gerado com sucesso
- [ ] APK/IPA testado em dispositivo

### Pós-Deploy

- [ ] Testar autenticação
- [ ] Testar criação de ocorrência
- [ ] Testar upload de imagem
- [ ] Testar notificações
- [ ] Configurar monitoramento
- [ ] Documentar URLs de produção

---

## URLs de Produção

Após deploy, atualize:

```bash
# Backend
https://vereadores-backend.onrender.com

# Health Check
https://vereadores-backend.onrender.com/health

# API Documentation
https://vereadores-backend.onrender.com/

# Prisma Studio (local apenas)
npm run prisma:studio
```

---

## Custos Estimados

### Render.com

- **Free Tier**:
  - PostgreSQL: 1GB storage, dorme após 90 dias
  - Web Service: 750h/mês, dorme após inatividade
  - **Custo**: $0/mês

- **Starter**:
  - PostgreSQL: 10GB storage, sempre ativo
  - Web Service: 24/7, 512MB RAM
  - **Custo**: ~$7-15/mês

### Expo

- **Free**:
  - Builds ilimitados (1 por vez)
  - Updates OTA ilimitados
  - **Custo**: $0/mês

- **Production** (~$29/mês):
  - Builds prioritários
  - Builds paralelos
  - Suporte prioritário

### Cloudinary

- **Free**:
  - 25 GB storage
  - 25 GB bandwidth/mês
  - **Custo**: $0/mês

### Total Estimado

- **Desenvolvimento/Teste**: $0/mês (free tier tudo)
- **Produção Básica**: $7-15/mês (Render Starter)
- **Produção Completa**: $36-44/mês (Render + Expo Pro)

---

## Suporte

- **Render**: https://render.com/docs
- **Expo**: https://docs.expo.dev
- **Cloudinary**: https://cloudinary.com/documentation
- **Prisma**: https://www.prisma.io/docs

---

## Changelog de Deploy

### v1.0.0 (2025-11-02)

- ✅ Deploy inicial do backend no Render
- ✅ PostgreSQL configurado
- ✅ Cloudinary integrado
- ✅ Email via Gmail configurado
- ✅ Mobile app build configurado

---

**Última atualização**: 2025-11-02
**Mantido por**: Equipe de Desenvolvimento
