# Guia de Build - Vereadores App (Android)

Este guia fornece instruções passo-a-passo para gerar um APK de produção do aplicativo Vereadores usando Expo Application Services (EAS).

## Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Inicial](#configuração-inicial)
3. [Preparação para Build](#preparação-para-build)
4. [Processo de Build](#processo-de-build)
5. [Download e Distribuição](#download-e-distribuição)
6. [Atualização de Versão](#atualização-de-versão)
7. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

### Software Necessário
- Node.js 18+ instalado
- npm ou yarn
- Conta Expo (gratuita) - https://expo.dev/signup
- Git (para controle de versão)

### Conhecimento Necessário
- Linha de comando básica
- Conceitos de versionamento de apps

### Verificar Instalações
```bash
node --version    # Deve mostrar v18.x ou superior
npm --version     # Deve mostrar 9.x ou superior
```

---

## Configuração Inicial

### 1. Instalar EAS CLI Globalmente
```bash
npm install -g eas-cli
```

Verificar instalação:
```bash
eas --version
```

### 2. Login na Conta Expo
```bash
eas login
```

Digite suas credenciais da conta Expo (email e senha).

### 3. Configurar Projeto EAS (PRIMEIRA VEZ APENAS)
```bash
cd "E:\Todos os projetos\Prefeitura App\mobile"
eas init
```

Este comando irá:
- Criar um Project ID único para o app
- Atualizar `app.json` com o `projectId`
- Vincular o projeto à sua conta Expo

**IMPORTANTE:** Após `eas init`, o campo `extra.eas.projectId` em `app.json` será preenchido automaticamente. Faça commit desta alteração.

---

## Preparação para Build

### Checklist Pré-Build (OBRIGATÓRIO)

Antes de iniciar o build, siga este checklist:

1. **Configurar URL da API de Produção**
   - Editar `src/services/api.js`
   - Atualizar `API_URL` para o endereço do servidor de produção
   - Exemplo: `const API_URL = 'https://api.vereadores.exemplo.com/api';`
   - Ver `API_CONFIG.md` para detalhes

2. **Atualizar Versão do App**
   - Editar `app.json`
   - Incrementar `version` (exemplo: "1.0.0" → "1.0.1")
   - Incrementar `android.versionCode` (exemplo: 1 → 2)
   - Ver seção [Atualização de Versão](#atualização-de-versão) para detalhes

3. **Verificar Backend**
   - Servidor de produção está rodando
   - API está acessível pela URL configurada
   - CORS configurado para aceitar requisições do app
   - Certificado SSL válido (se usando HTTPS)

4. **Testar Localmente**
   - Todas as funcionalidades estão funcionando
   - Câmera e GPS testados
   - Login e autenticação funcionando
   - Upload de fotos funcionando

5. **Commit de Mudanças**
   ```bash
   git add .
   git commit -m "Preparar para build v1.0.0"
   ```

---

## Processo de Build

### Build de Produção (APK)

Execute o comando de build:

```bash
eas build --platform android --profile production
```

### O que acontece durante o build:

1. **Upload do código**: EAS faz upload do seu código-fonte
2. **Instalação de dependências**: npm install é executado na nuvem
3. **Build nativo**: Código React Native é compilado para APK
4. **Assinatura**: APK é assinado automaticamente pelo EAS
5. **Disponibilização**: APK fica disponível para download

### Tempo estimado:
- Primeiro build: 15-25 minutos
- Builds subsequentes: 10-15 minutos (com cache)

### Acompanhar Progresso:

Durante o build, você verá:
```
✔ Build details:
  https://expo.dev/accounts/SEU_USERNAME/projects/vereadores-app/builds/BUILD_ID

Waiting for build to complete. You can press Ctrl+C to exit.
```

Você pode:
- Aguardar no terminal (recomendado)
- Abrir o link no navegador para acompanhar visualmente
- Fechar o terminal (build continua na nuvem)

---

## Download e Distribuição

### 1. Download do APK

Quando o build terminar:

**Opção A: Via Terminal**
```bash
# O link de download será exibido no terminal
# Exemplo: https://expo.dev/artifacts/eas/BUILD_ID.apk
```

**Opção B: Via Dashboard Expo**
1. Acesse: https://expo.dev/accounts/[SEU_USERNAME]/projects/vereadores-app/builds
2. Clique no build mais recente
3. Clique em "Download" para baixar o APK

**Opção C: Via CLI**
```bash
eas build:list
# Mostra lista de builds com links de download
```

### 2. Distribuição do APK

#### Para Testes Internos:
- Envie o APK via WhatsApp, Email, Google Drive, etc.
- Usuários precisam habilitar "Instalar apps de fontes desconhecidas"

#### Para Distribuição em Produção:
- Publique na Google Play Store (requer conta de desenvolvedor - $25 uma vez)
- Use plataformas de distribuição como App Center, Firebase App Distribution

### 3. Instalação no Dispositivo Android

1. Transferir APK para o dispositivo
2. Abrir o arquivo APK
3. Permitir instalação de fontes desconhecidas (se solicitado)
4. Clicar em "Instalar"
5. Abrir o app e testar

---

## Atualização de Versão

### Quando atualizar a versão:

- **Patch (1.0.0 → 1.0.1)**: Correções de bugs pequenos
- **Minor (1.0.0 → 1.1.0)**: Novas funcionalidades menores
- **Major (1.0.0 → 2.0.0)**: Mudanças significativas, breaking changes

### Como atualizar em app.json:

```json
{
  "expo": {
    "version": "1.0.1",          // Versão legível (semântico)
    "android": {
      "versionCode": 2           // Número inteiro incremental (DEVE sempre aumentar)
    }
  }
}
```

**IMPORTANTE:**
- `version`: Pode ser qualquer string (segue semver: major.minor.patch)
- `android.versionCode`: DEVE ser inteiro e SEMPRE maior que a versão anterior
- Google Play Store rejeita APKs com versionCode menor ou igual ao anterior

### Exemplo de histórico de versões:

| Release | version | versionCode | Descrição |
|---------|---------|-------------|-----------|
| Primeira versão | 1.0.0 | 1 | Lançamento inicial |
| Correção de bugs | 1.0.1 | 2 | Fix login issue |
| Nova funcionalidade | 1.1.0 | 3 | Adicionado filtros |
| Grande update | 2.0.0 | 4 | Redesign completo |

---

## Builds Adicionais

### Build de Preview (Testes Internos)

Para gerar builds de teste rápidos:

```bash
eas build --platform android --profile preview
```

Diferenças:
- Mais rápido que production
- Para distribuição interna apenas
- Ideal para QA e testes

### Build de Development (Desenvolvimento)

Para desenvolvimento com hot reload:

```bash
eas build --platform android --profile development
```

Requer Expo Go ou development client instalado.

---

## Troubleshooting

### Erro: "Not logged in"
```bash
eas login
```

### Erro: "Project not configured"
```bash
eas init
```

### Erro: "Build failed" - Dependências
- Verificar package.json
- Deletar node_modules e package-lock.json
- Executar `npm install` novamente
- Fazer novo build

### Erro: "Build failed" - Código TypeScript/JavaScript
- Verificar erros de sintaxe no código
- Executar `npm start` localmente para ver erros
- Corrigir erros e fazer novo build

### Erro: "Duplicate resources" ou "Conflicting files"
- Limpar cache: `expo start -c`
- Verificar arquivos duplicados em assets
- Fazer novo build

### Build muito lento
- Builds iniciais são sempre mais lentos (sem cache)
- Builds subsequentes são mais rápidos
- Verifique seu plano Expo (plano gratuito pode ter limitações)

### APK não instala no dispositivo
- Verificar se versão Android é compatível (mínimo Android 5.0)
- Verificar permissão para instalar apps de fontes desconhecidas
- Verificar se há espaço suficiente no dispositivo

### App crasha ao abrir
- Verificar se API_URL está correto e servidor está acessível
- Verificar logs: `adb logcat` (requer Android Debug Bridge)
- Testar em modo desenvolvimento para ver erros

### Erro: "Unable to resolve module"
- Problema com dependências
- Executar: `npm install`
- Limpar cache: `expo start -c`
- Fazer novo build

---

## Comandos Úteis

### Ver lista de builds
```bash
eas build:list
```

### Ver detalhes de um build específico
```bash
eas build:view BUILD_ID
```

### Cancelar um build em andamento
```bash
eas build:cancel
```

### Ver configuração do projeto
```bash
eas build:configure
```

### Ver credentials (keystore, etc)
```bash
eas credentials
```

---

## Recursos Adicionais

- **Documentação EAS Build**: https://docs.expo.dev/build/introduction/
- **Expo Dashboard**: https://expo.dev/
- **Versionamento**: https://docs.expo.dev/build-reference/app-versions/
- **Google Play Store Submission**: https://docs.expo.dev/submit/android/

---

## Notas Importantes

1. **Keystore Automática**: EAS gerencia automaticamente a keystore (chave de assinatura) do app. NÃO perca acesso à sua conta Expo, pois você não poderá atualizar o app na Play Store.

2. **Primeiro Build**: O primeiro build sempre demora mais (15-25 min). Builds subsequentes são mais rápidos devido ao cache.

3. **Limite Gratuito**: Plano gratuito Expo tem limite de builds por mês. Verifique seu plano em https://expo.dev/pricing

4. **CI/CD**: Para automação, veja documentação de GitHub Actions com EAS: https://docs.expo.dev/build/building-on-ci/

5. **Monorepo**: Como este é um monorepo (backend + mobile), certifique-se de estar na pasta `mobile` ao executar comandos.

---

## Próximos Passos Após Build

1. **Testar APK**: Instalar em dispositivos reais e testar todas funcionalidades
2. **Documentar Versão**: Anotar mudanças em CHANGELOG.md
3. **Distribuir**: Enviar para testers ou publicar na Play Store
4. **Monitorar**: Coletar feedback e monitorar crashes
5. **Iterar**: Corrigir bugs e preparar próxima versão

---

## Contato e Suporte

Para problemas específicos do build, consulte:
- Documentação Expo: https://docs.expo.dev/
- Fórum Expo: https://forums.expo.dev/
- Discord Expo: https://discord.gg/expo
