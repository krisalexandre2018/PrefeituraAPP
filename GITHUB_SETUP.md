# 📦 Guia de Upload para GitHub

Este guia explica como subir o projeto para o GitHub, excluindo arquivos do Claude Code e mantendo apenas o código do aplicativo.

## ✅ Arquivos que SERÃO incluídos

### Backend
- ✅ Código fonte (`backend/src/`)
- ✅ Schema do Prisma (`backend/prisma/schema.prisma`)
- ✅ Package.json e configurações
- ✅ Testes (`backend/tests/`)
- ✅ Documentação (`backend/README.md`)
- ✅ `.env.example` (template sem dados sensíveis)

### Mobile
- ✅ Código fonte (`mobile/src/`)
- ✅ Assets (ícones, imagens)
- ✅ Configurações (`app.json`, `eas.json`, `package.json`)
- ✅ Documentação (`mobile/README.md`, `mobile/BUILD_GUIDE.md`, etc)
- ✅ `.env.example` (template sem dados sensíveis)

### Raiz do Projeto
- ✅ `README.md` principal
- ✅ `CLAUDE.md` (instruções do projeto)
- ✅ `ARQUITETURA.md` (documentação técnica)
- ✅ `.gitignore` e `.gitattributes`

---

## ❌ Arquivos que NÃO SERÃO incluídos (já configurados no .gitignore)

### Claude Code (Excluídos)
- ❌ `.claude/` - Configurações do Claude Code
- ❌ `agents/` - Agentes customizados
- ❌ `*.claude.md` - Arquivos do Claude
- ❌ `m.txt` - Arquivos temporários

### Arquivos Sensíveis (Excluídos)
- ❌ `.env` - Variáveis de ambiente (senhas, tokens)
- ❌ `node_modules/` - Dependências (muito grande)
- ❌ `*.log` - Logs do sistema
- ❌ `coverage/` - Relatórios de testes

### Build e Cache (Excluídos)
- ❌ `dist/` e `build/` - Arquivos compilados
- ❌ `.expo/` - Cache do Expo
- ❌ `backend/uploads/` - Uploads de usuários

---

## 🚀 Passo a Passo para Subir no GitHub

### 1. Inicializar Git (se ainda não estiver)

```bash
cd "E:\Todos os projetos\Prefeitura App"

# Verificar se já é um repositório git
git status

# Se não for, inicializar
git init
```

### 2. Verificar o .gitignore

O arquivo `.gitignore` já está configurado para excluir:
- Arquivos do Claude Code
- Variáveis de ambiente
- node_modules
- Cache e build

**Verificar:**
```bash
# Ver o que será incluído
git status

# Ver o que está sendo ignorado
git status --ignored
```

### 3. Adicionar Arquivos

```bash
# Adicionar todos os arquivos (exceto os ignorados)
git add .

# Verificar o que será commitado
git status
```

### 4. Fazer o Primeiro Commit

```bash
git commit -m "Primeiro commit: Sistema de Ocorrências Urbanas

- Backend: API REST Node.js + Express + PostgreSQL
- Mobile: App React Native + Expo SDK 50
- Funcionalidades: Registro de ocorrências, fotos, GPS, notificações
- Autenticação JWT com 3 tipos de usuários (Admin, Vereador, Jurídico)
- Testes unitários e integração
- Documentação completa"
```

### 5. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name:** `sistema-ocorrencias-vereadores` (ou outro nome)
   - **Description:** "Sistema de registro de ocorrências urbanas para vereadores com app mobile"
   - **Visibilidade:** Public ou Private (sua escolha)
   - **NÃO marque:** "Add README.md" (já temos)
   - **NÃO marque:** "Add .gitignore" (já temos)
3. Clique em **"Create repository"**

### 6. Conectar ao Repositório Remoto

Copie o comando que o GitHub mostra e execute:

```bash
# Exemplo (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/sistema-ocorrencias-vereadores.git

# Verificar se foi adicionado
git remote -v
```

### 7. Enviar para o GitHub

```bash
# Primeira vez (cria a branch main e envia)
git branch -M main
git push -u origin main

# Próximas vezes (apenas)
git push
```

---

## 🔐 Variáveis de Ambiente (Importante!)

Os arquivos `.env` **NÃO** serão enviados ao GitHub (estão no .gitignore).

### O que fazer:

1. ✅ Arquivos `.env.example` **SERÃO** enviados (templates sem dados sensíveis)
2. ✅ Documentar no README como configurar variáveis de ambiente
3. ❌ **NUNCA** commitar arquivos `.env` reais

### Exemplo de .env.example (Backend)

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"

# JWT
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN="2h"

# Cloudinary
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="seu_email@gmail.com"
EMAIL_PASS="sua_senha_de_app"
```

---

## 📝 Comandos Git Úteis

### Verificar Status
```bash
git status                 # Ver mudanças
git status --ignored       # Ver arquivos ignorados
git log --oneline          # Ver histórico de commits
```

### Fazer Mudanças
```bash
git add .                  # Adicionar todos arquivos
git add arquivo.js         # Adicionar arquivo específico
git commit -m "Mensagem"   # Criar commit
git push                   # Enviar para GitHub
```

### Branches
```bash
git branch                 # Listar branches
git branch nova-feature    # Criar branch
git checkout nova-feature  # Trocar de branch
git merge nova-feature     # Mesclar branch
```

### Desfazer Mudanças
```bash
git checkout -- arquivo.js  # Desfazer mudanças não commitadas
git reset HEAD arquivo.js   # Remover do staging
git revert COMMIT_ID        # Reverter commit
```

---

## 🔍 Verificar o que Será Enviado

Antes de fazer push, você pode verificar:

### Ver tamanho do repositório
```bash
# Windows PowerShell
Get-ChildItem -Recurse | Measure-Object -Property Length -Sum

# Git bash
du -sh .git
```

### Ver lista de arquivos
```bash
git ls-files
```

### Ver arquivos ignorados
```bash
git status --ignored
```

---

## ⚠️ Problemas Comuns

### 1. ".env foi commitado acidentalmente"

```bash
# Remover do Git (mas manter no disco)
git rm --cached .env

# Adicionar ao .gitignore se não estiver
echo ".env" >> .gitignore

# Commitar a remoção
git add .gitignore
git commit -m "Remove .env do Git"
git push
```

### 2. "Arquivo muito grande"

GitHub limita arquivos a 100MB. Se precisar enviar arquivo maior:

```bash
# Adicionar ao .gitignore
echo "arquivo_grande.zip" >> .gitignore

# Remover do Git se já foi commitado
git rm --cached arquivo_grande.zip
git commit -m "Remove arquivo grande"
```

### 3. "Esqueci de adicionar algo ao .gitignore"

```bash
# Adicionar ao .gitignore
echo "pasta_que_esqueci/" >> .gitignore

# Remover do cache do Git
git rm -r --cached pasta_que_esqueci/

# Commitar
git add .gitignore
git commit -m "Atualiza .gitignore"
git push
```

---

## 📊 Estrutura Final no GitHub

```
seu-usuario/sistema-ocorrencias-vereadores
│
├── backend/
│   ├── src/
│   ├── tests/
│   ├── prisma/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── mobile/
│   ├── src/
│   ├── assets/
│   ├── app.json
│   ├── eas.json
│   ├── package.json
│   ├── .env.example
│   ├── BUILD_GUIDE.md
│   └── README.md
│
├── README.md
├── CLAUDE.md
├── ARQUITETURA.md
├── .gitignore
└── .gitattributes
```

**NÃO aparecerão:**
- `.claude/`
- `agents/`
- `.env` (variáveis reais)
- `node_modules/`
- Logs e cache

---

## 🎯 Checklist Final

Antes de fazer `git push`:

- [ ] Arquivo `.gitignore` atualizado
- [ ] Nenhum arquivo `.env` no staging
- [ ] `.env.example` criado com templates
- [ ] README.md completo
- [ ] Código testado e funcionando
- [ ] Sem senhas ou tokens no código
- [ ] Commits com mensagens descritivas
- [ ] Branch main configurada

**Está tudo pronto para subir no GitHub!** 🚀

---

## 📚 Recursos

- [GitHub Docs](https://docs.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Gitignore Templates](https://github.com/github/gitignore)
