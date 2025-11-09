# Guia de Instalação e Configuração - Sistema de Ocorrências Urbanas

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org))
- **npm** >= 9.0.0 (vem com Node.js)
- **PostgreSQL** >= 14 ([Download](https://www.postgresql.org/download/) ou use Docker)
- **Git** ([Download](https://git-scm.com/))
- **Expo CLI** (será instalado automaticamente)

### Opcional
- **Docker Desktop** - Para rodar PostgreSQL em container
- **Android Studio** - Para emulador Android
- **Xcode** - Para emulador iOS (apenas macOS)

---

## 1. Clonar/Navegar para o Projeto

```bash
cd "E:\Todos os projetos\Prefeitura App"
```

---

## 2. Configurar Banco de Dados PostgreSQL

### Opção A: PostgreSQL Local

1. **Instalar PostgreSQL**
   - Windows: Baixar instalador oficial
   - Mac: `brew install postgresql`
   - Linux: `sudo apt install postgresql`

2. **Criar banco de dados**
```sql
-- Conectar ao PostgreSQL
psql -U postgres

-- Criar database
CREATE DATABASE vereadores_db;

-- Criar usuário (opcional)
CREATE USER vereador_user WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE vereadores_db TO vereador_user;
```

### Opção B: PostgreSQL com Docker (Recomendado)

```bash
# Usar docker-compose.yml já configurado
docker-compose up -d
```

---

## 3. Configurar Variáveis de Ambiente

### Backend

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `backend/.env` e configure:

```env
# Banco de dados
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/vereadores_db"

# JWT (gere uma chave forte)
JWT_SECRET="use_o_comando_abaixo_para_gerar"

# Cloudinary (criar conta em https://cloudinary.com)
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"

# Email (Gmail - precisa de senha de app)
EMAIL_USER="seuemail@gmail.com"
EMAIL_PASS="senha_de_app_google"
```

**Gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Mobile

```bash
cd ../mobile
cp .env.example .env
```

Edite o arquivo `mobile/.env`:

```env
# Descobrir seu IP local:
# Windows: ipconfig
# Mac/Linux: ifconfig ou ip addr

API_BASE_URL=http://192.168.1.100:3000
```

---

## 4. Instalar Dependências

### Opção A: Instalação Automática (Recomendado)

```bash
# Na raiz do projeto
npm run setup
```

Este comando irá:
- Instalar dependências da raiz
- Instalar dependências do backend
- Instalar dependências do mobile
- Gerar Prisma Client

### Opção B: Instalação Manual

```bash
# Raiz
npm install

# Backend
cd backend
npm install
npm run prisma:generate

# Mobile
cd ../mobile
npm install
```

---

## 5. Configurar Banco de Dados (Migrations)

```bash
cd backend

# Criar migrations e aplicar ao banco
npm run prisma:migrate

# Verificar se tabelas foram criadas
npm run prisma:studio
```

---

## 6. Criar Primeiro Usuário Admin

### Opção A: Via Prisma Studio (GUI)

```bash
cd backend
npm run prisma:studio
```

1. Abrir navegador em `http://localhost:5555`
2. Criar novo usuário com:
   - tipo: `ADMIN`
   - status: `ATIVO`
   - senha: será hasheada no primeiro login

### Opção B: Via SQL

```sql
-- Conectar ao banco
psql -U postgres -d vereadores_db

-- Inserir admin (senha será trocada no primeiro login)
INSERT INTO users (id, nome, cpf, email, senha, tipo, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Administrador',
  '00000000000',
  'admin@exemplo.com',
  '$2a$10$example_hash_here',  -- Trocar após primeiro login
  'ADMIN',
  'ATIVO',
  NOW(),
  NOW()
);
```

### Opção C: Cadastrar via App e Promover

```bash
# 1. Cadastrar usuário no app mobile
# 2. Promover para admin via SQL
UPDATE users SET tipo = 'ADMIN', status = 'ATIVO' WHERE email = 'seu@email.com';
```

---

## 7. Configurar Serviços Externos

### Cloudinary (Upload de Imagens)

1. Criar conta gratuita em [cloudinary.com](https://cloudinary.com)
2. Acessar Dashboard
3. Copiar: Cloud Name, API Key, API Secret
4. Colar no arquivo `backend/.env`

**Free Tier:** 25GB armazenamento + 25GB bandwidth/mês

### Email (Gmail)

1. Ativar verificação em 2 etapas na sua conta Google
2. Gerar "Senha de App":
   - Acesse: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Selecionar "Email" e "Outro (nome personalizado)"
   - Copiar senha gerada (16 caracteres)
3. Colar no arquivo `backend/.env` em `EMAIL_PASS`

**Nota:** Não use sua senha normal do Gmail!

---

## 8. Iniciar Desenvolvimento

### Opção A: Backend e Mobile Juntos

```bash
# Na raiz do projeto
npm run dev
```

### Opção B: Separadamente

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Mobile:**
```bash
cd mobile
npm start
```

---

## 9. Testar Backend

```bash
# Health check
curl http://localhost:3000/health

# Deve retornar:
{
  "status": "ok",
  "timestamp": "2024-11-02T...",
  "database": "connected"
}
```

---

## 10. Testar Mobile

### Emulador Android

```bash
cd mobile
npm run android
```

### Emulador iOS (apenas Mac)

```bash
cd mobile
npm run ios
```

### Dispositivo Físico

1. Instalar **Expo Go** na loja de apps
2. Escanear QR code que aparece no terminal
3. Certificar-se que celular e computador estão na mesma rede Wi-Fi

---

## Verificação Final (Checklist)

- [ ] PostgreSQL rodando (local ou Docker)
- [ ] Backend `.env` configurado
- [ ] Mobile `.env` configurado (IP correto)
- [ ] Dependências instaladas
- [ ] Migrations executadas
- [ ] Prisma Client gerado
- [ ] Primeiro admin criado
- [ ] Cloudinary configurado
- [ ] Email configurado
- [ ] Backend iniciado (porta 3000)
- [ ] Mobile iniciado (Expo)
- [ ] Health check respondendo
- [ ] App abre no dispositivo/emulador

---

## Troubleshooting Comum

### Backend não inicia

**Erro:** `Error: P1001: Can't reach database server`
- **Solução:** Verificar se PostgreSQL está rodando
```bash
# Windows
services.msc → PostgreSQL
# Linux/Mac
sudo systemctl status postgresql
```

### Mobile não conecta à API

**Erro:** `Network request failed`
- **Solução 1:** Verificar se backend está rodando
- **Solução 2:** Verificar IP no `mobile/.env`
- **Solução 3:** Testar URL no navegador: `http://SEU_IP:3000/health`
- **Solução 4:** Celular e PC na mesma rede Wi-Fi

### Cloudinary upload falha

**Erro:** `Invalid API credentials`
- **Solução:** Verificar credenciais no `backend/.env`
- Cloud Name, API Key e API Secret corretos

### Email não envia

**Erro:** `Invalid login`
- **Solução:** Usar "Senha de App" do Google (não senha normal)
- Verificar se 2FA está ativado

### Prisma migrate falha

**Erro:** `Migration failed`
- **Solução 1:** Resetar banco (CUIDADO - apaga dados)
```bash
cd backend
npx prisma migrate reset
```
- **Solução 2:** Verificar permissões do usuário PostgreSQL

---

## Comandos Úteis

```bash
# Ver logs do Docker
docker-compose logs -f

# Resetar banco (apaga todos os dados)
cd backend
npx prisma migrate reset

# Visualizar/editar dados (GUI)
cd backend
npm run prisma:studio

# Limpar cache do Expo
cd mobile
expo start -c

# Limpar node_modules e reinstalar
npm run clean
npm run install:all
```

---

## Próximos Passos

1. Configurar ambiente de produção
2. Deploy do backend (Railway, Render, Heroku)
3. Build do app mobile (APK/IPA)
4. Configurar domínio customizado
5. Configurar notificações push (Firebase)

---

## Documentação Adicional

- `CLAUDE.md` - Guia completo do sistema
- `ARQUITETURA.md` - Arquitetura e módulos
- `README.md` - Visão geral
- `docs/ESTRUTURA_PROJETO.md` - Estrutura de pastas
- `backend/README.md` - Documentação backend
- `mobile/README.md` - Documentação mobile

---

## Suporte

Em caso de problemas:
1. Verificar documentação em `CLAUDE.md`
2. Consultar troubleshooting acima
3. Verificar logs do backend: `backend/logs/`
4. Verificar console do navegador/app

---

**Última atualização:** 02/11/2024
**Versão:** 1.0.0
