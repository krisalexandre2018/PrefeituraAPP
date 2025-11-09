# Configuração da URL da API

## Importante

Antes de fazer o build de produção, você DEVE atualizar a URL da API para o endereço do seu servidor de produção.

## Como Configurar

### Arquivo a ser editado:
`src/services/api.js`

### Localização da configuração:
```javascript
// ALTERE AQUI PARA O IP DO SEU COMPUTADOR OU URL DA API
const API_URL = 'http://192.168.2.104:3000/api';
```

### Opções de configuração:

1. **Desenvolvimento Local:**
   ```javascript
   const API_URL = 'http://192.168.1.100:3000/api';
   ```
   - Use o IP local do computador onde o backend está rodando
   - Certifique-se de que o dispositivo está na mesma rede Wi-Fi

2. **Produção (HTTPS):**
   ```javascript
   const API_URL = 'https://api.vereadores.exemplo.com/api';
   ```
   - Use o domínio ou IP público do servidor de produção
   - SEMPRE use HTTPS em produção
   - Certifique-se de que o certificado SSL está configurado

3. **Produção (HTTP - não recomendado):**
   ```javascript
   const API_URL = 'http://seuservidor.com:3000/api';
   ```
   - Apenas para testes em ambientes controlados
   - Não use HTTP em produção com dados reais

## Checklist Pré-Build

- [ ] Atualizar `API_URL` em `src/services/api.js`
- [ ] Testar se o servidor está acessível pelo URL configurado
- [ ] Verificar se o backend está rodando e respondendo
- [ ] Testar autenticação e endpoints principais
- [ ] Verificar se CORS está configurado para aceitar requisições do app

## Testando a Conexão

Antes de fazer o build, teste se a API está acessível:

```bash
# No navegador ou usando curl:
curl https://api.vereadores.exemplo.com/api/health
```

Se retornar 404, tente sem `/api` no final.

## Nota sobre Segurança

- Em produção, SEMPRE use HTTPS
- Nunca exponha credenciais ou tokens no código
- Configure CORS adequadamente no backend
- Use rate limiting e proteção contra ataques
