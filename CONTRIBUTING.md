# Guia de Contribuicao

Obrigado por considerar contribuir com o Sistema de Ocorrencias Urbanas! Este documento fornece diretrizes para garantir contribuicoes de qualidade.

## Sumario

- [Codigo de Conduta](#codigo-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuracao do Ambiente](#configuracao-do-ambiente)
- [Padroes de Codigo](#padroes-de-codigo)
- [Processo de Pull Request](#processo-de-pull-request)
- [Convencoes de Commit](#convencoes-de-commit)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Melhorias](#sugerir-melhorias)

---

## Codigo de Conduta

Este projeto segue um codigo de conduta. Ao participar, voce concorda em manter um ambiente respeitoso e inclusivo.

### Nossas Expectativas

- Use linguagem acolhedora e inclusiva
- Respeite pontos de vista diferentes
- Aceite criticas construtivas
- Foque no que e melhor para a comunidade

---

## Como Contribuir

### 1. Fork o Repositorio

```bash
# Via interface do GitHub, clique em "Fork"
# Depois clone seu fork:
git clone https://github.com/seu-usuario/prefeitura-app.git
cd prefeitura-app
```

### 2. Crie uma Branch

```bash
# Sempre crie uma branch para sua feature/fix
git checkout -b feature/nome-da-feature

# Ou para correção de bugs:
git checkout -b fix/descricao-do-bug
```

### 3. Faca suas Alteracoes

Siga os [padroes de codigo](#padroes-de-codigo) e teste suas mudancas.

### 4. Commit

Use nossas [convencoes de commit](#convencoes-de-commit).

### 5. Push e Pull Request

```bash
git push origin feature/nome-da-feature
```

Depois abra um Pull Request no GitHub.

---

## Configuracao do Ambiente

### Pre-requisitos

- Node.js 18+
- PostgreSQL
- Git

### Setup Inicial

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edite o .env com suas configuracoes
npm run prisma:migrate
npm run dev

# Mobile (em outro terminal)
cd mobile
npm install
# Configure src/services/api.js com a URL da API
npm start
```

### Executar Testes

```bash
# Backend (quando implementado)
cd backend
npm test

# Mobile (quando implementado)
cd mobile
npm test
```

---

## Padroes de Codigo

### JavaScript/Node.js (Backend)

#### Estilo

- Use **camelCase** para variaveis e funcoes
- Use **PascalCase** para classes
- Use **UPPER_SNAKE_CASE** para constantes
- Indentacao: 2 espacos
- Sempre use `const` ou `let`, nunca `var`
- Use arrow functions quando possivel

#### Exemplo

```javascript
// Bom
const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  return user;
};

// Ruim
var get_user = function(id) {
  var user = prisma.user.findUnique({
    where: { id: id }
  })
  return user
}
```

#### Controllers

- Um controller por recurso (ex: `auth.controller.js`)
- Use classes com metodos
- Sempre trate erros com try-catch
- Retorne status HTTP apropriados

```javascript
class UserController {
  /**
   * Cria um novo usuario
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async create(req, res) {
    try {
      // Validacao
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Logica
      const user = await prisma.user.create({ data: req.body });

      // Resposta
      res.status(201).json(user);
    } catch (error) {
      console.error('Erro ao criar usuario:', error);
      res.status(500).json({ error: 'Erro ao criar usuario' });
    }
  }
}
```

#### Rotas

- Use express.Router()
- Agrupe rotas por recurso
- Sempre valide dados com express-validator
- Use middlewares para autenticacao

```javascript
const router = express.Router();

router.post('/',
  authMiddleware,           // Middleware de autenticacao
  [                         // Validacao
    body('nome').notEmpty(),
    body('email').isEmail()
  ],
  controller.create         // Controller
);

module.exports = router;
```

#### Prisma

- Use transactions para operacoes multiplas
- Sempre selecione apenas os campos necessarios
- Use `include` para relacoes

```javascript
// Bom
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    nome: true,
    email: true
  }
});

// Evite retornar senhas
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    nome: true,
    senha: false  // NÃO faça isso
  }
});
```

### React Native (Mobile)

#### Estilo

- Use functional components com hooks
- Use camelCase para funcoes
- Use PascalCase para componentes
- Um componente por arquivo

#### Exemplo

```javascript
// Bom
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    const data = await api.get(`/users/${userId}`);
    setUser(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.nome}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default UserProfile;
```

#### Estrutura de Pastas

```
mobile/src/
├── screens/        # Telas do app
├── components/     # Componentes reutilizaveis
├── navigation/     # Navegacao
├── context/        # Context API
├── services/       # APIs e servicos
└── utils/          # Funcoes auxiliares
```

---

## Processo de Pull Request

### Checklist

Antes de abrir um PR, certifique-se de que:

- [ ] O codigo segue os padroes estabelecidos
- [ ] Todos os testes passam (quando implementados)
- [ ] A documentacao foi atualizada (se necessario)
- [ ] Commits seguem as convencoes
- [ ] Nao ha conflitos com a branch main
- [ ] O codigo foi revisado por voce mesmo

### Template de PR

```markdown
## Descricao

Descreva as mudancas que voce fez e o motivo.

## Tipo de mudanca

- [ ] Bug fix (mudanca que corrige um problema)
- [ ] Nova feature (mudanca que adiciona funcionalidade)
- [ ] Breaking change (mudanca que quebra compatibilidade)
- [ ] Documentacao

## Como testar

1. Passo a passo para testar as mudancas
2. ...

## Checklist

- [ ] Codigo segue os padroes do projeto
- [ ] Testes passam
- [ ] Documentacao atualizada
```

### Revisao

- PRs serao revisados por pelo menos um maintainer
- Responda aos comentarios e sugestoes
- Faca as alteracoes solicitadas
- Quando aprovado, o PR sera mergeado

---

## Convencoes de Commit

Use o formato **Conventional Commits**:

```
<tipo>(<escopo>): <descricao>

[corpo opcional]

[rodape opcional]
```

### Tipos

- `feat`: Nova feature
- `fix`: Correcao de bug
- `docs`: Mudancas na documentacao
- `style`: Formatacao, ponto e virgula faltando, etc
- `refactor`: Refatoracao de codigo
- `test`: Adicionar ou corrigir testes
- `chore`: Atualizacao de build, configs, etc

### Exemplos

```bash
# Feature
git commit -m "feat(auth): adicionar login com Google"

# Bug fix
git commit -m "fix(ocorrencias): corrigir upload de multiplas fotos"

# Documentacao
git commit -m "docs(readme): atualizar instrucoes de instalacao"

# Refatoracao
git commit -m "refactor(api): extrair logica de validacao para middleware"

# Chore
git commit -m "chore(deps): atualizar dependencias do backend"
```

### Mensagens

- Use o imperativo: "adicionar" nao "adicionado"
- Primeira linha com ate 72 caracteres
- Deixe uma linha em branco antes do corpo
- Explique **o que** e **por que**, nao **como**

#### Exemplo completo

```
feat(ocorrencias): adicionar filtro por data

Implementa filtro de ocorrencias por intervalo de datas
para facilitar a busca por periodo.

Closes #42
```

---

## Reportar Bugs

### Antes de Reportar

1. Verifique se o bug ja foi reportado
2. Confirme que e um bug, nao um erro de configuracao
3. Teste na versao mais recente

### Como Reportar

Crie uma issue com o template:

```markdown
## Descricao do Bug

Descricao clara e concisa do problema.

## Passos para Reproduzir

1. Va para '...'
2. Clique em '...'
3. Veja o erro

## Comportamento Esperado

O que deveria acontecer.

## Comportamento Atual

O que esta acontecendo.

## Screenshots

Se aplicavel, adicione screenshots.

## Ambiente

- OS: [ex: Windows 10]
- Node.js: [ex: 18.16.0]
- Versao do app: [ex: 1.0.0]

## Logs

```
Cole os logs relevantes aqui
```
```

---

## Sugerir Melhorias

### Template de Feature Request

```markdown
## Problema que Resolve

Descreva o problema que esta feature resolveria.

## Solucao Proposta

Descreva como voce imagina que a feature funcionaria.

## Alternativas Consideradas

Outras solucoes que voce pensou.

## Informacoes Adicionais

Mockups, diagramas, referencias, etc.
```

---

## Estrutura do Projeto

### Backend

```
backend/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── config/
│   │   └── database.js        # Configuracao Prisma
│   ├── controllers/           # Logica de negocio
│   │   ├── auth.controller.js
│   │   └── ocorrencia.controller.js
│   ├── middleware/            # Middlewares
│   │   └── auth.middleware.js
│   ├── routes/                # Rotas da API
│   │   ├── auth.routes.js
│   │   ├── ocorrencia.routes.js
│   │   ├── user.routes.js
│   │   └── notificacao.routes.js
│   ├── services/              # Servicos externos
│   │   ├── email.service.js
│   │   └── upload.service.js
│   └── server.js              # Ponto de entrada
├── .env                       # Variaveis de ambiente (nao commitar!)
├── .env.example               # Template do .env
└── package.json
```

### Mobile

```
mobile/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── home/
│   │   │   └── HomeScreen.js
│   │   ├── ocorrencias/
│   │   │   ├── NovaOcorrenciaScreen.js
│   │   │   └── DetalhesOcorrenciaScreen.js
│   │   └── profile/
│   │       └── ProfileScreen.js
│   ├── navigation/
│   │   └── AppNavigator.js
│   ├── context/
│   │   └── AuthContext.js
│   └── services/
│       └── api.js
├── App.js
└── package.json
```

---

## Boas Praticas

### Seguranca

- NUNCA commite senhas, tokens ou keys
- Use `.env` para credenciais
- Valide TODOS os inputs do usuario
- Use prepared statements (Prisma ja faz isso)
- Hash senhas com bcrypt
- Use HTTPS em producao

### Performance

- Use indices no banco de dados
- Implemente paginacao para listas
- Otimize queries do Prisma
- Use cache quando apropriado
- Comprima imagens antes do upload

### Banco de Dados

- Use migrations do Prisma
- NUNCA altere o schema.prisma sem criar migration
- Nomeie migrations de forma descritiva
- Teste migrations em desenvolvimento primeiro

```bash
# Criar migration
npx prisma migrate dev --name adicionar_campo_telefone

# Aplicar migrations
npx prisma migrate deploy
```

---

## Ferramentas Uteis

### VSCode Extensions

- ESLint
- Prettier
- Prisma
- GitLens
- React Native Tools

### Debugging

#### Backend

```javascript
// Adicione debugger no codigo
debugger;

// Ou use console.log estrategicamente
console.log('Usuario:', user);
console.log('Query params:', req.query);
```

#### Mobile

```javascript
// Use console.log
console.log('State:', state);

// Ou o Reactotron (recomendado)
import Reactotron from 'reactotron-react-native';
Reactotron.log('Debug info', data);
```

---

## Recursos

### Documentacao Oficial

- [Node.js](https://nodejs.org/docs)
- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [React Native](https://reactnative.dev/docs)
- [Expo](https://docs.expo.dev/)

### Tutoriais

- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [JWT Authentication](https://jwt.io/introduction)

---

## Contato

Se tiver duvidas sobre como contribuir:

1. Leia a documentacao completa
2. Verifique issues existentes
3. Abra uma issue com sua pergunta

---

## Licenca

Ao contribuir, voce concorda que suas contribuicoes serao licenciadas sob a mesma licenca do projeto (MIT).

---

**Obrigado por contribuir!**
