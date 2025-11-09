# CSRF Protection

## O que é CSRF?

Cross-Site Request Forgery (CSRF) é um ataque onde um site malicioso força um usuário autenticado a executar ações indesejadas em outro site.

## Como Funciona Nossa Proteção

O sistema implementa proteção CSRF usando tokens customizados:

1. Cliente faz login e recebe JWT
2. Cliente requisita token CSRF: `GET /api/csrf/token`
3. Cliente envia token CSRF em toda requisição que modifica dados (POST, PATCH, DELETE)
4. Servidor valida token antes de processar requisição

## Como Usar (Mobile)

### 1. Obter Token CSRF

```javascript
// No mobile/src/services/api.js
const getCsrfToken = async () => {
  const response = await api.get('/csrf/token');
  return response.data.csrfToken;
};
```

### 2. Incluir Token nas Requisições

```javascript
// Armazenar token
let csrfToken = null;

// Obter token após login
export const authService = {
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    await AsyncStorage.setItem('@auth_token', response.data.token);
    await AsyncStorage.setItem('@user', JSON.stringify(response.data.user));

    // Obter CSRF token
    csrfToken = await getCsrfToken();
    await AsyncStorage.setItem('@csrf_token', csrfToken);

    return response.data;
  }
};

// Interceptor para adicionar CSRF token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@auth_token');
    const csrf = await AsyncStorage.getItem('@csrf_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar CSRF em requisições que modificam dados
    if (['post', 'patch', 'delete', 'put'].includes(config.method.toLowerCase())) {
      if (csrf) {
        config.headers['X-CSRF-Token'] = csrf;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);
```

## Quando Ativar

A proteção CSRF está **implementada mas NÃO ativada por padrão**.

Para ativar, adicione o middleware nas rotas que precisam de proteção:

```javascript
// backend/src/routes/ocorrencia.routes.js
const { csrfProtection } = require('../middleware/csrf.middleware');

// Aplicar em rotas específicas
router.post('/', authMiddleware, isVereador, csrfProtection, [validations], controller.create);
router.patch('/:id/status', authMiddleware, isJuridicoOrAdmin, csrfProtection, controller.updateStatus);
```

## Notas Importantes

1. **Apenas em produção**: CSRF é mais relevante para aplicações web
2. **Mobile apps**: Apps nativos são menos vulneráveis a CSRF
3. **Custo-benefício**: Avalie se a complexidade adicional vale a pena
4. **Alternativas**: JWT com httpOnly cookies + SameSite oferece proteção similar

## Recomendação

Para este projeto (API REST consumida por app mobile):
- **NÃO ativar CSRF** para requisições de mobile (baixo risco)
- **Ativar CSRF** apenas se criar dashboard web no futuro
- **Manter rate limiting** como principal proteção
