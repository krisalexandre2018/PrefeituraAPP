# Guia de Teste do App Mobile

## 📱 Status da Configuração

✅ **API em Produção:** https://vereadores-api.onrender.com/api
✅ **App configurado para produção**
✅ **Super Admin criado**

---

## 🔐 Credenciais de Teste

### Super Admin
- **Email:** kris.alexandre2018@gmail.com
- **Senha:** admin123
- **CPF:** 00000971409
- **Tipo:** ADMIN

---

## 📋 Checklist de Testes

### 1. Teste de Autenticação

#### Login
- [ ] Abrir o app
- [ ] Verificar se aparece a tela de Login
- [ ] Inserir email: `kris.alexandre2018@gmail.com`
- [ ] Inserir senha: `admin123`
- [ ] Clicar em "Entrar"
- [ ] Verificar se faz login com sucesso
- [ ] Verificar mensagem de boas-vindas ou redirecionamento

#### Perfil
- [ ] Ir para a tela de Perfil
- [ ] Verificar se mostra dados do admin:
  - Nome: Administrador
  - Email: kris.alexandre2018@gmail.com
  - CPF: 00000971409
  - Tipo: ADMIN

### 2. Teste de Permissões (ADMIN)

#### Funcionalidades de Admin
- [ ] Verificar se tem acesso a área administrativa
- [ ] Listar usuários pendentes de aprovação
- [ ] Ver relatórios e estatísticas
- [ ] Gerenciar usuários

### 3. Teste de Ocorrências

Como admin, você deve poder:
- [ ] Listar todas as ocorrências (de todos os vereadores)
- [ ] Ver detalhes de qualquer ocorrência
- [ ] Filtrar ocorrências por status/categoria
- [ ] Ver estatísticas gerais

### 4. Teste de Notificações

- [ ] Acessar tela de notificações
- [ ] Verificar se há notificações
- [ ] Marcar notificações como lidas
- [ ] Ver contador de notificações não lidas

### 5. Teste de Conexão com API

Verificar no console do Expo se aparece:
```
📡 API conectada em: https://vereadores-api.onrender.com/api (production)
```

---

## 🐛 Problemas Comuns

### "Network request failed"
- Verificar se o backend está rodando: https://vereadores-api.onrender.com/health
- Verificar conexão com internet
- Verificar se o Render não está em "sleep mode" (primeira requisição pode demorar)

### "401 Unauthorized" após login
- Token JWT pode ter expirado
- Fazer logout e login novamente
- Verificar se JWT_SECRET no Render está correto

### "Email ou senha incorretos"
- Verificar credenciais:
  - Email: kris.alexandre2018@gmail.com
  - Senha: admin123 (exatamente assim, minúsculo)

### App não carrega dados
- Backend pode estar "dormindo" (Render free tier)
- Aguardar 30-60 segundos e tentar novamente
- Verificar logs no Render Dashboard

---

## 🔄 Alternar entre Desenvolvimento e Produção

Editar `mobile/src/services/api.js`:

### Para usar API em Produção (Render):
```javascript
const ENVIRONMENT = 'production';
```

### Para usar API Local:
```javascript
const ENVIRONMENT = 'development';
```

**Depois de alterar:** Recarregar o app (shake device → Reload)

---

## 📊 Monitoramento

### Verificar Logs do Backend (Render)
1. Acessar: https://dashboard.render.com
2. Clicar no serviço "vereadores-api"
3. Ir na aba "Logs"
4. Monitorar requisições em tempo real

### Verificar Console do Expo
No terminal onde rodou `npm start`, verificar:
- Requisições HTTP
- Erros de rede
- Mensagens de debug

---

## ✅ Próximos Passos Após Teste

Se tudo funcionar:
1. [ ] Mudar senha do admin no app
2. [ ] Criar outros usuários de teste (vereador, jurídico)
3. [ ] Testar fluxo completo de criação de ocorrência
4. [ ] Testar upload de fotos
5. [ ] Testar GPS/localização
6. [ ] Configurar variáveis de email no Render (para receber notificações)

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:
1. Verificar logs do Expo (terminal)
2. Verificar logs do Render (dashboard)
3. Testar endpoint diretamente: https://vereadores-api.onrender.com/health
4. Pedir ajuda aos agentes BuildMaster ou CodeAssistantOptimizer
