# Tutorial Completo: PostgreSQL no Windows

Guia passo a passo para instalar e configurar o PostgreSQL para o projeto de Ocorrências Urbanas.

## 📥 Passo 1: Download do PostgreSQL

### Opção A: Instalador Oficial (Recomendado)

1. Acesse: https://www.postgresql.org/download/windows/
2. Clique em "Download the installer"
3. Você será redirecionado para o site da EnterpriseDB
4. Baixe a versão **PostgreSQL 16.x** (última estável)
5. Escolha a versão **Windows x86-64**

**Link direto:** https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

### Opção B: Via Chocolatey (se você usa)

```powershell
choco install postgresql
```

## 🔧 Passo 2: Instalação

### Executar o Instalador

1. **Execute o arquivo baixado** (ex: `postgresql-16.x-windows-x64.exe`)
2. Clique em **"Next"** na tela de boas-vindas

### Configurações de Instalação

#### 2.1 - Diretório de Instalação
```
C:\Program Files\PostgreSQL\16
```
✅ Mantenha o padrão e clique em **"Next"**

#### 2.2 - Componentes a Instalar
Marque todas as opções:
- ✅ PostgreSQL Server
- ✅ pgAdmin 4 (interface gráfica)
- ✅ Stack Builder (ferramentas adicionais)
- ✅ Command Line Tools

Clique em **"Next"**

#### 2.3 - Diretório de Dados
```
C:\Program Files\PostgreSQL\16\data
```
✅ Mantenha o padrão e clique em **"Next"**

#### 2.4 - Senha do Superusuário (IMPORTANTE!)
⚠️ **Esta é a senha do usuário `postgres` (administrador)**

Digite uma senha forte e **ANOTE EM LOCAL SEGURO**
Exemplo: `postgres123` (use algo mais forte em produção)

```
Usuário: postgres
Senha: [sua_senha_aqui]
```

Clique em **"Next"**

#### 2.5 - Porta
```
Port: 5432
```
✅ Mantenha a porta padrão e clique em **"Next"**

#### 2.6 - Locale
```
Locale: Portuguese, Brazil
```
Ou mantenha **"Default locale"**

Clique em **"Next"**

#### 2.7 - Resumo
Revise as configurações e clique em **"Next"**

#### 2.8 - Instalação
Clique em **"Next"** e aguarde a instalação (3-5 minutos)

#### 2.9 - Stack Builder
Desmarque a opção "Launch Stack Builder at exit"
Clique em **"Finish"**

## ✅ Passo 3: Verificar Instalação

### 3.1 - Verificar se PostgreSQL está rodando

1. Abra o **Gerenciador de Tarefas** (Ctrl + Shift + Esc)
2. Vá em **"Serviços"**
3. Procure por **"postgresql-x64-16"**
4. Status deve estar: **"Em execução"**

### 3.2 - Testar via Command Line

Abra o **CMD** ou **PowerShell** e execute:

```bash
# Adicionar PostgreSQL ao PATH (se necessário)
set PATH=%PATH%;C:\Program Files\PostgreSQL\16\bin

# Testar conexão
psql --version
```

Deve retornar algo como:
```
psql (PostgreSQL) 16.x
```

### 3.3 - Conectar ao PostgreSQL

```bash
psql -U postgres
```

Digite a senha que você definiu na instalação.

Se conectou, você verá:
```
postgres=#
```

Para sair:
```sql
\q
```

## 🗄️ Passo 4: Criar Banco de Dados do Projeto

### Opção A: Via Command Line (psql)

```bash
# Conectar como postgres
psql -U postgres

# Dentro do psql, criar o banco
CREATE DATABASE vereadores_db;

# Verificar se foi criado
\l

# Conectar ao banco criado
\c vereadores_db

# Sair
\q
```

### Opção B: Via pgAdmin 4 (Interface Gráfica)

1. Abra o **pgAdmin 4** (procure no menu Iniciar)
2. Na primeira vez, defina uma **master password** (anote!)
3. No painel esquerdo, expanda **"Servers"**
4. Clique em **"PostgreSQL 16"**
5. Digite a senha do usuário `postgres`
6. Clique com botão direito em **"Databases"** → **"Create"** → **"Database"**
7. Preencha:
   - **Database**: `vereadores_db`
   - **Owner**: `postgres`
8. Clique em **"Save"**

## 🔑 Passo 5: Configurar o Backend do Projeto

### 5.1 - Ir para a pasta do backend

```bash
cd "E:\Todos os projetos\Prefeitura App\backend"
```

### 5.2 - Criar arquivo .env

Se não existir o arquivo `.env`, crie:

```bash
# Windows CMD
copy .env.example .env

# Ou crie manualmente
notepad .env
```

### 5.3 - Configurar DATABASE_URL

Edite o arquivo `.env` e configure a linha `DATABASE_URL`:

```env
# Formato:
# DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_BANCO"

# Com os dados padrão:
DATABASE_URL="postgresql://postgres:sua_senha_aqui@localhost:5432/vereadores_db"
```

**Exemplo completo:**
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/vereadores_db"
JWT_SECRET="chave_secreta_muito_segura_aqui"
JWT_EXPIRES_IN="2h"

# ... resto das configurações
```

⚠️ **Substitua `sua_senha_aqui` pela senha que você definiu na instalação!**

### 5.4 - Testar Conexão do Prisma

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Testar conexão com o banco
npx prisma db pull
```

Se conectou com sucesso, você verá:
```
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "vereadores_db"...
```

## 🚀 Passo 6: Executar Migrations

Agora vamos criar as tabelas no banco de dados:

```bash
# Gerar as migrations e criar tabelas
npm run prisma:migrate

# Ou manualmente:
npx prisma migrate dev --name init

# Gerar o Prisma Client
npm run prisma:generate
```

Você verá mensagens como:
```
✔ Generated Prisma Client to .\node_modules\@prisma\client
```

### Verificar Tabelas Criadas

#### Via psql:
```bash
psql -U postgres -d vereadores_db

# Listar tabelas
\dt

# Deve mostrar:
# users, ocorrencias, fotos, historicos, notificacoes
```

#### Via pgAdmin 4:
1. Expanda **vereadores_db** → **Schemas** → **public** → **Tables**
2. Você verá: `users`, `ocorrencias`, `fotos`, `historicos`, `notificacoes`

## 🎨 Passo 7: Usar o Prisma Studio (Opcional mas Útil)

Interface visual para visualizar e editar dados:

```bash
npm run prisma:studio

# Ou
npx prisma studio
```

Abrirá no navegador: `http://localhost:5555`

Aqui você pode:
- Ver todas as tabelas
- Adicionar/editar/deletar registros
- Criar o primeiro usuário admin
- Visualizar relacionamentos

## 🔐 Passo 8: Criar Primeiro Usuário Admin

### Opção A: Via Prisma Studio

1. Execute `npm run prisma:studio`
2. Clique em **"User"**
3. Clique em **"Add record"**
4. Preencha:
   ```
   nome: Admin Sistema
   cpf: 00000000000
   email: admin@sistema.com
   senha: $2a$10$... (gere um hash bcrypt - veja abaixo)
   tipo: ADMIN
   status: ATIVO
   ```
5. Clique em **"Save 1 change"**

### Opção B: Via SQL

```sql
-- Conectar ao banco
psql -U postgres -d vereadores_db

-- Inserir admin (senha em texto plano será hasheada pelo backend)
-- MELHOR: Cadastre via API POST /api/auth/register e depois promova
INSERT INTO users (id, nome, cpf, email, senha, tipo, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Admin Sistema',
  '00000000000',
  'admin@sistema.com',
  '$2a$10$XN8.nSPKKXnKFqwN5qWJP.IjG8YQvH4QGqxMmBZnJnL5xN8Qo9X5e', -- senha: admin123
  'ADMIN',
  'ATIVO',
  NOW(),
  NOW()
);
```

### Opção C: Cadastrar via App e Promover (Recomendado)

```bash
# 1. Inicie o backend
npm run dev

# 2. Cadastre um usuário via POST /api/auth/register
# Use Postman, Insomnia ou o próprio app mobile

# 3. Promova para admin via SQL:
psql -U postgres -d vereadores_db

UPDATE users SET tipo = 'ADMIN', status = 'ATIVO' WHERE email = 'seu@email.com';
```

## 🧪 Passo 9: Testar Tudo

### 9.1 - Iniciar o Backend

```bash
cd backend
npm run dev
```

Você deve ver:
```
🚀 Servidor rodando em http://localhost:3000
✅ Conectado ao PostgreSQL
```

### 9.2 - Testar Endpoint de Health Check

Abra o navegador:
```
http://localhost:3000/health
```

Deve retornar algo como:
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T..."
}
```

### 9.3 - Testar Cadastro de Usuário

Use um cliente HTTP (Postman, Insomnia) ou curl:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"nome\": \"João Silva\",
    \"cpf\": \"12345678900\",
    \"email\": \"joao@teste.com\",
    \"senha\": \"senha123\",
    \"telefone\": \"11999999999\"
  }"
```

### 9.4 - Verificar no Prisma Studio

```bash
npm run prisma:studio
```

Vá em **"User"** e veja o usuário criado!

## 🛠️ Comandos Úteis

### Gerenciar Serviço PostgreSQL

```bash
# Parar PostgreSQL
net stop postgresql-x64-16

# Iniciar PostgreSQL
net start postgresql-x64-16

# Status
sc query postgresql-x64-16
```

### Backup do Banco

```bash
# Fazer backup
pg_dump -U postgres -d vereadores_db -F c -b -v -f "backup_vereadores.backup"

# Restaurar backup
pg_restore -U postgres -d vereadores_db -v "backup_vereadores.backup"
```

### Resetar Banco (CUIDADO - APAGA TUDO!)

```bash
cd backend

# Resetar e recriar tudo
npx prisma migrate reset

# Confirmar com 'y'
```

## 🐛 Troubleshooting

### Erro: "psql: error: connection refused"

**Problema**: PostgreSQL não está rodando

**Solução**:
```bash
net start postgresql-x64-16
```

### Erro: "password authentication failed"

**Problema**: Senha incorreta

**Solução**:
1. Verifique a senha no `.env`
2. Teste conectar via psql:
   ```bash
   psql -U postgres
   ```

### Erro: "role does not exist"

**Problema**: Usuário postgres não encontrado

**Solução**: Reinstale o PostgreSQL seguindo este tutorial

### Erro: "database does not exist"

**Problema**: Banco `vereadores_db` não foi criado

**Solução**:
```bash
psql -U postgres
CREATE DATABASE vereadores_db;
\q
```

### Erro: "Prisma Client could not locate"

**Problema**: Prisma Client não foi gerado

**Solução**:
```bash
npm run prisma:generate
```

### PostgreSQL usando muita RAM

**Solução**: Editar configurações em:
```
C:\Program Files\PostgreSQL\16\data\postgresql.conf
```

Ajustar:
```conf
shared_buffers = 256MB        # era 128MB
effective_cache_size = 1GB    # era 4GB
```

Reiniciar serviço:
```bash
net stop postgresql-x64-16
net start postgresql-x64-16
```

## 📚 Recursos Adicionais

### Ferramentas Recomendadas

1. **pgAdmin 4** (já instalado) - Interface gráfica completa
2. **DBeaver** - Cliente universal SQL (https://dbeaver.io/)
3. **TablePlus** - Cliente moderno e bonito (https://tableplus.com/)

### Documentação Oficial

- PostgreSQL Docs: https://www.postgresql.org/docs/
- Prisma Docs: https://www.prisma.io/docs/

### Tutoriais em Vídeo (PT-BR)

- Busque no YouTube: "PostgreSQL Windows instalação"
- Busque: "Prisma PostgreSQL tutorial"

## ✅ Checklist Final

Marque conforme completa:

- [ ] PostgreSQL instalado
- [ ] Serviço rodando (verificado no Gerenciador de Tarefas)
- [ ] Senha do postgres anotada
- [ ] psql funcionando no terminal
- [ ] Banco `vereadores_db` criado
- [ ] Arquivo `.env` configurado com DATABASE_URL correta
- [ ] `npm install` executado na pasta backend
- [ ] `npm run prisma:migrate` executado com sucesso
- [ ] Tabelas criadas (verificado no Prisma Studio ou pgAdmin)
- [ ] Backend iniciado com `npm run dev` sem erros
- [ ] Primeiro usuário admin criado
- [ ] Testado endpoint de cadastro de usuário

## 🎉 Próximos Passos

Agora que o PostgreSQL está configurado:

1. Configure o Cloudinary (para upload de imagens)
2. Configure o email (Gmail SMTP)
3. Inicie o app mobile
4. Teste o fluxo completo de criação de ocorrências

Consulte o **backend/README.md** para mais detalhes!

---

**Dúvidas?** Consulte a seção de Troubleshooting ou os arquivos:
- `backend/README.md`
- `CLAUDE.md`
- `ARQUITETURA.md`
