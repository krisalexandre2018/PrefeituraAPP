# Politica de Seguranca

## Versoes Suportadas

| Versao | Suportada          |
| ------ | ------------------ |
| 1.0.x  | :white_check_mark: |
| < 1.0  | :x:                |

---

## Reportar Vulnerabilidades

A seguranca do Sistema de Ocorrencias Urbanas e levada a serio. Se voce descobrir uma vulnerabilidade, por favor, nos ajude seguindo as diretrizes abaixo.

### Como Reportar

**NAO** abra uma issue publica para vulnerabilidades de seguranca.

Em vez disso:

1. **Email:** Envie um email para [seu-email@exemplo.com] com:
   - Descricao detalhada da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sugestoes de correcao (se houver)

2. **Resposta:** Voce receberao uma resposta em ate 48 horas

3. **Correcao:** Trabalharemos para corrigir a vulnerabilidade o mais rapido possivel

4. **Divulgacao:** Apos a correcao, a vulnerabilidade sera divulgada publicamente com os creditos apropriados

### O que Esperamos

- Tempo razoavel para corrigirmos a vulnerabilidade antes da divulgacao publica
- Nao explorar a vulnerabilidade alem do necessario para demonstra-la
- Nao acessar ou modificar dados de terceiros

### O que Voce Pode Esperar

- Reconhecimento publico (se desejar)
- Atualizacoes regulares sobre o progresso da correcao
- Notificacao quando a vulnerabilidade for corrigida

---

## Praticas de Seguranca Implementadas

### Autenticacao e Autorizacao

#### JWT (JSON Web Tokens)
- **Algoritmo:** HS256
- **Expiracao:** 2 horas (configuravel)
- **Secret:** Armazenado em variavel de ambiente
- **Payload:** Apenas userId e userType (sem dados sensiveis)

```javascript
// Exemplo de token
{
  "userId": "uuid",
  "userType": "VEREADOR",
  "iat": 1234567890,
  "exp": 1234574890
}
```

#### Senhas
- **Hash:** bcrypt com 10 salt rounds
- **Politica:** Minimo 6 caracteres (recomendamos aumentar para 8+)
- **Armazenamento:** Apenas hashes, nunca senhas em texto plano

```javascript
// Exemplo de hash
const hashedPassword = await bcrypt.hash(senha, 10);
```

### Protecao de Dados

#### Dados Sensiveis
- CPF: Armazenado mas nunca exposto em logs
- Senhas: Hasheadas com bcrypt
- Tokens: Nao armazenados no banco, apenas em memoria

#### HTTPS
- **Producao:** Sempre use HTTPS
- **Desenvolvimento:** HTTP e aceitavel localmente

### Rate Limiting

Protecao contra ataques de forca bruta:

- **Limite:** 100 requisicoes por IP
- **Janela:** 15 minutos
- **Rotas:** Todas as rotas `/api/*`

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### Validacao de Dados

Todas as entradas sao validadas:

```javascript
// Express-validator
body('email').isEmail(),
body('cpf').isLength({ min: 11, max: 11 }),
body('senha').isLength({ min: 6 })
```

### Upload de Arquivos

#### Restricoes
- **Tipo:** Apenas imagens (image/*)
- **Tamanho:** Maximo 5MB por arquivo
- **Quantidade:** Ate 5 fotos por ocorrencia

```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens sao permitidas'));
    }
  }
});
```

### SQL Injection

- **Prisma ORM:** Usa prepared statements automaticamente
- **Validacao:** Todas as queries sao validadas

### CORS

Configuracao adequada de CORS:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

**Producao:** Configure `FRONTEND_URL` para o dominio especifico.

### Logs de Auditoria

Sistema de historico registra:
- Quem criou a ocorrencia
- Quem alterou o status
- Quando foi alterado
- Comentarios das alteracoes

### Variaveis de Ambiente

Credenciais nunca devem estar no codigo:

```env
# .env (NUNCA commitar!)
JWT_SECRET="chave_super_secreta"
DATABASE_URL="postgresql://..."
CLOUDINARY_API_SECRET="..."
EMAIL_PASS="..."
```

---

## Checklist de Seguranca

Antes de fazer deploy em producao:

### Backend

- [ ] `JWT_SECRET` e uma string forte e aleatoria
- [ ] `DATABASE_URL` usa credenciais seguras
- [ ] Variavel `NODE_ENV=production` esta configurada
- [ ] CORS esta configurado para dominio especifico
- [ ] HTTPS esta ativado
- [ ] Rate limiting esta ativo
- [ ] Logs nao expoem dados sensiveis
- [ ] `.env` esta no `.gitignore`
- [ ] Backups automaticos do banco estao configurados

### Mobile

- [ ] URL da API aponta para HTTPS
- [ ] Tokens sao armazenados com seguranca (AsyncStorage)
- [ ] App nao loga dados sensiveis
- [ ] Permissoes minimas necessarias

### Banco de Dados

- [ ] PostgreSQL esta atualizado
- [ ] Senha do banco e forte
- [ ] Acesso remoto e restrito
- [ ] Backups estao funcionando
- [ ] SSL/TLS esta ativado

---

## Dependencias

### Gerenciamento

Mantenha dependencias atualizadas:

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir automaticamente (quando possivel)
npm audit fix

# Backend
cd backend && npm update

# Mobile
cd mobile && npm update
```

### Dependencias Criticas

Acompanhe atualizacoes de seguranca para:

- `express`
- `jsonwebtoken`
- `bcryptjs`
- `@prisma/client`
- `multer`
- `nodemailer`

---

## Configuracoes Recomendadas

### PostgreSQL

```sql
-- Criar usuario com permissoes limitadas
CREATE USER vereadores_app WITH PASSWORD 'senha_forte';
GRANT CONNECT ON DATABASE vereadores_db TO vereadores_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vereadores_app;
```

### Nginx (se usar)

```nginx
# Rate limiting adicional
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
  listen 443 ssl;

  # SSL
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  # Headers de seguranca
  add_header X-Frame-Options "SAMEORIGIN";
  add_header X-Content-Type-Options "nosniff";
  add_header X-XSS-Protection "1; mode=block";

  location /api/ {
    limit_req zone=api burst=20;
    proxy_pass http://localhost:3000;
  }
}
```

---

## Incident Response

### Em Caso de Brecha

1. **Isolar:** Desconecte o sistema imediatamente
2. **Avaliar:** Determine o impacto e dados comprometidos
3. **Notificar:** Informe usuarios afetados
4. **Corrigir:** Implemente patches de seguranca
5. **Monitorar:** Acompanhe por atividades suspeitas
6. **Documentar:** Registre o incidente e licoes aprendidas

### Contatos de Emergencia

- Admin do Sistema: [seu-email@exemplo.com]
- Equipe Tecnica: [tech@exemplo.com]

---

## Compliance

### LGPD (Lei Geral de Protecao de Dados)

O sistema coleta e armazena:

- **Dados Pessoais:** Nome, CPF, email, telefone
- **Dados de Localizacao:** GPS das ocorrencias
- **Finalidade:** Gestao de ocorrencias urbanas

#### Direitos dos Usuarios

Usuarios podem solicitar:
- Acesso aos seus dados
- Correcao de dados incorretos
- Exclusao de dados (direito ao esquecimento)

#### Retencao de Dados

- **Usuarios ativos:** Mantidos indefinidamente
- **Usuarios inativos:** Revisar politica de retencao
- **Ocorrencias:** Mantidas para historico publico

---

## Atualizacoes de Seguranca

Este documento sera atualizado conforme novas praticas de seguranca forem implementadas.

**Ultima atualizacao:** 2025-11-02

---

## Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Seguranca e responsabilidade de todos. Se vir algo suspeito, reporte!**
