# API - Sistema de Ocorrências Urbanas

## Informações Gerais

**Base URL:** `http://localhost:3000/api`

**Autenticação:** Bearer Token (JWT)

**Rate Limiting:** 100 requisições por 15 minutos por IP

---

## Autenticação

### POST /auth/register
Registrar novo vereador (requer aprovação do admin)

**Body:**
```json
{
  "nome": "João Silva",
  "cpf": "12345678901",
  "email": "joao@email.com",
  "senha": "senha123",
  "telefone": "11999999999"
}
```

**Resposta (201):**
```json
{
  "message": "Cadastro realizado! Aguarde a aprovação do administrador.",
  "user": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@email.com",
    "status": "PENDENTE"
  }
}
```

---

### POST /auth/login
Fazer login

**Body:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@email.com",
    "tipo": "VEREADOR",
    "fotoPerfil": null
  }
}
```

---

### GET /auth/me
Obter dados do usuário logado

**Headers:** `Authorization: Bearer {token}`

**Resposta (200):**
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "email": "joao@email.com",
  "cpf": "12345678901",
  "telefone": "11999999999",
  "tipo": "VEREADOR",
  "status": "ATIVO",
  "fotoPerfil": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### PATCH /auth/profile
Atualizar perfil do usuário logado

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "nome": "João Silva Santos",
  "email": "joao.novo@email.com",
  "telefone": "11988888888"
}
```

---

### PATCH /auth/change-password
Alterar senha

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "senhaAtual": "senha123",
  "novaSenha": "novaSenha456"
}
```

---

### POST /auth/forgot-password
Solicitar recuperação de senha

**Body:**
```json
{
  "email": "joao@email.com"
}
```

**Resposta (200):**
```json
{
  "message": "Se o email existir, um link de recuperação será enviado"
}
```

---

### POST /auth/reset-password
Resetar senha com token

**Body:**
```json
{
  "token": "token_recebido_por_email",
  "novaSenha": "novaSenha789"
}
```

---

## Ocorrências

### POST /ocorrencias
Criar nova ocorrência (apenas vereadores)

**Headers:** `Authorization: Bearer {token}`

**Content-Type:** `multipart/form-data`

**Body (FormData):**
```
titulo: "Buraco na Rua Principal"
descricao: "Grande buraco causando acidentes"
categoria: "INFRAESTRUTURA"
endereco: "Rua Principal, 123"
latitude: -23.5505
longitude: -46.6333
prioridade: "ALTA"
fotos: [arquivo1.jpg, arquivo2.jpg] (máx 5 fotos, 5MB cada)
```

**Resposta (201):**
```json
{
  "id": "uuid",
  "titulo": "Buraco na Rua Principal",
  "descricao": "Grande buraco causando acidentes",
  "categoria": "INFRAESTRUTURA",
  "endereco": "Rua Principal, 123",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "status": "PENDENTE",
  "prioridade": "ALTA",
  "vereadorId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "fotos": [
    {
      "id": "uuid",
      "urlFoto": "https://cloudinary.com/...",
      "thumbnailUrl": "https://cloudinary.com/...",
      "ordem": 0
    }
  ],
  "vereador": {
    "nome": "João Silva",
    "email": "joao@email.com"
  }
}
```

---

### GET /ocorrencias
Listar ocorrências (com filtros e paginação)

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status`: PENDENTE | EM_ANALISE | RESOLVIDO | REJEITADO
- `categoria`: INFRAESTRUTURA | ILUMINACAO | LIMPEZA | SAUDE | etc
- `vereadorId`: uuid (apenas admin/jurídico)
- `page`: número da página (default: 1)
- `limit`: itens por página (default: 10)

**Exemplo:** `/ocorrencias?status=PENDENTE&page=1&limit=10`

**Resposta (200):**
```json
{
  "ocorrencias": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### GET /ocorrencias/stats
Estatísticas de ocorrências (apenas admin/jurídico)

**Headers:** `Authorization: Bearer {token}`

**Resposta (200):**
```json
{
  "total": 150,
  "pendentes": 30,
  "emAnalise": 50,
  "resolvidas": 60,
  "porCategoria": [
    { "categoria": "INFRAESTRUTURA", "_count": 40 },
    { "categoria": "ILUMINACAO", "_count": 25 }
  ]
}
```

---

### GET /ocorrencias/:id
Obter detalhes de uma ocorrência

**Headers:** `Authorization: Bearer {token}`

**Resposta (200):**
```json
{
  "id": "uuid",
  "titulo": "Buraco na Rua Principal",
  "descricao": "Grande buraco causando acidentes",
  "categoria": "INFRAESTRUTURA",
  "status": "EM_ANALISE",
  "fotos": [...],
  "vereador": {...},
  "historicos": [
    {
      "id": "uuid",
      "acao": "CRIADA",
      "comentario": "Ocorrência criada",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "usuario": {
        "nome": "João Silva",
        "tipo": "VEREADOR"
      }
    }
  ]
}
```

---

### PATCH /ocorrencias/:id/status
Atualizar status (apenas admin/jurídico)

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "status": "EM_ANALISE",
  "comentario": "Ocorrência em análise pela equipe jurídica"
}
```

---

### DELETE /ocorrencias/:id
Deletar ocorrência

**Headers:** `Authorization: Bearer {token}`

**Regras:**
- Vereador: apenas suas ocorrências com status PENDENTE
- Admin: qualquer ocorrência

---

## Usuários (Admin apenas)

### GET /users
Listar todos os usuários

**Headers:** `Authorization: Bearer {token}` (Admin)

**Query Parameters:**
- `tipo`: ADMIN | VEREADOR | JURIDICO
- `status`: PENDENTE | ATIVO | INATIVO
- `page`: número da página
- `limit`: itens por página

---

### GET /users/pending
Listar usuários pendentes de aprovação

**Headers:** `Authorization: Bearer {token}` (Admin)

---

### GET /users/stats
Estatísticas de usuários

**Headers:** `Authorization: Bearer {token}` (Admin)

**Resposta (200):**
```json
{
  "total": 50,
  "ativos": 40,
  "pendentes": 5,
  "inativos": 5,
  "porTipo": [
    { "tipo": "VEREADOR", "_count": 30 },
    { "tipo": "JURIDICO", "_count": 15 },
    { "tipo": "ADMIN", "_count": 5 }
  ]
}
```

---

### GET /users/:id
Obter detalhes de um usuário

**Headers:** `Authorization: Bearer {token}` (Admin)

---

### PATCH /users/:id/approve
Aprovar usuário pendente

**Headers:** `Authorization: Bearer {token}` (Admin)

---

### PATCH /users/:id/deactivate
Desativar usuário

**Headers:** `Authorization: Bearer {token}` (Admin)

**Body (opcional):**
```json
{
  "motivo": "Violação das políticas de uso"
}
```

---

### PATCH /users/:id/reactivate
Reativar usuário

**Headers:** `Authorization: Bearer {token}` (Admin)

---

### PATCH /users/:id/type
Alterar tipo de usuário

**Headers:** `Authorization: Bearer {token}` (Admin)

**Body:**
```json
{
  "tipo": "JURIDICO"
}
```

---

### POST /users/profile-picture
Upload de foto de perfil

**Headers:** `Authorization: Bearer {token}`

**Content-Type:** `multipart/form-data`

**Body (FormData):**
```
foto: arquivo.jpg (máx 2MB)
```

---

### DELETE /users/:id
Deletar usuário permanentemente

**Headers:** `Authorization: Bearer {token}` (Admin)

**Nota:** Apenas usuários sem ocorrências podem ser deletados

---

## Notificações

### GET /notificacoes
Listar notificações do usuário logado

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `lida`: true | false
- `tipo`: string
- `page`: número da página
- `limit`: itens por página

---

### GET /notificacoes/unread-count
Contar notificações não lidas

**Headers:** `Authorization: Bearer {token}`

**Resposta (200):**
```json
{
  "count": 5
}
```

---

### GET /notificacoes/:id
Obter detalhes de uma notificação (marca como lida automaticamente)

**Headers:** `Authorization: Bearer {token}`

---

### PATCH /notificacoes/:id/read
Marcar notificação como lida

**Headers:** `Authorization: Bearer {token}`

---

### PATCH /notificacoes/:id/unread
Marcar notificação como não lida

**Headers:** `Authorization: Bearer {token}`

---

### PATCH /notificacoes/read-all
Marcar todas como lidas

**Headers:** `Authorization: Bearer {token}`

---

### DELETE /notificacoes/:id
Deletar uma notificação

**Headers:** `Authorization: Bearer {token}`

---

### DELETE /notificacoes/read-all
Deletar todas as notificações lidas

**Headers:** `Authorization: Bearer {token}`

---

### POST /notificacoes
Criar notificação (apenas admin)

**Headers:** `Authorization: Bearer {token}` (Admin)

**Body:**
```json
{
  "usuarioId": "uuid",
  "tipo": "AVISO",
  "titulo": "Manutenção Programada",
  "mensagem": "O sistema ficará indisponível das 2h às 4h"
}
```

---

## Códigos de Status HTTP

- **200** OK - Requisição bem-sucedida
- **201** Created - Recurso criado com sucesso
- **400** Bad Request - Erro de validação ou dados inválidos
- **401** Unauthorized - Token ausente, inválido ou expirado
- **403** Forbidden - Usuário não tem permissão
- **404** Not Found - Recurso não encontrado
- **429** Too Many Requests - Rate limit excedido
- **500** Internal Server Error - Erro no servidor

---

## Testes Manuais Sugeridos

### 1. Fluxo Completo de Registro e Aprovação

**a) Registrar Vereador:**
```bash
POST /api/auth/register
Body: {
  "nome": "Teste Vereador",
  "cpf": "11111111111",
  "email": "vereador@test.com",
  "senha": "senha123",
  "telefone": "11999999999"
}
```

**b) Login como Admin e Aprovar:**
```bash
POST /api/auth/login
Body: {
  "email": "admin@test.com",
  "senha": "admin123"
}

GET /api/users/pending
PATCH /api/users/{id}/approve
```

**c) Login como Vereador:**
```bash
POST /api/auth/login
Body: {
  "email": "vereador@test.com",
  "senha": "senha123"
}
```

---

### 2. Fluxo de Criação de Ocorrência

**a) Login como Vereador**

**b) Criar Ocorrência com Fotos:**
```bash
POST /api/ocorrencias
FormData:
  titulo: "Buraco Avenida Brasil"
  descricao: "Buraco grande na via"
  categoria: "INFRAESTRUTURA"
  endereco: "Av. Brasil, 1000"
  prioridade: "ALTA"
  fotos: [img1.jpg, img2.jpg]
```

**c) Listar Ocorrências:**
```bash
GET /api/ocorrencias
```

**d) Verificar Email Jurídico (deve ter recebido notificação)**

---

### 3. Fluxo de Atualização de Status

**a) Login como Jurídico/Admin**

**b) Listar Ocorrências Pendentes:**
```bash
GET /api/ocorrencias?status=PENDENTE
```

**c) Atualizar Status:**
```bash
PATCH /api/ocorrencias/{id}/status
Body: {
  "status": "EM_ANALISE",
  "comentario": "Em análise"
}
```

**d) Verificar Notificação do Vereador:**
```bash
GET /api/notificacoes (como vereador)
```

---

### 4. Teste de Autorização

**a) Tentar criar ocorrência como Admin (deve falhar)**

**b) Tentar aprovar usuário como Vereador (deve falhar)**

**c) Tentar acessar ocorrência de outro vereador (deve falhar)**

---

### 5. Teste de Validação

**a) Registrar com CPF inválido:**
```bash
POST /api/auth/register
Body: { "cpf": "123" } // Deve retornar erro
```

**b) Criar ocorrência sem título:**
```bash
POST /api/ocorrencias
Body: { "descricao": "teste" } // Deve retornar erro
```

**c) Atualizar status com valor inválido:**
```bash
PATCH /api/ocorrencias/{id}/status
Body: { "status": "INVALIDO" } // Deve retornar erro
```

---

### 6. Teste de Recuperação de Senha

**a) Solicitar recuperação:**
```bash
POST /api/auth/forgot-password
Body: { "email": "vereador@test.com" }
```

**b) Verificar email recebido com token**

**c) Resetar senha:**
```bash
POST /api/auth/reset-password
Body: {
  "token": "token_do_email",
  "novaSenha": "novaSenha456"
}
```

**d) Login com nova senha**

---

### 7. Teste de Upload

**a) Upload de foto de perfil:**
```bash
POST /api/users/profile-picture
FormData: { foto: perfil.jpg }
```

**b) Verificar URL no Cloudinary**

**c) Tentar upload com arquivo muito grande (>2MB - deve falhar)**

**d) Tentar upload de arquivo não-imagem (deve falhar)**

---

### 8. Teste de Paginação

**a) Criar 25 ocorrências**

**b) Listar com paginação:**
```bash
GET /api/ocorrencias?page=1&limit=10
GET /api/ocorrencias?page=2&limit=10
GET /api/ocorrencias?page=3&limit=10
```

**c) Verificar total e número de páginas**

---

### 9. Teste de Estatísticas

**a) Login como Admin**

**b) Obter stats de usuários:**
```bash
GET /api/users/stats
```

**c) Obter stats de ocorrências:**
```bash
GET /api/ocorrencias/stats
```

---

### 10. Teste de Rate Limiting

**a) Fazer 101 requisições em menos de 15 minutos**

**b) A 101ª deve retornar erro 429**

---

## Variáveis de Ambiente Necessárias

Consulte o arquivo `.env.example` para todas as variáveis necessárias.

**Principais:**
- `DATABASE_URL` - Conexão PostgreSQL
- `JWT_SECRET` - Chave secreta JWT
- `CLOUDINARY_*` - Credenciais Cloudinary
- `EMAIL_*` - Configuração SMTP
- `FRONTEND_URL` - URL do frontend para CORS
