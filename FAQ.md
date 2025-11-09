# FAQ - Perguntas Frequentes

Respostas para as perguntas mais comuns sobre o Sistema de Ocorrencias Urbanas.

## Sumario

- [Instalacao e Configuracao](#instalacao-e-configuracao)
- [Backend](#backend)
- [Mobile](#mobile)
- [Banco de Dados](#banco-de-dados)
- [Autenticacao](#autenticacao)
- [Ocorrencias](#ocorrencias)
- [Upload de Fotos](#upload-de-fotos)
- [Erros Comuns](#erros-comuns)
- [Producao e Deploy](#producao-e-deploy)

---

## Instalacao e Configuracao

### Como instalar o projeto pela primeira vez?

Siga o [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) que tem um guia passo a passo de 15 minutos.

### Quais sao os pre-requisitos?

- Node.js 18 ou superior
- PostgreSQL instalado e rodando
- Conta no Cloudinary (gratuita)
- Conta Gmail para envio de emails
- Expo Go no celular (para testar o app)

### O que e o arquivo .env e como configura-lo?

O `.env` armazena configuracoes sensiveis como senhas e chaves.

```bash
# Copie o exemplo
cd backend
cp .env.example .env

# Edite com suas credenciais
# Nunca commite o .env no git!
```

---

## Backend

### Como iniciar o backend?

```bash
cd backend
npm install
npm run dev
```

O servidor estara em `http://localhost:3000`

### Como resetar o banco de dados?

```bash
cd backend
npx prisma migrate reset
```

**Atencao:** Isso apaga TODOS os dados!

### Como visualizar o banco de dados?

```bash
cd backend
npm run prisma:studio
```

Abrira uma interface web em `http://localhost:5555`

### Como criar um usuario admin?

Existem duas formas:

**Opcao 1: Via Prisma Studio**
```bash
npm run prisma:studio
# Abra Users, encontre seu usuario
# Mude tipo para ADMIN e status para ATIVO
```

**Opcao 2: Via SQL**
```sql
psql -U postgres vereadores_db

UPDATE users SET tipo = 'ADMIN', status = 'ATIVO'
WHERE email = 'seu@email.com';
```

### Como adicionar novos campos no banco?

1. Edite `backend/prisma/schema.prisma`
2. Crie uma migration:
   ```bash
   npx prisma migrate dev --name nome_da_mudanca
   ```
3. O Prisma atualiza o banco automaticamente

### Posso usar MySQL em vez de PostgreSQL?

Sim! No `schema.prisma`, mude:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

E ajuste a `DATABASE_URL` no `.env`.

---

## Mobile

### Como mudar a URL da API no mobile?

Edite `mobile/src/services/api.js`:

```javascript
const API_URL = 'http://SEU_IP:3000/api';
```

**Importante:** Use o IP local da sua maquina, nao `localhost`!

### Como descobrir o IP da minha maquina?

**Windows:**
```bash
ipconfig
# Procure "IPv4 Address"
```

**Linux/Mac:**
```bash
ifconfig
# ou
ip addr show
```

### O app nao conecta na API. O que fazer?

1. Verifique se o backend esta rodando (`http://SEU_IP:3000/health`)
2. Confirme se o IP no `api.js` esta correto
3. Celular e PC devem estar na mesma rede WiFi
4. Desative firewalls temporariamente para testar

### Como limpar o cache do Expo?

```bash
cd mobile
expo start -c
```

### Como rodar no emulador Android?

```bash
cd mobile
npm run android
```

Precisa ter Android Studio instalado.

---

## Banco de Dados

### Onde esta o banco de dados?

PostgreSQL armazena dados em:
- **Windows:** `C:\Program Files\PostgreSQL\data`
- **Linux:** `/var/lib/postgresql/data`
- **Mac:** `/usr/local/var/postgres`

### Como fazer backup do banco?

```bash
# Backup
pg_dump -U postgres vereadores_db > backup.sql

# Restore
psql -U postgres vereadores_db < backup.sql
```

### Como ver as migrations aplicadas?

```bash
cd backend
npx prisma migrate status
```

### Erro: "relation does not exist"

As migrations nao foram aplicadas. Execute:

```bash
cd backend
npx prisma migrate deploy
```

### Como mudar a porta do PostgreSQL?

1. Edite `postgresql.conf`
2. Mude `port = 5432` para a porta desejada
3. Reinicie o PostgreSQL
4. Atualize a `DATABASE_URL` no `.env`

---

## Autenticacao

### Como funciona a autenticacao?

1. Usuario faz login com email e senha
2. Backend valida e retorna um token JWT
3. App armazena o token no AsyncStorage
4. Cada requisicao envia o token no header:
   ```
   Authorization: Bearer {token}
   ```

### O token expira?

Sim, apos 2 horas (configuravel em `JWT_EXPIRES_IN`).

### Como aumentar o tempo de expiracao do token?

No `.env`:

```env
JWT_EXPIRES_IN="7d"  # 7 dias
```

Opcoes: `2h`, `1d`, `7d`, `30d`, etc.

### Esqueci a senha. Como resetar?

Atualmente nao ha reset de senha automatico. Opcoes:

**Via Prisma Studio:**
1. `npm run prisma:studio`
2. Abra Users, encontre o usuario
3. Mude a senha para um hash de senha conhecida

**Gerar hash:**
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('nova_senha', 10);
console.log(hash);
```

### Usuario esta "PENDENTE". Como aprovar?

Apenas ADMINs podem aprovar. Use a rota:

```bash
PATCH /api/users/{id}/approve
Authorization: Bearer {token_admin}
```

Ou via Prisma Studio, mude `status` para `ATIVO`.

---

## Ocorrencias

### Quantas fotos posso anexar?

Ate 5 fotos por ocorrencia, cada uma com maximo de 5MB.

### Como deletar uma ocorrencia?

**Vereadores:** Apenas ocorrencias com status PENDENTE

```bash
DELETE /api/ocorrencias/{id}
Authorization: Bearer {token}
```

**Admins:** Podem deletar qualquer ocorrencia.

### Como editar uma ocorrencia?

Atualmente nao ha edicao. Esta no roadmap (v1.1.0).

### Posso ver ocorrencias de outros vereadores?

- **Vereadores:** Nao, apenas as proprias
- **Juridico/Admin:** Sim, veem todas

### Como filtrar ocorrencias?

Use query parameters:

```bash
GET /api/ocorrencias?status=PENDENTE&categoria=INFRAESTRUTURA
```

Parametros:
- `status`: PENDENTE, EM_ANALISE, RESOLVIDO, REJEITADO
- `categoria`: INFRAESTRUTURA, ILUMINACAO, etc.
- `page`: Numero da pagina
- `limit`: Itens por pagina

### Ocorrencias tem paginacao?

Sim! Padrao: 10 itens por pagina.

```bash
GET /api/ocorrencias?page=2&limit=20
```

---

## Upload de Fotos

### Onde as fotos sao armazenadas?

No Cloudinary (servico de hospedagem de imagens na nuvem).

### Cloudinary e gratuito?

Sim! O plano gratis oferece:
- 25 GB de armazenamento
- 25 GB de bandwidth mensal
- Suficiente para milhares de fotos

### Como obter credenciais do Cloudinary?

1. Crie conta em https://cloudinary.com
2. No Dashboard, copie:
   - Cloud Name
   - API Key
   - API Secret
3. Cole no `.env`

### Erro no upload de foto

Verifique:
1. Credenciais do Cloudinary estao corretas
2. Imagem e menor que 5MB
3. Arquivo e realmente uma imagem (jpg, png, etc)

### Posso usar outro servico de imagens?

Sim! Edite `backend/src/services/upload.service.js` para usar AWS S3, Firebase Storage, etc.

---

## Erros Comuns

### "Network request failed"

**Causa:** App nao consegue conectar na API.

**Solucao:**
1. Backend esta rodando?
2. IP no `api.js` esta correto?
3. Celular e PC na mesma rede?
4. Teste a URL no navegador

### "Unauthorized" ou "Token invalido"

**Causa:** Token expirado ou invalido.

**Solucao:**
1. Faca logout e login novamente
2. Limpe o cache do app
3. Verifique se `JWT_SECRET` nao mudou

### "Connection refused"

**Causa:** Backend nao esta rodando.

**Solucao:**
```bash
cd backend
npm run dev
```

### "Cannot find module"

**Causa:** Dependencias nao instaladas.

**Solucao:**
```bash
cd backend  # ou mobile
rm -rf node_modules
npm install
```

### Erro de CORS

**Causa:** Frontend nao esta na lista de origens permitidas.

**Solucao:** Configure `FRONTEND_URL` no `.env`:

```env
FRONTEND_URL="http://localhost:19006"
```

### PostgreSQL nao conecta

**Causa:** Servico nao esta rodando ou senha incorreta.

**Solucao:**
```bash
# Windows
net start postgresql-x64-14

# Linux
sudo systemctl start postgresql

# Mac
brew services start postgresql
```

Verifique a senha em `DATABASE_URL`.

---

## Producao e Deploy

### Como fazer deploy do backend?

Recomendamos [Render.com](https://render.com) (gratuito):

1. Crie conta no Render
2. Conecte repositorio GitHub
3. Crie PostgreSQL Database
4. Crie Web Service
5. Configure variaveis de ambiente
6. Deploy automatico!

Veja detalhes em [backend/README.md](./backend/README.md#deploy).

### Como fazer deploy do mobile?

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Build APK (Android)
eas build -p android --profile preview

# Build AAB (Play Store)
eas build -p android --profile production
```

### Preciso de servidor proprio?

Nao! Use servicos gratuitos:
- **Backend:** Render, Railway, Fly.io
- **Banco:** Render PostgreSQL, Supabase
- **Imagens:** Cloudinary
- **Email:** Gmail SMTP, SendGrid

Custo total: $0-20/mes

### Como configurar HTTPS?

Servicos como Render, Railway e Fly.io fornecem HTTPS automaticamente.

Se usar servidor proprio, use [Let's Encrypt](https://letsencrypt.org/) (gratis).

### Como monitorar o sistema em producao?

Opcoes:
- **Logs:** Render Dashboard, Railway Logs
- **Uptime:** UptimeRobot (gratis)
- **Erros:** Sentry (tem plano gratis)
- **Performance:** New Relic, Datadog

---

## Desenvolvimento

### Como contribuir com o projeto?

Leia [CONTRIBUTING.md](./CONTRIBUTING.md) para diretrizes completas.

### Como rodar testes?

(Testes ainda nao implementados. Planejado para v1.1.0)

### Como adicionar uma nova categoria de ocorrencia?

1. Edite `backend/prisma/schema.prisma`:
   ```prisma
   enum Categoria {
     // ... existentes
     NOVA_CATEGORIA
   }
   ```
2. Crie migration:
   ```bash
   npx prisma migrate dev --name adicionar_nova_categoria
   ```
3. Atualize o mobile para exibir a nova opcao

### Como adicionar um novo tipo de usuario?

Similar a categoria:
1. Edite enum `UserType` no schema
2. Crie migration
3. Atualize middlewares de autorizacao
4. Teste permissoes

---

## Outras Perguntas

### O sistema e open source?

Sim, licenca MIT. Pode usar e modificar livremente.

### Posso usar comercialmente?

Sim, a licenca MIT permite uso comercial.

### Ha planos de adicionar feature X?

Veja [CHANGELOG.md](./CHANGELOG.md) secao "Unreleased" para features planejadas.

Para sugerir features, abra uma issue no GitHub.

### Como reportar bugs?

1. Verifique se ja nao foi reportado
2. Abra uma issue no GitHub
3. Siga o template de bug report
4. Inclua logs e screenshots

Veja [CONTRIBUTING.md](./CONTRIBUTING.md#reportar-bugs).

### Onde encontro a documentacao da API?

Veja [API_REFERENCE.md](./API_REFERENCE.md) para documentacao completa de todos os endpoints.

### O app funciona offline?

Nao atualmente. Modo offline esta planejado para v1.2.0.

### Posso personalizar as cores do app?

Sim! Edite os estilos em cada screen do mobile:

```javascript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#SUA_COR',
  }
});
```

### Como adicionar notificacoes push?

Planejado para v1.1.0 com Firebase Cloud Messaging.

---

## Nao encontrou sua resposta?

1. Consulte a documentacao completa:
   - [README.md](./README.md)
   - [ARQUITETURA.md](./ARQUITETURA.md)
   - [API_REFERENCE.md](./API_REFERENCE.md)

2. Verifique issues existentes no GitHub

3. Abra uma issue com sua pergunta

---

**Ultima atualizacao:** 2025-11-02
