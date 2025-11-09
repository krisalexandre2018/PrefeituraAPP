# Checklist Pré-Build - Vereadores App

Use este checklist ANTES de iniciar qualquer build de produção para garantir que tudo está configurado corretamente.

---

## 1. Configuração de Ambiente

### 1.1 Backend/API
- [ ] Servidor de produção está rodando e acessível
- [ ] Backend está respondendo corretamente às requisições
- [ ] HTTPS configurado com certificado SSL válido (obrigatório para produção)
- [ ] CORS configurado para aceitar requisições do app
- [ ] Rate limiting configurado (100 req/15min)
- [ ] Variáveis de ambiente configuradas (.env do backend)
- [ ] Banco de dados PostgreSQL está rodando
- [ ] Cloudinary configurado para upload de imagens
- [ ] Nodemailer configurado para envio de emails

### 1.2 URL da API
- [ ] Arquivo `src/services/api.js` atualizado com URL de produção
- [ ] URL testada e funcionando (teste com curl ou navegador)
- [ ] URL usa HTTPS (não HTTP)
- [ ] Caminho `/api` está correto no final da URL

**Exemplo:**
```javascript
// src/services/api.js
const API_URL = 'https://api.vereadores.exemplo.com/api';
```

---

## 2. Versionamento

### 2.1 Versão do App (app.json)
- [ ] Campo `version` atualizado (formato semver: 1.0.0)
- [ ] Campo `android.versionCode` incrementado (número inteiro, sempre crescente)
- [ ] Versão documentada com notas de release

**Regras:**
- `version`: Pode ser qualquer string semântica (ex: "1.0.1", "2.0.0")
- `android.versionCode`: DEVE ser número inteiro e SEMPRE maior que a versão anterior

**Exemplo:**
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

### 2.2 Histórico de Versões
- [ ] CHANGELOG.md atualizado com mudanças da versão
- [ ] Notas de release preparadas para distribuição

---

## 3. Configuração do Projeto

### 3.1 Arquivos de Configuração
- [ ] `app.json` configurado corretamente
  - [ ] Nome do app correto (`name`)
  - [ ] Slug correto (`slug`)
  - [ ] Bundle identifier/package name correto (`android.package`)
  - [ ] Permissões necessárias listadas (`android.permissions`)
  - [ ] Ícone e splash screen configurados
- [ ] `eas.json` existe e está configurado
- [ ] `package.json` com todas dependências corretas

### 3.2 Assets
- [ ] Ícone do app existe em `assets/icon.png` (1024x1024px)
- [ ] Splash screen existe em `assets/splash.png`
- [ ] Adaptive icon existe em `assets/adaptive-icon.png` (Android)
- [ ] Todos os assets estão otimizados (tamanho de arquivo)

---

## 4. Testes e Funcionalidades

### 4.1 Funcionalidades Principais
- [ ] Login e autenticação funcionando
- [ ] Registro de novos usuários funcionando
- [ ] Listagem de ocorrências funcionando
- [ ] Criação de nova ocorrência funcionando
- [ ] Upload de fotos funcionando (máximo 5 por ocorrência)
- [ ] Captura de GPS/localização funcionando
- [ ] Visualização de detalhes de ocorrência funcionando
- [ ] Notificações funcionando

### 4.2 Permissões
- [ ] Permissão de câmera testada
- [ ] Permissão de localização testada
- [ ] Permissão de armazenamento testada (se aplicável)
- [ ] Mensagens de erro amigáveis quando permissões são negadas

### 4.3 Estados e Erros
- [ ] Loading states funcionando (indicadores de carregamento)
- [ ] Tratamento de erros implementado
- [ ] Mensagens de erro amigáveis para o usuário
- [ ] Comportamento offline testado (sem conexão)
- [ ] Timeout de requisições configurado (30s)

---

## 5. Segurança

### 5.1 Credenciais e Tokens
- [ ] Nenhuma credencial hardcoded no código
- [ ] Tokens JWT com expiração configurada (2h)
- [ ] Senhas hasheadas no backend (bcrypt)
- [ ] Nenhum dado sensível em logs

### 5.2 Comunicação
- [ ] Todas requisições usam HTTPS
- [ ] Validação de certificado SSL habilitada
- [ ] Headers de segurança configurados no backend

---

## 6. Dependências

### 6.1 Node Modules
- [ ] `node_modules` instalado corretamente
- [ ] Nenhum erro ao executar `npm install`
- [ ] Todas as dependências estão nas versões corretas
- [ ] Nenhuma vulnerabilidade crítica (verificar com `npm audit`)

### 6.2 Compatibilidade
- [ ] Expo SDK 50 (ou versão configurada)
- [ ] React Native compatível
- [ ] Todas as bibliotecas compatíveis com a versão do Expo

---

## 7. Expo/EAS Configuration

### 7.1 Conta Expo
- [ ] Login realizado (`eas login`)
- [ ] Conta Expo ativa e verificada
- [ ] Projeto inicializado com EAS (`eas init`) - apenas primeira vez

### 7.2 Project ID
- [ ] `app.json` contém `extra.eas.projectId`
- [ ] Project ID está vinculado à sua conta Expo

---

## 8. Código e Qualidade

### 8.1 Código
- [ ] Nenhum erro de sintaxe
- [ ] Nenhum warning crítico
- [ ] Código testado localmente com `expo start`
- [ ] Nenhum console.log desnecessário em produção

### 8.2 Performance
- [ ] Imagens otimizadas (tamanho reduzido)
- [ ] Requisições HTTP otimizadas
- [ ] FlatList com keyExtractor e otimizações
- [ ] Nenhum memory leak detectado

---

## 9. Controle de Versão

### 9.1 Git
- [ ] Todas as mudanças commitadas
- [ ] Branch de produção atualizada (main/master)
- [ ] Tag de versão criada (ex: `v1.0.1`)
- [ ] Push para repositório remoto realizado

**Comandos:**
```bash
git add .
git commit -m "Preparar build v1.0.1"
git tag v1.0.1
git push origin main --tags
```

---

## 10. Documentação

### 10.1 Documentação Técnica
- [ ] README.md atualizado
- [ ] API endpoints documentados
- [ ] Mudanças documentadas em CHANGELOG.md

### 10.2 Documentação de Uso
- [ ] Manual do usuário atualizado (se aplicável)
- [ ] Notas de release preparadas
- [ ] Screenshots atualizados (se houve mudanças visuais)

---

## 11. Testes Finais

### 11.1 Teste Local
- [ ] App executado em modo produção localmente
- [ ] Todas as telas testadas
- [ ] Fluxo completo testado (login → criar ocorrência → logout)

### 11.2 Dispositivos
- [ ] Testado em dispositivo físico Android
- [ ] Testado em diferentes versões do Android (se possível)
- [ ] Testado em diferentes tamanhos de tela

---

## 12. Preparação para Build

### 12.1 Arquivos Necessários
- [ ] `app.json` ✓
- [ ] `eas.json` ✓
- [ ] `package.json` ✓
- [ ] Todos os arquivos de código-fonte

### 12.2 Build Configuration
- [ ] Profile de build selecionado (`production`, `preview`, ou `development`)
- [ ] Plataforma selecionada (`android`)

---

## Comando de Build

Após completar TODOS os itens acima, execute:

```bash
# Build de produção (APK)
eas build --platform android --profile production

# Build de preview (para testes internos)
eas build --platform android --profile preview
```

---

## Após o Build

### Pós-Build Checklist
- [ ] Build completado com sucesso
- [ ] APK baixado
- [ ] APK testado em dispositivo real
- [ ] Funcionamento verificado
- [ ] Distribuído para testers (se aplicável)
- [ ] Feedback coletado
- [ ] Issues documentados (se houver)

---

## Notas Importantes

1. **SEMPRE use HTTPS em produção** - Apps com HTTP são rejeitados pela Play Store
2. **versionCode DEVE sempre aumentar** - Google Play rejeita versões iguais ou menores
3. **Teste ANTES de distribuir** - Bugs em produção são difíceis de reverter
4. **Mantenha backup da keystore** - EAS gerencia automaticamente, não perca acesso à conta
5. **Documente tudo** - Mantenha CHANGELOG.md e notas de release atualizados

---

## Em Caso de Erro

Se algum item não puder ser completado:
1. **NÃO prossiga com o build**
2. Resolva o problema primeiro
3. Re-execute este checklist
4. Apenas faça build quando TODOS os itens estiverem ✓

---

## Referências

- BUILD_GUIDE.md - Guia completo de build
- API_CONFIG.md - Configuração da URL da API
- CLAUDE.md - Documentação do projeto
- Expo Docs: https://docs.expo.dev/

---

**Última atualização:** 2025-01-08
