# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.1.0] - 2025-01-08

### 🚀 Melhorias de Performance

#### Índices no Banco de Dados
- **Adicionados 15 índices** no PostgreSQL para otimizar queries
  - `User`: tipo, status, createdAt
  - `Ocorrencia`: vereadorId, status, categoria, prioridade, createdAt
  - `Foto`: ocorrenciaId
  - `Historico`: ocorrenciaId, usuarioId, createdAt
  - `Notificacao`: usuarioId, lida, createdAt

**Impacto**: Queries 3-10x mais rápidas em tabelas grandes

#### Validação de Paginação
- **Criado helper** `utils/pagination.js`
- **Limite máximo**: 100 itens por página
- **Aplicado em todos controllers**
- **Previne**: Queries muito pesadas

### 🔒 Melhorias de Segurança

#### CSRF Protection (Opcional)
- **Middleware customizado** implementado
- **Endpoint**: `GET /api/csrf/token`
- **Documentação**: `CSRF_PROTECTION.md`

#### Correções de Configuração
- **Removido IP hardcoded**
- **Detecção automática** de IP de rede

### ⚡ Melhorias de Confiabilidade

#### Transações Atômicas
- **Criação de ocorrências** usa `prisma.$transaction`
- **Garante integridade** de dados
- **Upload paralelo** de fotos

### 📱 Mobile App

#### Nova Tela de Notificações
- Tela completa com ícones e cores
- Marcar como lida
- Pull-to-refresh

#### Melhorias GPS
- Sistema de retry em 3 níveis
- Botão manual "Obter GPS"

#### Edição de Status (JURIDICO)
- Modal interativo
- Comentário obrigatório

#### Aprovação de Usuários (ADMIN)
- Seleção de tipo na aprovação
- Descrição de permissões

## [1.0.0] - 2025-01-07

### ✨ Features Iniciais

- Sistema de autenticação JWT
- CRUD completo de ocorrências
- Upload de fotos para Cloudinary
- Sistema de notificações
- Gestão de usuários (Admin)
- Mobile app React Native
- Backend Node.js + Express + PostgreSQL
