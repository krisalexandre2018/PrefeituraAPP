# 🚀 Guia Completo: Deploy no Render.com

Este guia vai te ensinar a fazer deploy do backend no Render.com (plano gratuito) passo a passo.

---

## ⏱️ Tempo Total: ~20-30 minutos

---

## 📋 O Que Você Vai Fazer

1. Criar conta no Render.com (gratuita)
2. Criar banco de dados PostgreSQL
3. Fazer deploy do backend
4. Configurar variáveis de ambiente
5. Obter URL da API
6. Testar se funcionou

---

## 🎯 PASSO 1: Criar Conta no Render.com

### 1.1 Acesse o Site

Abra no navegador:
```
https://render.com/
```

### 1.2 Criar Conta

1. Clique em **"Get Started"** (canto superior direito)
2. Escolha uma opção de cadastro:
   - **Com GitHub** (Recomendado - mais fácil!) ← Escolha esta!
   - Com GitLab
   - Com Google
   - Com email

### 1.3 Conectar GitHub

1. Se escolheu GitHub, clique em **"Sign Up with GitHub"**
2. Faça login no GitHub se pedido
3. Autorize o Render.com
4. ✅ Conta criada!

---

## 🎯 PASSO 2: Criar PostgreSQL Database

### 2.1 Acessar Dashboard

Após login, você vai ver o dashboard do Render.

### 2.2 Criar Database

1. Clique em **"New +"** (canto superior direito)
2. Selecione **"PostgreSQL"**

### 2.3 Configurar Database

Preencha o formulário:

**Name:**
```
vereadores-db
```

**Database:**
```
vereadores_db
```

**User:**
```
vereadores_user
```
(Ou deixe o padrão)

**Region:**
```
Oregon (US West) - Gratuito
```
(Escolha qualquer região gratuita)

**PostgreSQL Version:**
```
16
```
(Ou a versão mais recente)

**Datadog API Key:**
```
(Deixe em branco)
```

**Plan:**
```
⚠️ IMPORTANTE: Selecione "Free"
```

### 2.4 Criar

1. Clique em **"Create Database"**
2. Aguarde ~2-3 minutos enquanto cria

### 2.5 Copiar URLs

Quando terminar, você vai ver várias URLs. **COPIE** as seguintes:

**Internal Database URL** (Mais importante!)
```
postgresql://vereadores_user:senha@dpg-xxxxx-a/vereadores_db
```
👆 **GUARDE ESTA URL!** Vamos usar no próximo passo.

**External Database URL**
```
postgresql://vereadores_user:senha@dpg-xxxxx-a.oregon-postgres.render.com/vereadores_db
```

---

## 🎯 PASSO 3: Criar Web Service (Backend)

### 3.1 Voltar ao Dashboard

1. Clique no logo "Render" (canto superior esquerdo)
2. Você está de volta ao dashboard

### 3.2 Criar Web Service

1. Clique em **"New +"** (canto superior direito)
2. Selecione **"Web Service"**

### 3.3 Conectar Repositório

Você vai ver uma tela "Create a new Web Service"

**Opção 1: Repositório Já Conectado**
Se você fez login com GitHub, vai ver seus repositórios:
- Procure por **"PrefeituraAPP"**
- Clique em **"Connect"**

**Opção 2: Conectar Repositório Manualmente**
Se não apareceu:
1. Clique em **"Configure account"** (link azul)
2. Autorize acesso ao repositório "PrefeituraAPP"
3. Volte e clique em **"Connect"**

### 3.4 Configurar Web Service

Preencha os campos:

**Name:**
```
vereadores-api
```

**Region:**
```
Oregon (US West)
```
(Mesma região do banco de dados!)

**Branch:**
```
main
```

**Root Directory:**
```
backend
```
⚠️ **IMPORTANTE:** Como é monorepo, precisa especificar a pasta!

**Runtime:**
```
Node
```
(Deve detectar automaticamente)

**Build Command:**
```
npm install && npx prisma generate && npx prisma migrate deploy
```

**Start Command:**
```
node src/server.js
```

**Plan:**
```
⚠️ IMPORTANTE: Selecione "Free"
```

### 3.5 Variáveis de Ambiente

Role para baixo até **"Environment Variables"**

Clique em **"Add Environment Variable"** e adicione TODAS estas:

**1. DATABASE_URL**
```
Key: DATABASE_URL
Value: (Cole a Internal Database URL que você copiou)
```
Exemplo:
```
postgresql://vereadores_user:senha@dpg-xxxxx-a/vereadores_db
```

**2. JWT_SECRET**
```
Key: JWT_SECRET
Value: (Crie uma chave secreta forte - mín 32 caracteres)
```
Exemplo:
```
minha_chave_super_secreta_jwt_2024_prefeitura_app_v1
```

**3. JWT_EXPIRES_IN**
```
Key: JWT_EXPIRES_IN
Value: 2h
```

**4. PORT**
```
Key: PORT
Value: 3000
```

**5. NODE_ENV**
```
Key: NODE_ENV
Value: production
```

**6. CLOUDINARY_CLOUD_NAME**
```
Key: CLOUDINARY_CLOUD_NAME
Value: (Seu cloud name do Cloudinary)
```

**7. CLOUDINARY_API_KEY**
```
Key: CLOUDINARY_API_KEY
Value: (Sua API key do Cloudinary)
```

**8. CLOUDINARY_API_SECRET**
```
Key: CLOUDINARY_API_SECRET
Value: (Seu API secret do Cloudinary)
```

**9. EMAIL_HOST**
```
Key: EMAIL_HOST
Value: smtp.gmail.com
```

**10. EMAIL_PORT**
```
Key: EMAIL_PORT
Value: 587
```

**11. EMAIL_USER**
```
Key: EMAIL_USER
Value: (Seu email do Gmail)
```

**12. EMAIL_PASS**
```
Key: EMAIL_PASS
Value: (Senha de app do Gmail - NÃO a senha normal!)
```

**13. EMAIL_FROM**
```
Key: EMAIL_FROM
Value: Sistema Vereadores <seu_email@gmail.com>
```

**14. ADMIN_EMAIL**
```
Key: ADMIN_EMAIL
Value: (Email para receber notificações de novos cadastros)
```

### 3.6 Criar Web Service

1. **Revise tudo** - especialmente DATABASE_URL e JWT_SECRET
2. Clique em **"Create Web Service"** (botão azul no final)
3. Aguarde o deploy (~5-10 minutos)

---

## 🎯 PASSO 4: Acompanhar o Deploy

### 4.1 Logs em Tempo Real

Você vai ver uma tela com logs em tempo real:

```
==> Cloning from https://github.com/krisalexandre2018/PrefeituraAPP...
==> Checking out commit xxxxx in branch main
==> Running build command 'npm install && npx prisma generate...'
==> Build successful!
==> Starting service...
==> Server running on port 3000
==> Your service is live 🎉
```

### 4.2 Possíveis Erros

**Erro: "Prisma migrate failed"**
- Causa: DATABASE_URL errado
- Solução: Environment → Edit → Corrigir DATABASE_URL

**Erro: "Module not found"**
- Causa: Build command errado
- Solução: Settings → Build Command → Verificar comando

**Erro: "Port already in use"**
- Causa: Pode ignorar (Render gerencia)

---

## 🎯 PASSO 5: Obter URL da API

### 5.1 URL do Serviço

Quando o deploy terminar, você vai ver no topo da página:

```
https://vereadores-api-xxxx.onrender.com
```

👆 **COPIE ESTA URL!**

### 5.2 URL Completa da API

A URL da API será:
```
https://vereadores-api-xxxx.onrender.com/api
```

**Exemplo:**
```
https://vereadores-api-abc123.onrender.com/api
```

---

## 🎯 PASSO 6: Testar o Backend

### 6.1 Teste de Health Check

Abra no navegador:
```
https://vereadores-api-xxxx.onrender.com/api/health
```

Deve retornar:
```json
{
  "status": "OK",
  "timestamp": "2024-xx-xx...",
  "uptime": 123
}
```

### 6.2 Teste de Conexão com Banco

Abra no navegador:
```
https://vereadores-api-xxxx.onrender.com/api/users
```

Deve retornar:
```json
{
  "error": "Token não fornecido"
}
```
✅ Bom! Significa que a API está funcionando (só precisa de autenticação)

---

## ✅ PASSO 7: Confirmar Sucesso

### Checklist Final:

- [ ] Database PostgreSQL criado
- [ ] Web Service criado
- [ ] Deploy concluído (status: Live)
- [ ] URL da API copiada
- [ ] Health check funcionando
- [ ] Endpoint /api/users retorna erro de autenticação (esperado)

Se todos ✅, **deploy concluído com sucesso!**

---

## 📝 ANOTE ESTAS INFORMAÇÕES

**URL da API:**
```
https://vereadores-api-xxxx.onrender.com/api
```

**Database URL (Internal):**
```
postgresql://user:pass@host/db
```

**Credenciais Importantes:**
- JWT_SECRET: (a chave que você criou)
- Cloudinary: (suas credenciais)
- Email: (seu email e senha de app)

---

## 🚨 IMPORTANTE: Plano Gratuito

O plano gratuito do Render tem algumas limitações:

**Limitações:**
- ✅ 750 horas/mês (suficiente)
- ⏸️ **Dorme após 15 min sem uso** (demora ~30s para "acordar")
- ✅ PostgreSQL 1GB gratuito
- ✅ 100GB tráfego/mês

**O que isso significa:**
- Primeira requisição após inatividade pode demorar ~30 segundos
- Depois funciona normalmente
- Para manter sempre ativo: fazer ping a cada 10 minutos (serviço externo)

---

## 🆘 Problemas Comuns

### ❌ Deploy Failed

**Verifique:**
1. Root Directory = `backend`
2. Build Command correto
3. Start Command = `node src/server.js`
4. Variáveis de ambiente todas configuradas

### ❌ Database Connection Error

**Verifique:**
1. DATABASE_URL está correta (Internal, não External)
2. Database está na mesma região que o Web Service
3. Aguarde 2-3 minutos após criar database

### ❌ "This site can't be reached"

**Aguarde:**
- Primeiro deploy demora ~10 minutos
- Verifique logs no Render dashboard

---

## 🎉 Próximo Passo

Depois que o deploy terminar com sucesso, **me avise** e vou:

1. Atualizar a URL da API no mobile
2. Fazer commit das mudanças
3. Gerar o APK de produção

**Me envie:**
- ✅ URL da API (ex: `https://vereadores-api-abc123.onrender.com/api`)
- ✅ Print mostrando "Your service is live"

Está tudo pronto! Siga o guia e me avise quando terminar! 🚀
