# Próximos Passos - Build de Produção Android

Este documento resume os próximos passos para gerar o APK de produção do Vereadores App.

---

## Preparação Concluída ✓

Os seguintes arquivos foram criados/atualizados:

1. **app.json** - Configurado com versionCode e configurações EAS
2. **eas.json** - Perfis de build criados (development, preview, production)
3. **BUILD_GUIDE.md** - Guia completo passo-a-passo
4. **PRE_BUILD_CHECKLIST.md** - Checklist detalhado pré-build
5. **API_CONFIG.md** - Instruções de configuração da URL da API
6. **.env.example** - Exemplo de variáveis de ambiente

---

## Ações Necessárias ANTES do Build

### 1. Configurar URL da API de Produção

**OBRIGATÓRIO:** Edite o arquivo `src/services/api.js`

```javascript
// Linha 5 do arquivo
const API_URL = 'https://api.vereadores.exemplo.com/api';
```

Substitua pela URL REAL do seu servidor de produção.

**IMPORTANTE:**
- SEMPRE use HTTPS em produção (não HTTP)
- Certifique-se que o servidor está acessível por essa URL
- Teste a URL no navegador ou com curl antes de fazer o build

### 2. Instalar EAS CLI

Se ainda não instalou:

```bash
npm install -g eas-cli
```

### 3. Criar Conta Expo

Se ainda não tem:
1. Acesse https://expo.dev/signup
2. Crie uma conta gratuita
3. Verifique seu email

### 4. Fazer Login no EAS

```bash
cd "E:\Todos os projetos\Prefeitura App\mobile"
eas login
```

Digite email e senha da sua conta Expo.

---

## Primeiro Build - Configuração Inicial

### Execute APENAS UMA VEZ (primeira vez):

```bash
eas init
```

Este comando irá:
- Criar um Project ID único
- Atualizar automaticamente o campo `extra.eas.projectId` em `app.json`
- Vincular o projeto à sua conta Expo

**Após executar:** Faça commit do `app.json` atualizado.

---

## Build de Produção

### Checklist Rápido

Antes de executar o build, verifique:

- [ ] URL da API configurada em `src/services/api.js`
- [ ] Backend está rodando e acessível
- [ ] Versão atualizada em `app.json` (se não for primeira versão)
- [ ] EAS CLI instalado e login feito
- [ ] `eas init` executado (apenas primeira vez)

### Comando de Build

```bash
eas build --platform android --profile production
```

### Tempo Estimado

- Primeiro build: 15-25 minutos
- Builds subsequentes: 10-15 minutos

### Durante o Build

Você verá uma URL como:
```
https://expo.dev/accounts/SEU_USERNAME/projects/vereadores-app/builds/BUILD_ID
```

Pode:
- Aguardar no terminal
- Abrir a URL no navegador para acompanhar visualmente
- Fechar o terminal (build continua na nuvem)

---

## Após o Build

### 1. Download do APK

Quando o build terminar:

**Opção A:** Link será exibido no terminal
**Opção B:** Acesse o Expo dashboard e baixe
**Opção C:** Use `eas build:list` para ver lista de builds

### 2. Testar APK

1. Transferir APK para dispositivo Android
2. Instalar (pode precisar permitir "fontes desconhecidas")
3. Testar todas as funcionalidades principais:
   - Login
   - Criar ocorrência
   - Upload de fotos
   - GPS
   - Notificações

### 3. Distribuir

**Para Testes:**
- Enviar APK via WhatsApp, email, Drive, etc.

**Para Produção:**
- Publicar na Google Play Store (requer conta de desenvolvedor - $25)

---

## Comandos Úteis

### Ver lista de builds
```bash
eas build:list
```

### Ver detalhes de um build
```bash
eas build:view BUILD_ID
```

### Build de preview (para testes internos)
```bash
eas build --platform android --profile preview
```

---

## Versionamento (Builds Futuros)

Para builds futuros, atualizar em `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",      // Incrementar
    "android": {
      "versionCode": 2       // Sempre aumentar (inteiro)
    }
  }
}
```

**Regras:**
- `version`: Semântico (1.0.0 → 1.0.1 para bug fix, 1.1.0 para feature, 2.0.0 para breaking change)
- `versionCode`: Sempre aumentar, nunca diminuir ou repetir

---

## Troubleshooting Rápido

### "Not logged in"
```bash
eas login
```

### "Project not configured"
```bash
eas init
```

### Build falhou
1. Verificar erros no log
2. Corrigir código
3. Executar `npm install` novamente
4. Fazer novo build

### APK não instala
- Verificar versão Android do dispositivo (mínimo 5.0)
- Permitir instalação de fontes desconhecidas
- Verificar espaço disponível

---

## Documentação Completa

Para instruções detalhadas, consulte:

- **BUILD_GUIDE.md** - Guia completo de build (LEIA ISSO PRIMEIRO)
- **PRE_BUILD_CHECKLIST.md** - Checklist detalhado pré-build
- **API_CONFIG.md** - Configuração da URL da API
- **Expo Docs**: https://docs.expo.dev/build/introduction/

---

## Resumo Visual

```
┌─────────────────────────────────────────────────┐
│ 1. Configurar API URL (src/services/api.js)    │
│ 2. Instalar EAS CLI (npm install -g eas-cli)   │
│ 3. Login Expo (eas login)                      │
│ 4. Init EAS (eas init) - APENAS 1ª VEZ         │
│ 5. Build (eas build --platform android)        │
│ 6. Aguardar 15-25 min                          │
│ 7. Download APK                                 │
│ 8. Testar em dispositivo                        │
│ 9. Distribuir                                   │
└─────────────────────────────────────────────────┘
```

---

## Suporte

Em caso de dúvidas:
- Consulte BUILD_GUIDE.md
- Documentação Expo: https://docs.expo.dev/
- Fórum Expo: https://forums.expo.dev/
- Discord Expo: https://discord.gg/expo

---

**BOA SORTE COM O BUILD!** 🚀
