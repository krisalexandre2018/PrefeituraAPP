# 📺 Tutorial Passo a Passo - Criar Repositório no GitHub

Este tutorial vai te guiar **passo a passo** para criar o repositório no GitHub e fazer o upload do código.

---

## ⏱️ Tempo Total: ~5 minutos

---

## 🎯 PASSO 1: Acessar o GitHub

1. **Abra seu navegador** (Chrome, Edge, Firefox, etc)

2. **Digite na barra de endereços:**
   ```
   https://github.com/login
   ```

3. **Faça login** com seu usuário e senha do GitHub
   - Se não tiver conta, clique em "Sign up" e crie uma (é grátis!)

---

## 🎯 PASSO 2: Criar Novo Repositório

### 2.1 Acessar página de criação

Depois de fazer login, acesse:
```
https://github.com/new
```

**OU** clique no **"+"** no canto superior direito → **"New repository"**

### 2.2 Preencher o Formulário

Você vai ver uma página com vários campos. Preencha assim:

#### **Repository name** (obrigatório)
```
sistema-ocorrencias-vereadores
```
> ⚠️ Não pode ter espaços! Use hífens (-) ou underscores (_)

#### **Description** (opcional, mas recomendado)
```
Sistema de registro de ocorrências urbanas para vereadores com app mobile React Native e API Node.js
```

#### **Visibilidade**

Escolha uma opção:

**🔓 Public** (Público)
- Qualquer pessoa pode ver o código
- Bom para projetos open-source ou portfolio
- ✅ Escolha se pode ser público

**🔒 Private** (Privado)
- Só você e pessoas que você convidar podem ver
- Bom para projetos confidenciais
- ✅ Escolha se tem dados da prefeitura ou informações sensíveis

#### **NÃO marque nenhuma das opções abaixo:**
- [ ] Add a README file
- [ ] Add .gitignore
- [ ] Choose a license

> ⚠️ **IMPORTANTE:** Já temos esses arquivos no projeto! Se marcar, vai dar conflito.

### 2.3 Criar o Repositório

Clique no botão verde **"Create repository"** no final da página.

---

## 🎯 PASSO 3: Copiar URL do Repositório

Após criar, você vai ver uma página com comandos.

### 3.1 Identificar o URL

No topo da página, você vai ver uma caixa com um endereço parecido com:

```
https://github.com/SEU_USUARIO/sistema-ocorrencias-vereadores.git
```

### 3.2 Copiar o URL

1. **Certifique-se** que está selecionado **HTTPS** (não SSH)
2. **Clique no botão** de copiar (ícone de dois quadradinhos) ao lado do URL
3. **O URL foi copiado!** Guarde ele - vamos usar no próximo passo

**Exemplo de URLs:**
```
https://github.com/joaosilva/sistema-ocorrencias-vereadores.git
https://github.com/prefeitura-xpto/sistema-ocorrencias-vereadores.git
```

> 📝 **Nota:** Substitua `SEU_USUARIO` pelo seu usuário real do GitHub

---

## 🎯 PASSO 4: Conectar o Projeto Local ao GitHub

Agora vamos conectar o repositório local (seu computador) ao repositório remoto (GitHub).

### 4.1 Abrir o Terminal

**Você já está com o Claude Code aberto**, então vou executar os comandos para você!

### 4.2 Cole o URL Aqui

**Me envie o URL que você copiou** no chat. Ele vai estar assim:
```
https://github.com/SEU_USUARIO/sistema-ocorrencias-vereadores.git
```

Assim que você me enviar, eu vou:
1. ✅ Adicionar o repositório remoto
2. ✅ Renomear a branch para `main`
3. ✅ Fazer o push do código
4. ✅ Verificar se deu tudo certo

---

## 🎯 PASSO 5: Aguardar o Upload

Quando eu executar o comando `git push`, vai acontecer:

1. **Git vai pedir suas credenciais** do GitHub
   - **Usuário:** Seu username do GitHub
   - **Senha:** ⚠️ **NÃO é sua senha normal!** É um **Personal Access Token**

### Como criar um Personal Access Token?

#### Se você nunca criou um token:

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Preencha:
   - **Note:** `Claude Code Upload`
   - **Expiration:** 90 days (ou No expiration se preferir)
   - **Marque:** `repo` (todas as opções de repositório)
4. Clique em **"Generate token"** no final
5. **COPIE O TOKEN AGORA!** Ele só aparece uma vez
6. **Guarde** em um lugar seguro (bloco de notas, gerenciador de senhas)

#### Quando o Git pedir credenciais:

```
Username: seu_usuario_github
Password: cole_seu_token_aqui (não vai aparecer nada ao digitar - normal!)
```

### Ou use GitHub Desktop (mais fácil!)

Se não quiser lidar com tokens, você pode:

1. **Baixar GitHub Desktop:** https://desktop.github.com/
2. **Fazer login** nele (faz automaticamente)
3. **Arrastar a pasta** do projeto para o GitHub Desktop
4. **Clicar em "Publish repository"**

---

## 🎯 PASSO 6: Verificar no GitHub

Depois que o upload terminar:

1. **Acesse** o endereço do seu repositório no navegador:
   ```
   https://github.com/SEU_USUARIO/sistema-ocorrencias-vereadores
   ```

2. **Você deve ver:**
   - ✅ 175 arquivos
   - ✅ README.md sendo exibido
   - ✅ Pastas: backend/, mobile/, docs/
   - ✅ Commit: "Primeiro commit: Sistema de Ocorrências Urbanas"

3. **Confirme que NÃO aparecem:**
   - ❌ Pasta `.claude/`
   - ❌ Pasta `agents/`
   - ❌ Arquivo `m.txt`
   - ❌ Arquivos `.env` (só `.env.example`)

---

## ✅ Tudo Certo!

Se você vê todos os arquivos no GitHub, **missão cumprida!** 🎉

Seu código está:
- ✅ Versionado no Git
- ✅ Backup no GitHub
- ✅ Pronto para colaboração
- ✅ Sem arquivos do Claude Code
- ✅ Sem dados sensíveis

---

## 🆘 Problemas Comuns

### ❌ "Authentication failed"

**Causa:** Senha errada ou token inválido

**Solução:**
1. Use um Personal Access Token (não sua senha normal)
2. Siga o tutorial acima para criar um token
3. Ou use GitHub Desktop

### ❌ "Permission denied"

**Causa:** Sem permissão para esse repositório

**Solução:**
1. Verifique se está logado com o usuário correto
2. Verifique se o repositório existe
3. Crie o repositório novamente se necessário

### ❌ "Repository not found"

**Causa:** URL do repositório errado

**Solução:**
1. Verifique se copiou o URL completo
2. URL deve terminar com `.git`
3. Deve começar com `https://github.com/`

### ❌ "Failed to push some refs"

**Causa:** Tem arquivos no GitHub que não estão no local

**Solução:**
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 📞 Precisa de Ajuda?

Se algo der errado, **me envie:**

1. A mensagem de erro completa
2. O que você estava fazendo quando o erro ocorreu
3. O URL do repositório

E eu vou te ajudar a resolver! 💪

---

## 🎓 Próximos Passos

Depois de subir no GitHub, você pode:

1. ✅ **Convidar colaboradores** (Settings → Collaborators)
2. ✅ **Proteger a branch main** (Settings → Branches → Branch protection rules)
3. ✅ **Criar um README melhor** com screenshots
4. ✅ **Adicionar badges** (build status, license, etc)
5. ✅ **Configurar GitHub Actions** para CI/CD

---

## 📚 Recursos Úteis

- **GitHub Docs:** https://docs.github.com/
- **GitHub Desktop:** https://desktop.github.com/
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf
- **Markdown Guide:** https://guides.github.com/features/mastering-markdown/

---

**Está tudo pronto para você seguir!** 🚀

Assim que criar o repositório e copiar o URL, **me envie aqui no chat** e eu faço o resto automaticamente!
