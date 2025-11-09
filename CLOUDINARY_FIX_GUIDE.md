# 🔧 Guia de Correção do Cloudinary - "Invalid Signature"

**Data:** 06/11/2024
**Problema:** Erro "Invalid Signature 81cc1829aeae3f229269ed6e2adab58ff1880b0f" ao fazer upload de fotos

---

## 📊 Diagnóstico Realizado

### ✅ Status Atual da Configuração

```
CLOUDINARY_CLOUD_NAME: doalug1yw ✅ (CORRETO)
CLOUDINARY_API_KEY: 533288437919467 ✅ (FORMATO OK)
CLOUDINARY_API_SECRET: YIZkM... (27 caracteres) ❌ (INCORRETO)
```

### 🔍 Resultado do Teste

```bash
node test-cloudinary.js
```

**Resultado:** ❌ FALHA - `api_secret mismatch`

**Causa Raiz:** O `CLOUDINARY_API_SECRET` no arquivo `.env` está **INCORRETO**. O valor atual não corresponde ao API Secret real da sua conta Cloudinary.

---

## 🛠️ Solução (Passo a Passo)

### Passo 1: Obter as Credenciais Corretas

1. Acesse o Cloudinary Dashboard:
   ```
   https://cloudinary.com/console
   ```

2. Faça login na sua conta

3. Na página inicial (Dashboard), você verá um painel chamado **"Account Details"** ou **"Product Environment Credentials"**

4. Copie as 3 credenciais **EXATAS** (uma por vez):
   - **Cloud name:** `doalug1yw` (já está correto)
   - **API Key:** Copie o número completo
   - **API Secret:** Clique em **"Reveal API Secret"** ou no ícone de olho, depois copie

   ⚠️ **IMPORTANTE:**
   - NÃO copie espaços antes ou depois
   - NÃO adicione aspas
   - Copie EXATAMENTE como aparece no dashboard

---

### Passo 2: Atualizar o Arquivo `.env`

1. Abra o arquivo:
   ```
   E:\Todos os projetos\Prefeitura App\backend\.env
   ```

2. Localize as linhas 20-22:
   ```env
   CLOUDINARY_CLOUD_NAME=doalug1yw
   CLOUDINARY_API_KEY=533288437919467
   CLOUDINARY_API_SECRET=YIZkM38W0PamVsNKEWpC6EcLhAE
   ```

3. Substitua **APENAS** as credenciais pelos valores copiados do dashboard:
   ```env
   CLOUDINARY_CLOUD_NAME=seu_cloud_name_do_dashboard
   CLOUDINARY_API_KEY=sua_api_key_do_dashboard
   CLOUDINARY_API_SECRET=seu_api_secret_do_dashboard
   ```

4. **ATENÇÃO ao formato:**
   - ✅ CORRETO: `CLOUDINARY_API_SECRET=abc123xyz456`
   - ❌ ERRADO: `CLOUDINARY_API_SECRET="abc123xyz456"`
   - ❌ ERRADO: `CLOUDINARY_API_SECRET= abc123xyz456`
   - ❌ ERRADO: `CLOUDINARY_API_SECRET=abc123xyz456 `

5. Salve o arquivo (Ctrl+S)

---

### Passo 3: Reiniciar o Backend

**CRÍTICO:** Nodemon NÃO recarrega variáveis de ambiente do `.env` automaticamente!

1. Vá ao terminal onde o backend está rodando

2. Pare o servidor:
   ```
   Pressione: Ctrl+C
   ```

3. Inicie novamente:
   ```bash
   cd "E:\Todos os projetos\Prefeitura App\backend"
   npm run dev
   ```

4. Aguarde a mensagem:
   ```
   ╔════════════════════════════════════════════╗
   ║  Servidor rodando na porta 3000            ║
   ╚════════════════════════════════════════════╝
   ```

---

### Passo 4: Validar a Correção

Execute o script de teste:

```bash
cd "E:\Todos os projetos\Prefeitura App\backend"
node test-cloudinary.js
```

**Resultado Esperado:**
```
========================================
  TESTE DE CREDENCIAIS CLOUDINARY
========================================

1. Verificando variáveis de ambiente (.env):

   CLOUDINARY_CLOUD_NAME: doalug1yw
   CLOUDINARY_API_KEY: 533288437919467
   CLOUDINARY_API_SECRET: Abc12... (XX caracteres)

2. Verificando formatação (espaços/aspas indesejados):

   Cloud Name: ✅ OK
   API Key: ✅ OK
   API Secret: ✅ OK

3. Configurando Cloudinary SDK:

   ✅ SDK configurado

4. Testando conexão com Cloudinary (API ping):

   ✅ SUCESSO! Credenciais estão corretas!
   Recursos encontrados: X

========================================
  RESULTADO: ✅ CLOUDINARY CONFIGURADO
========================================
```

---

### Passo 5: Testar Upload no App

1. Abra o app mobile (se não estiver rodando):
   ```bash
   cd "E:\Todos os projetos\Prefeitura App\mobile"
   npm start
   ```

2. Faça login como vereador:
   - Email: `vereador@teste.com`
   - Senha: `123456`

3. Crie uma nova ocorrência:
   - Título: "Teste Upload Cloudinary"
   - Descrição: "Validando correção das credenciais"
   - Categoria: INFRAESTRUTURA
   - Prioridade: ALTA
   - Adicione 1-2 fotos (câmera ou galeria)
   - Endereço: Digite manualmente (ex: "Rua Teste, 123")

4. Clique em "Criar Ocorrência"

5. **Resultado Esperado:**
   - ✅ Mensagem de sucesso
   - ✅ Ocorrência aparece na lista
   - ✅ Ao abrir a ocorrência, as fotos carregam

6. **Verificar no Cloudinary:**
   - Acesse: https://cloudinary.com/console/media_library
   - Pasta: `ocorrencias`
   - Deve ter as imagens recém-enviadas

---

## 🐛 Troubleshooting

### Se ainda der erro "Invalid Signature":

1. **Verifique se copiou o API Secret completo:**
   - No Cloudinary Dashboard, clique em "Reveal API Secret"
   - Copie TODO o texto que aparecer
   - Alguns API Secrets têm mais de 40 caracteres

2. **Verifique se não tem espaços invisíveis:**
   - No `.env`, delete a linha inteira do `CLOUDINARY_API_SECRET`
   - Digite novamente: `CLOUDINARY_API_SECRET=`
   - Cole o valor (Ctrl+V)
   - NÃO pressione espaço antes ou depois

3. **Verifique se o backend realmente reiniciou:**
   ```bash
   # Execute este comando para ver as variáveis carregadas:
   cd "E:\Todos os projetos\Prefeitura App\backend"
   node -e "require('dotenv').config(); console.log('Cloud:', process.env.CLOUDINARY_CLOUD_NAME); console.log('Key:', process.env.CLOUDINARY_API_KEY); console.log('Secret:', process.env.CLOUDINARY_API_SECRET.substring(0,5) + '...');"
   ```

   Compare os valores com o que está no `.env`

4. **Verifique se está usando a conta correta:**
   - Cloudinary permite múltiplas contas
   - Confirme que o Cloud Name `doalug1yw` é da conta que você está logado
   - No dashboard, o Cloud Name aparece no topo da página

### Se der erro "Resource not found" ou "401 Unauthorized":

1. A conta pode estar suspensa ou com limite excedido
2. Acesse https://cloudinary.com/console e verifique o status da conta
3. Plano gratuito tem limite de 25GB/mês

### Se der erro de rede:

1. Verifique sua conexão com internet
2. Cloudinary pode estar bloqueado pelo firewall/antivírus
3. Tente desabilitar temporariamente para testar

---

## 📁 Arquivos Relacionados

### Arquivo de Configuração:
```
E:\Todos os projetos\Prefeitura App\backend\.env
```

### Código do Upload:
```
E:\Todos os projetos\Prefeitura App\backend\src\services\upload.service.js
```

### Script de Teste:
```
E:\Todos os projetos\Prefeitura App\backend\test-cloudinary.js
```

### Controller de Ocorrências:
```
E:\Todos os projetos\Prefeitura App\backend\src\controllers\ocorrencia.controller.js
```

---

## 🔐 Formato Correto do `.env`

```env
# ============================================
# CLOUDINARY (Upload de Imagens)
# ============================================
CLOUDINARY_CLOUD_NAME=doalug1yw
CLOUDINARY_API_KEY=533288437919467
CLOUDINARY_API_SECRET=<copiar_do_dashboard_sem_aspas>
CLOUDINARY_FOLDER=vereadores-ocorrencias
```

**Características do API Secret válido:**
- Geralmente tem entre 20-50 caracteres
- Contém letras maiúsculas e minúsculas
- Contém números
- Pode conter alguns símbolos especiais (- ou _)
- NÃO tem espaços

**Exemplo de formato válido (NÃO USE ESTE VALOR, é apenas exemplo):**
```env
CLOUDINARY_API_SECRET=AbC123xYz456PqR789sT0uvWxYz
```

---

## 📞 Próximos Passos Após Correção

Depois que o Cloudinary estiver funcionando:

1. ✅ Marcar tarefa #1 de TAREFAS_06-11-2024.md como concluída
2. ✅ Prosseguir para tarefa #2: Testar criação de ocorrência com fotos
3. ✅ Continuar com tarefa #3: Criar usuário JURIDICO
4. ✅ Validar fluxo completo de mudança de status

---

## 💡 Comandos Úteis

### Testar credenciais:
```bash
cd "E:\Todos os projetos\Prefeitura App\backend"
node test-cloudinary.js
```

### Ver variáveis carregadas:
```bash
cd "E:\Todos os projetos\Prefeitura App\backend"
node -e "require('dotenv').config(); console.log('Cloud:', process.env.CLOUDINARY_CLOUD_NAME); console.log('Key:', process.env.CLOUDINARY_API_KEY); console.log('Secret:', process.env.CLOUDINARY_API_SECRET.substring(0,5) + '...');"
```

### Reiniciar backend:
```bash
# No terminal do backend: Ctrl+C, depois:
cd "E:\Todos os projetos\Prefeitura App\backend"
npm run dev
```

### Ver logs do backend em tempo real:
```bash
# Os logs aparecem automaticamente no terminal onde o backend está rodando
# Procure por mensagens de erro relacionadas a Cloudinary
```

---

## 📊 Checklist de Validação

Após seguir todos os passos, confirme:

- [ ] Executei `node test-cloudinary.js` e vi ✅ SUCESSO
- [ ] Reiniciei o backend após alterar `.env`
- [ ] Consegui criar uma ocorrência com fotos no app
- [ ] As fotos aparecem na tela de detalhes da ocorrência
- [ ] As imagens aparecem no Cloudinary Dashboard (Media Library)
- [ ] Não há erros no terminal do backend relacionados a upload

---

**Criado em:** 06/11/2024
**Script de teste:** `backend/test-cloudinary.js`
**Status:** Aguardando usuário copiar credenciais corretas do Cloudinary Dashboard
