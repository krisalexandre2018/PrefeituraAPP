# API Reference - Sistema de Ocorrencias Urbanas

Documentacao completa de todos os endpoints da API REST.

**Base URL:** `http://localhost:3000/api`

**Versao:** 1.0.0

## Sumario

- [Autenticacao](#autenticacao)
- [Usuarios](#usuarios)
- [Ocorrencias](#ocorrencias)
- [Notificacoes](#notificacoes)
- [Codigos de Status](#codigos-de-status)
- [Modelos de Dados](#modelos-de-dados)

---

## Autenticacao

### POST /auth/register

Registra um novo vereador no sistema. O status inicial sera `PENDENTE` ate aprovacao do administrador.

**Autenticacao:** Nao requerida

**Body:**
```json
{
  "nome": "Joao Silva",
  "cpf": "12345678900",
  "email": "joao@example.com",
  "senha": "senha123",
  "telefone": "11999999999"
}
```

**Validacoes:**
- `nome` (string, obrigatorio): Nome completo do usuario
- `cpf` (string, obrigatorio): Exatamente 11 digitos numericos
- `email` (string, obrigatorio): Email valido
- `senha` (string, obrigatorio): Minimo 6 caracteres
- `telefone` (string, opcional): Telefone de contato

**Respostas:**

**201 Created**
```json
{
  "message": "Cadastro realizado! Aguarde a aprovacao do administrador.",
  "user": {
    "id": "uuid",
    "nome": "Joao Silva",
    "email": "joao@example.com",
    "status": "PENDENTE"
  }
}
```

**400 Bad Request**
```json
{
  "error": "CPF ou email ja cadastrado"
}
```

**400 Bad Request** (validacao)
```json
{
  "errors": [
    {
      "msg": "Email invalido",
      "param": "email"
    }
  ]
}
```

---

### POST /auth/login

Autentica um usuario e retorna um token JWT.

**Autenticacao:** Nao requerida

**Body:**
```json
{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

**Respostas:**

**200 OK**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nome": "Joao Silva",
    "email": "joao@example.com",
    "tipo": "VEREADOR",
    "fotoPerfil": null
  }
}
```

**401 Unauthorized**
```json
{
  "error": "Credenciais invalidas"
}
```

**403 Forbidden** (conta pendente)
```json
{
  "error": "Conta aguardando aprovacao do administrador"
}
```

**403 Forbidden** (conta inativa)
```json
{
  "error": "Conta desativada. Entre em contato com o administrador"
}
```

---

### GET /auth/me

Retorna os dados do usuario autenticado.

**Autenticacao:** Bearer Token (obrigatorio)

**Headers:**
```
Authorization: Bearer {token}
```

**Respostas:**

**200 OK**
```json
{
  "id": "uuid",
  "nome": "Joao Silva",
  "email": "joao@example.com",
  "cpf": "12345678900",
  "telefone": "11999999999",
  "tipo": "VEREADOR",
  "status": "ATIVO",
  "fotoPerfil": null,
  "createdAt": "2025-11-02T10:00:00.000Z"
}
```

**401 Unauthorized**
```json
{
  "error": "Token invalido ou expirado"
}
```

**404 Not Found**
```json
{
  "error": "Usuario nao encontrado"
}
```

---

## Usuarios

Todas as rotas de usuarios requerem autenticacao de ADMIN.

### GET /users/pending

Lista todos os usuarios com status PENDENTE aguardando aprovacao.

**Autenticacao:** Bearer Token (ADMIN)

**Respostas:**

**200 OK**
```json
[
  {
    "id": "uuid",
    "nome": "Joao Silva",
    "email": "joao@example.com",
    "cpf": "12345678900",
    "telefone": "11999999999",
    "tipo": "VEREADOR",
    "createdAt": "2025-11-02T10:00:00.000Z"
  }
]
```

---

### PATCH /users/:id/approve

Aprova um usuario pendente, alterando seu status para ATIVO.

**Autenticacao:** Bearer Token (ADMIN)

**Parametros de URL:**
- `id` (string): ID do usuario

**Respostas:**

**200 OK**
```json
{
  "message": "Usuario aprovado com sucesso",
  "user": {
    "id": "uuid",
    "nome": "Joao Silva",
    "email": "joao@example.com",
    "status": "ATIVO"
  }
}
```

**Observacao:** Um email de boas-vindas sera enviado automaticamente para o usuario.

---

### PATCH /users/:id/deactivate

Desativa um usuario, alterando seu status para INATIVO.

**Autenticacao:** Bearer Token (ADMIN)

**Parametros de URL:**
- `id` (string): ID do usuario

**Respostas:**

**200 OK**
```json
{
  "message": "Usuario desativado com sucesso",
  "user": {
    "id": "uuid",
    "status": "INATIVO"
  }
}
```

---

### GET /users

Lista todos os usuarios do sistema.

**Autenticacao:** Bearer Token (ADMIN)

**Respostas:**

**200 OK**
```json
[
  {
    "id": "uuid",
    "nome": "Joao Silva",
    "email": "joao@example.com",
    "cpf": "12345678900",
    "tipo": "VEREADOR",
    "status": "ATIVO",
    "createdAt": "2025-11-02T10:00:00.000Z"
  }
]
```

---

## Ocorrencias

Todas as rotas de ocorrencias requerem autenticacao.

### POST /ocorrencias

Cria uma nova ocorrencia. Apenas VEREADORES podem criar ocorrencias.

**Autenticacao:** Bearer Token (VEREADOR)

**Content-Type:** `multipart/form-data`

**Body (FormData):**
```
titulo: "Buraco na rua"
descricao: "Grande buraco na Rua X causando risco aos motoristas"
categoria: "INFRAESTRUTURA"
endereco: "Rua X, 123, Centro"
latitude: "-23.550520"
longitude: "-46.633308"
prioridade: "ALTA"
fotos: [File, File, ...]  // Ate 5 imagens (max 5MB cada)
```

**Campos:**
- `titulo` (string, obrigatorio): Titulo resumido da ocorrencia
- `descricao` (string, obrigatorio): Descricao detalhada do problema
- `categoria` (string, opcional): Uma das categorias validas (padrao: OUTROS)
- `endereco` (string, obrigatorio): Endereco completo
- `latitude` (float, opcional): Coordenada GPS
- `longitude` (float, opcional): Coordenada GPS
- `prioridade` (string, opcional): BAIXA | MEDIA | ALTA (padrao: MEDIA)
- `fotos` (array de arquivos, opcional): Ate 5 imagens

**Categorias validas:**
- INFRAESTRUTURA
- ILUMINACAO
- LIMPEZA
- SAUDE
- EDUCACAO
- SEGURANCA
- TRANSPORTE
- MEIO_AMBIENTE
- OUTROS

**Respostas:**

**201 Created**
```json
{
  "id": "uuid",
  "vereadorId": "uuid",
  "titulo": "Buraco na rua",
  "descricao": "Grande buraco na Rua X causando risco aos motoristas",
  "categoria": "INFRAESTRUTURA",
  "endereco": "Rua X, 123, Centro",
  "latitude": -23.550520,
  "longitude": -46.633308,
  "status": "PENDENTE",
  "prioridade": "ALTA",
  "createdAt": "2025-11-02T10:00:00.000Z",
  "updatedAt": "2025-11-02T10:00:00.000Z",
  "fotos": [
    {
      "id": "uuid",
      "urlFoto": "https://cloudinary.com/...",
      "thumbnailUrl": "https://cloudinary.com/.../thumb",
      "ordem": 0
    }
  ],
  "vereador": {
    "nome": "Joao Silva",
    "email": "joao@example.com"
  }
}
```

**403 Forbidden**
```json
{
  "error": "Apenas vereadores podem criar ocorrencias"
}
```

**Observacao:** Um email sera enviado automaticamente para a equipe juridica.

---

### GET /ocorrencias

Lista ocorrencias com filtros e paginacao.

**Autenticacao:** Bearer Token

**Query Parameters:**
- `status` (string, opcional): PENDENTE | EM_ANALISE | RESOLVIDO | REJEITADO
- `categoria` (string, opcional): Filtrar por categoria
- `vereadorId` (string, opcional): Filtrar por vereador (apenas admin/juridico)
- `page` (number, opcional): Numero da pagina (padrao: 1)
- `limit` (number, opcional): Itens por pagina (padrao: 10)

**Comportamento:**
- VEREADORES veem apenas suas proprias ocorrencias
- ADMIN e JURIDICO veem todas as ocorrencias

**Exemplo:**
```
GET /ocorrencias?status=PENDENTE&page=1&limit=10
```

**Respostas:**

**200 OK**
```json
{
  "ocorrencias": [
    {
      "id": "uuid",
      "vereadorId": "uuid",
      "titulo": "Buraco na rua",
      "descricao": "Grande buraco...",
      "categoria": "INFRAESTRUTURA",
      "endereco": "Rua X, 123",
      "latitude": -23.550520,
      "longitude": -46.633308,
      "status": "PENDENTE",
      "prioridade": "ALTA",
      "createdAt": "2025-11-02T10:00:00.000Z",
      "updatedAt": "2025-11-02T10:00:00.000Z",
      "fotos": [
        {
          "id": "uuid",
          "urlFoto": "https://cloudinary.com/...",
          "thumbnailUrl": "https://cloudinary.com/.../thumb",
          "ordem": 0
        }
      ],
      "vereador": {
        "nome": "Joao Silva",
        "email": "joao@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

---

### GET /ocorrencias/:id

Retorna detalhes completos de uma ocorrencia, incluindo historico.

**Autenticacao:** Bearer Token

**Parametros de URL:**
- `id` (string): ID da ocorrencia

**Respostas:**

**200 OK**
```json
{
  "id": "uuid",
  "vereadorId": "uuid",
  "titulo": "Buraco na rua",
  "descricao": "Grande buraco...",
  "categoria": "INFRAESTRUTURA",
  "endereco": "Rua X, 123",
  "latitude": -23.550520,
  "longitude": -46.633308,
  "status": "EM_ANALISE",
  "prioridade": "ALTA",
  "createdAt": "2025-11-02T10:00:00.000Z",
  "updatedAt": "2025-11-02T11:00:00.000Z",
  "fotos": [
    {
      "id": "uuid",
      "urlFoto": "https://cloudinary.com/...",
      "thumbnailUrl": "https://cloudinary.com/.../thumb",
      "ordem": 0
    }
  ],
  "vereador": {
    "nome": "Joao Silva",
    "email": "joao@example.com",
    "telefone": "11999999999"
  },
  "historicos": [
    {
      "id": "uuid",
      "acao": "STATUS_ALTERADO_EM_ANALISE",
      "comentario": "Iniciada analise juridica",
      "createdAt": "2025-11-02T11:00:00.000Z",
      "usuario": {
        "nome": "Maria Santos",
        "tipo": "JURIDICO"
      }
    },
    {
      "id": "uuid",
      "acao": "CRIADA",
      "comentario": "Ocorrencia criada",
      "createdAt": "2025-11-02T10:00:00.000Z",
      "usuario": {
        "nome": "Joao Silva",
        "tipo": "VEREADOR"
      }
    }
  ]
}
```

**403 Forbidden** (vereador tentando ver ocorrencia de outro)
```json
{
  "error": "Acesso negado"
}
```

**404 Not Found**
```json
{
  "error": "Ocorrencia nao encontrada"
}
```

---

### PATCH /ocorrencias/:id/status

Atualiza o status de uma ocorrencia. Apenas ADMIN e JURIDICO.

**Autenticacao:** Bearer Token (ADMIN ou JURIDICO)

**Parametros de URL:**
- `id` (string): ID da ocorrencia

**Body:**
```json
{
  "status": "EM_ANALISE",
  "comentario": "Iniciada analise juridica do caso"
}
```

**Campos:**
- `status` (string, obrigatorio): EM_ANALISE | RESOLVIDO | REJEITADO
- `comentario` (string, opcional): Comentario sobre a mudanca de status

**Respostas:**

**200 OK**
```json
{
  "id": "uuid",
  "status": "EM_ANALISE",
  "updatedAt": "2025-11-02T11:00:00.000Z"
}
```

**400 Bad Request**
```json
{
  "error": "Status invalido"
}
```

**Observacao:**
- Um registro sera criado no historico
- O vereador recebera uma notificacao automatica

---

### DELETE /ocorrencias/:id

Deleta uma ocorrencia.

**Autenticacao:** Bearer Token

**Regras:**
- VEREADORES: Podem deletar apenas suas proprias ocorrencias com status PENDENTE
- ADMIN: Pode deletar qualquer ocorrencia

**Parametros de URL:**
- `id` (string): ID da ocorrencia

**Respostas:**

**200 OK**
```json
{
  "message": "Ocorrencia deletada com sucesso"
}
```

**403 Forbidden**
```json
{
  "error": "Apenas ocorrencias pendentes podem ser deletadas"
}
```

**404 Not Found**
```json
{
  "error": "Ocorrencia nao encontrada"
}
```

---

### GET /ocorrencias/stats

Retorna estatisticas sobre as ocorrencias. Apenas ADMIN e JURIDICO.

**Autenticacao:** Bearer Token (ADMIN ou JURIDICO)

**Respostas:**

**200 OK**
```json
{
  "total": 156,
  "pendentes": 23,
  "emAnalise": 45,
  "resolvidas": 88,
  "porCategoria": [
    {
      "categoria": "INFRAESTRUTURA",
      "_count": 42
    },
    {
      "categoria": "ILUMINACAO",
      "_count": 28
    },
    {
      "categoria": "LIMPEZA",
      "_count": 35
    }
  ]
}
```

---

## Notificacoes

Todas as rotas de notificacoes requerem autenticacao.

### GET /notificacoes

Lista notificacoes do usuario autenticado.

**Autenticacao:** Bearer Token

**Query Parameters:**
- `lida` (boolean, opcional): Filtrar por notificacoes lidas/nao lidas

**Exemplo:**
```
GET /notificacoes?lida=false
```

**Respostas:**

**200 OK**
```json
[
  {
    "id": "uuid",
    "usuarioId": "uuid",
    "tipo": "STATUS_ALTERADO",
    "titulo": "Status da Ocorrencia Atualizado",
    "mensagem": "Sua ocorrencia \"Buraco na rua\" teve o status alterado para EM_ANALISE",
    "lida": false,
    "createdAt": "2025-11-02T11:00:00.000Z"
  }
]
```

**Observacao:** Retorna ate 50 notificacoes mais recentes.

---

### PATCH /notificacoes/:id/read

Marca uma notificacao especifica como lida.

**Autenticacao:** Bearer Token

**Parametros de URL:**
- `id` (string): ID da notificacao

**Respostas:**

**200 OK**
```json
{
  "id": "uuid",
  "lida": true,
  "updatedAt": "2025-11-02T11:30:00.000Z"
}
```

**403 Forbidden**
```json
{
  "error": "Acesso negado"
}
```

**404 Not Found**
```json
{
  "error": "Notificacao nao encontrada"
}
```

---

### PATCH /notificacoes/read-all

Marca todas as notificacoes do usuario como lidas.

**Autenticacao:** Bearer Token

**Respostas:**

**200 OK**
```json
{
  "message": "Todas as notificacoes foram marcadas como lidas"
}
```

---

### GET /notificacoes/unread-count

Retorna a contagem de notificacoes nao lidas.

**Autenticacao:** Bearer Token

**Respostas:**

**200 OK**
```json
{
  "count": 5
}
```

---

## Codigos de Status

### Codigos de Sucesso
- `200 OK` - Requisicao bem-sucedida
- `201 Created` - Recurso criado com sucesso

### Codigos de Erro do Cliente
- `400 Bad Request` - Dados invalidos ou faltando
- `401 Unauthorized` - Autenticacao falhou ou token invalido
- `403 Forbidden` - Usuario autenticado mas sem permissao
- `404 Not Found` - Recurso nao encontrado

### Codigos de Erro do Servidor
- `500 Internal Server Error` - Erro interno do servidor

---

## Modelos de Dados

### User

```typescript
{
  id: string (uuid)
  nome: string
  cpf: string (11 digitos, unico)
  email: string (unico)
  senha: string (hash bcrypt)
  tipo: "ADMIN" | "VEREADOR" | "JURIDICO"
  status: "PENDENTE" | "ATIVO" | "INATIVO"
  telefone?: string | null
  fotoPerfil?: string | null
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Ocorrencia

```typescript
{
  id: string (uuid)
  vereadorId: string
  titulo: string
  descricao: string
  categoria: "INFRAESTRUTURA" | "ILUMINACAO" | "LIMPEZA" | "SAUDE" | "EDUCACAO" | "SEGURANCA" | "TRANSPORTE" | "MEIO_AMBIENTE" | "OUTROS"
  endereco: string
  latitude?: number | null
  longitude?: number | null
  status: "PENDENTE" | "EM_ANALISE" | "RESOLVIDO" | "REJEITADO"
  prioridade: "BAIXA" | "MEDIA" | "ALTA"
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Foto

```typescript
{
  id: string (uuid)
  ocorrenciaId: string
  urlFoto: string
  thumbnailUrl?: string | null
  ordem: number
  createdAt: DateTime
}
```

### Historico

```typescript
{
  id: string (uuid)
  ocorrenciaId: string
  usuarioId: string
  acao: string
  comentario?: string | null
  createdAt: DateTime
}
```

### Notificacao

```typescript
{
  id: string (uuid)
  usuarioId: string
  tipo: string
  titulo: string
  mensagem: string
  lida: boolean
  createdAt: DateTime
}
```

---

## Rate Limiting

A API possui rate limiting configurado:

- **Limite:** 100 requisicoes por IP
- **Janela:** 15 minutos
- **Headers de resposta:**
  - `X-RateLimit-Limit`: Limite maximo
  - `X-RateLimit-Remaining`: Requisicoes restantes
  - `X-RateLimit-Reset`: Timestamp do reset

**Quando exceder o limite:**

**429 Too Many Requests**
```json
{
  "error": "Too many requests, please try again later."
}
```

---

## Autenticacao JWT

O token JWT possui as seguintes caracteristicas:

- **Algoritmo:** HS256
- **Expiracao:** 2 horas (configuravel)
- **Payload:**
  ```json
  {
    "userId": "uuid",
    "userType": "VEREADOR",
    "iat": 1234567890,
    "exp": 1234574890
  }
  ```

**Como usar:**

Inclua o token no header de todas as requisicoes autenticadas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Exemplos de Uso

### Fluxo completo: Criar ocorrencia

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'joao@example.com',
    senha: 'senha123'
  })
});

const { token } = await loginResponse.json();

// 2. Criar ocorrencia com fotos
const formData = new FormData();
formData.append('titulo', 'Buraco na rua');
formData.append('descricao', 'Grande buraco causando acidentes');
formData.append('categoria', 'INFRAESTRUTURA');
formData.append('endereco', 'Rua X, 123');
formData.append('latitude', '-23.550520');
formData.append('longitude', '-46.633308');
formData.append('prioridade', 'ALTA');
formData.append('fotos', file1);
formData.append('fotos', file2);

const ocorrenciaResponse = await fetch('http://localhost:3000/api/ocorrencias', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const ocorrencia = await ocorrenciaResponse.json();
console.log('Ocorrencia criada:', ocorrencia.id);
```

---

## Changelog da API

### v1.0.0 (2025-11-02)
- Release inicial
- Endpoints de autenticacao
- CRUD de ocorrencias
- Sistema de notificacoes
- Upload de imagens
- Rate limiting

---

## Suporte

Para questoes sobre a API:
- Consulte o [README.md](./README.md) para setup
- Veja [ARQUITETURA.md](./ARQUITETURA.md) para detalhes do sistema
- Leia [FAQ.md](./FAQ.md) para perguntas frequentes
