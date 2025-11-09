# Configuração do Super Administrador

Este guia explica como configurar o Super Administrador do sistema, que é o único usuário com permissão para gerenciar outros usuários.

## O que é Super Admin?

O Super Admin é uma conta especial que tem acesso à funcionalidade de **Gerenciar Usuários**, permitindo:

- ✅ Aprovar cadastros pendentes
- ✅ Desativar usuários
- ✅ Reativar usuários
- ✅ Visualizar estatísticas de usuários
- ✅ Gerenciar todos os tipos de usuários (ADMIN, VEREADOR, JURIDICO)

**IMPORTANTE:** Apenas você (o dono do sistema) terá essa permissão. Outros admins **NÃO** terão acesso a essas funcionalidades.

## Passo 1: Preparar o Backend

### 1.1 - Parar o backend (se estiver rodando)

```bash
# Feche o terminal do backend ou pressione Ctrl+C
```

### 1.2 - Gerar o Prisma Client atualizado

```bash
cd backend
npx prisma generate
```

Se der erro de arquivo em uso, reinicie o computador ou feche todos os processos Node.js:

```bash
# Windows
taskkill /F /IM node.exe

# Depois execute novamente
npx prisma generate
```

### 1.3 - Reiniciar o backend

```bash
npm run dev
```

## Passo 2: Configurar Sua Conta como Super Admin

### Opção A: Usando o script automático (Recomendado)

1. Abra o arquivo `backend/set-super-admin.js`

2. Verifique se o email está correto (deve ser o seu):
   ```javascript
   const SUPER_ADMIN_EMAIL = 'krisalexandre2018@gmail.com'; // SEU EMAIL AQUI
   ```

3. Execute o script:
   ```bash
   cd backend
   node set-super-admin.js
   ```

4. Você verá a mensagem de sucesso:
   ```
   ✅ Super Admin configurado com sucesso!
   Nome: Seu Nome
   Email: seuemail@gmail.com
   Tipo: ADMIN
   Status: ATIVO
   Super Admin: true
   ```

### Opção B: Manualmente via SQL

Se preferir fazer manualmente:

```bash
cd backend
npx prisma studio
```

1. Acesse `http://localhost:5555`
2. Clique na tabela `User`
3. Encontre seu usuário
4. Marque o campo `isSuperAdmin` como `true`
5. Marque o campo `status` como `ATIVO`
6. Marque o campo `tipo` como `ADMIN`
7. Clique em "Save 1 change"

## Passo 3: Testar no App Mobile

1. **Faça logout** do app (se já estiver logado)

2. **Faça login novamente** com suas credenciais:
   - Email: o email que você configurou como super admin
   - Senha: sua senha

3. **Acesse o Perfil:**
   - Toque na aba "Perfil" no menu inferior
   - Você deve ver uma nova seção chamada **"Administração"**
   - Com o botão **"Gerenciar Usuários"**

4. **Teste a funcionalidade:**
   - Toque em "Gerenciar Usuários"
   - Você verá as estatísticas de usuários
   - Poderá filtrar por: PENDENTE, ATIVO, INATIVO, TODOS
   - Poderá aprovar, desativar ou reativar usuários

## Segurança

⚠️ **IMPORTANTE:**

1. **Apenas uma conta deve ser Super Admin** - Esta é SUA conta pessoal
2. **Nunca compartilhe** as credenciais do super admin
3. **Faça backup** regular do banco de dados
4. **Guarde bem** a senha desta conta

## Fluxo de Aprovação de Novos Usuários

1. Usuário se cadastra no app → Status: `PENDENTE`
2. Você (Super Admin) recebe a solicitação
3. Acessa "Gerenciar Usuários" → Filtro "PENDENTE"
4. Revisa os dados do usuário
5. Clica em "Aprovar" → Status muda para `ATIVO`
6. Usuário recebe notificação e pode fazer login

## Cobrar por Manutenção

Como você mencionou que quer cobrar por manutenção, este sistema está configurado para que:

- ✅ **Apenas você** (Super Admin) pode aprovar usuários
- ✅ **Outros admins** não têm acesso ao gerenciamento de usuários
- ✅ **Você controla** quem entra no sistema
- ✅ **Você pode cobrar** pela manutenção do sistema e aprovação de contas

## Solução de Problemas

### Botão "Gerenciar Usuários" não aparece

1. Verifique se você fez logout e login novamente
2. Verifique se `isSuperAdmin` está como `true` no banco
3. Verifique se o backend está rodando com a versão atualizada

### Erro "Acesso negado. Apenas super administrador"

1. Faça logout e login novamente
2. Verifique no banco se `isSuperAdmin = true`
3. Reinicie o backend

### Migration/Prisma Client com erro

```bash
# Parar TODOS os processos Node
taskkill /F /IM node.exe

# Gerar novamente
cd backend
npx prisma generate

# Reiniciar backend
npm run dev
```

## Arquivos Modificados

Esta funcionalidade adicionou/modificou:

**Backend:**
- `prisma/schema.prisma` - Campo `isSuperAdmin` no model User
- `src/middleware/auth.middleware.js` - Middleware `isSuperAdmin`
- `src/routes/user.routes.js` - Proteção com `isSuperAdmin`
- `src/controllers/auth.controller.js` - Retornar `isSuperAdmin` no /me
- `set-super-admin.js` - Script para configurar super admin

**Mobile:**
- `src/services/api.js` - Service `userService`
- `src/screens/admin/GerenciarUsuariosScreen.js` - Tela de gerenciamento
- `src/screens/profile/ProfileScreen.js` - Botão de acesso (apenas para super admin)
- `src/navigation/AppNavigator.js` - Rota para tela de gerenciamento

## Suporte

Se tiver problemas, verifique:

1. Backend está rodando?
2. Você fez logout e login novamente?
3. O campo `isSuperAdmin` está `true` no banco?
4. O Prisma Client foi gerado corretamente?

---

**Data de criação:** 04/11/2025
**Versão do sistema:** 1.0.0
