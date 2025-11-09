# 🚀 Guia de Início Rápido

Este guia vai te ajudar a colocar o sistema no ar em 15 minutos!

## ✅ Checklist de Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [ ] Node.js 18 ou superior ([Download](https://nodejs.org))
- [ ] PostgreSQL ([Download](https://www.postgresql.org/download/))
- [ ] Git ([Download](https://git-scm.com/downloads))
- [ ] Expo Go no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))

## 📝 Passo a Passo

### 1️⃣ Criar Contas Necessárias (5 min)

#### Cloudinary (para armazenar fotos)
1. Acesse https://cloudinary.com
2. Clique em "Sign Up Free"
3. Após login, vá no Dashboard
4. Anote:
   - Cloud Name
   - API Key
   - API Secret

#### Gmail (para enviar emails)
1. Acesse sua conta Google
2. Vá em https://myaccount.google.com/security
3. Ative "Verificação em duas etapas"
4. Clique em "Senhas de app"
5. Selecione "Email" e "Outro"
6. Copie a senha gerada (16 caracteres)

---

### 2️⃣ Configurar Banco de Dados (2 min)

Abra o terminal e execute:

```bash
# Windows (PowerShell como Admin)
psql -U postgres

# Linux/Mac
sudo -u postgres psql
```

Dentro do PostgreSQL:
```sql
CREATE DATABASE vereadores_db;
\q
```

---

### 3️⃣ Configurar Backend (5 min)

```bash
# Navegue até a pasta backend
cd backend

# Instale as dependências
npm install

# Copie o arquivo de exemplo
copy .env.example .env    # Windows
cp .env.example .env      # Linux/Mac

# Agora edite o arquivo .env com um editor de texto
```

**Edite o arquivo `.env` com estes dados:**

```env
PORT=3000

# Banco de dados (altere 'senha123' para sua senha do PostgreSQL)
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/vereadores_db"

# JWT (pode manter essa)
JWT_SECRET="chave_super_secreta_123456789"
JWT_EXPIRES_IN="2h"

# Cloudinary (cole os dados que você anotou)
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"

# Gmail (cole o email e a senha de app que você gerou)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="seuemail@gmail.com"
EMAIL_PASS="xxxx xxxx xxxx xxxx"
EMAIL_FROM="Sistema Vereadores <seuemail@gmail.com>"
ADMIN_EMAIL="seuemail@gmail.com"

# Frontend
FRONTEND_URL="http://localhost:19006"

# Ambiente
NODE_ENV="development"
```

**Execute as migrations:**
```bash
npm run prisma:migrate
```

**Inicie o servidor:**
```bash
npm run dev
```

Você deve ver:
```
🚀 Servidor rodando na porta 3000
📍 Ambiente: development
```

✅ **Backend configurado!** Mantenha este terminal aberto.

---

### 4️⃣ Configurar Mobile (3 min)

Abra um **NOVO terminal** (deixe o backend rodando):

```bash
# Navegue até a pasta mobile
cd mobile

# Instale as dependências
npm install
```

**Configure a URL da API:**

1. Abra o arquivo `mobile/src/services/api.js`
2. Encontre a linha:
   ```javascript
   const API_URL = 'http://192.168.1.100:3000/api';
   ```
3. **Descubra o IP do seu computador:**

   **Windows (PowerShell):**
   ```bash
   ipconfig
   # Procure por "Endereço IPv4"
   # Exemplo: 192.168.1.105
   ```

   **Linux/Mac:**
   ```bash
   ifconfig | grep "inet "
   # ou
   ip addr show
   # Procure por algo como 192.168.x.x
   ```

4. Altere para o seu IP:
   ```javascript
   const API_URL = 'http://192.168.1.105:3000/api';
   ```

**Inicie o app:**
```bash
npm start
```

Um QR Code aparecerá no terminal.

✅ **Mobile configurado!**

---

### 5️⃣ Testar no Celular (5 min)

1. **Abra o Expo Go** no celular
2. **Escaneie o QR Code** que apareceu no terminal
3. O app vai carregar (pode demorar na primeira vez)

**Primeira vez:**
1. Toque em "Não tem conta? Cadastre-se"
2. Preencha os dados:
   - Nome: Seu nome
   - CPF: 12345678900
   - Email: seu@email.com
   - Telefone: 11999999999
   - Senha: 123456
3. Toque em "Cadastrar"
4. Você verá: "Aguarde aprovação do administrador"

---

### 6️⃣ Aprovar Primeiro Usuário (2 min)

Como ainda não existe admin, vamos criar um direto no banco:

**Opção A: Via Prisma Studio (mais fácil)**
```bash
# Em um novo terminal, na pasta backend
cd backend
npm run prisma:studio
```

Isso abrirá uma interface web no navegador:
1. Clique em "User"
2. Encontre seu usuário
3. Clique nele
4. Altere:
   - `tipo` → `ADMIN`
   - `status` → `ATIVO`
5. Clique em "Save 1 change"

**Opção B: Via SQL**
```bash
psql -U postgres vereadores_db

UPDATE users SET tipo = 'ADMIN', status = 'ATIVO' WHERE email = 'seu@email.com';

\q
```

---

### 7️⃣ Fazer Login e Usar! (5 min)

1. **No app**, volte para tela de login
2. Faça login com seu email e senha
3. Você está dentro! 🎉

**Teste o fluxo completo:**
1. Toque em "Nova Ocorrência"
2. Toque em "Câmera" e tire uma foto
3. Preencha:
   - Título: "Teste de ocorrência"
   - Descrição: "Testando o sistema"
   - Categoria: escolha uma
   - Prioridade: escolha uma
   - Endereço: será preenchido automaticamente
4. Toque em "Registrar Ocorrência"
5. Sucesso! Você verá a notificação

Agora vá para "Início" e veja sua ocorrência listada.

---

## 🎯 Resultado

Você agora tem:
- ✅ Backend rodando em http://localhost:3000
- ✅ App mobile funcionando no celular
- ✅ Banco de dados configurado
- ✅ Sistema de fotos funcionando
- ✅ GPS capturando localização
- ✅ Emails sendo enviados

## 🔧 Comandos Úteis

**Parar os serviços:**
- Backend: Pressione `Ctrl + C` no terminal
- Mobile: Pressione `Ctrl + C` no terminal

**Reiniciar:**
```bash
# Backend
cd backend && npm run dev

# Mobile
cd mobile && npm start
```

**Ver banco de dados:**
```bash
cd backend && npm run prisma:studio
```

## ❗ Problemas Comuns

### "Network request failed"
- Verifique se o IP está correto no `api.js`
- Teste no navegador: `http://SEU_IP:3000/health`
- Certifique-se de que celular e PC estão na mesma rede WiFi

### "Connection refused"
- Backend não está rodando
- Execute: `cd backend && npm run dev`

### "Cannot find module"
- Dependências não instaladas
- Execute: `npm install` na pasta correta

### "Unauthorized"
- Token expirado (expira em 2h)
- Faça logout e login novamente

## 📚 Próximos Passos

Agora que está funcionando:

1. **Leia a documentação completa:**
   - [ARQUITETURA.md](./ARQUITETURA.md)
   - [backend/README.md](./backend/README.md)
   - [mobile/README.md](./mobile/README.md)

2. **Crie mais usuários:**
   - Cadastre vereadores no app
   - Aprove via Prisma Studio
   - Teste com múltiplos usuários

3. **Explore as funcionalidades:**
   - Criar várias ocorrências
   - Testar diferentes categorias
   - Ver detalhes e histórico

4. **Customize:**
   - Altere cores e estilos
   - Adicione novas categorias
   - Implemente melhorias

## 🎓 Recursos

- **API Docs:** http://localhost:3000/health (para verificar se está rodando)
- **Banco de Dados:** http://localhost:5555 (Prisma Studio)
- **Expo Docs:** https://docs.expo.dev
- **Prisma Docs:** https://www.prisma.io/docs

## 💡 Dicas

- Mantenha ambos terminais abertos (backend + mobile)
- Use Prisma Studio para visualizar dados
- Teste em dispositivo físico (melhor que emulador)
- Verifique os logs do backend para debug

---

**Pronto! Seu sistema está funcionando!** 🚀

Se tiver problemas, consulte a documentação completa ou verifique os logs dos terminais.
