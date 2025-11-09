# Sistema de Ocorrências Urbanas - Vereadores

Sistema completo para vereadores registrarem problemas urbanos com fotos e encaminharem para análise jurídica.

## 📋 Visão Geral

Este sistema permite que vereadores:
- Tirem fotos de problemas urbanos (buracos, iluminação, limpeza, etc)
- Registrem ocorrências com descrição e localização GPS
- Acompanhem o status (Pendente → Em Análise → Resolvido)
- Recebam notificações de atualizações

A equipe jurídica pode:
- Visualizar todas as ocorrências
- Atualizar status e adicionar comentários
- Gerar relatórios e estatísticas

O administrador pode:
- Aprovar cadastros de novos vereadores
- Gerenciar usuários
- Acessar relatórios completos

## 🏗️ Arquitetura

```
Prefeitura App/
├── backend/           # API REST (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── config/
│   └── prisma/        # Schema do banco de dados
│
├── mobile/            # App React Native (Expo)
│   ├── src/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── context/
│   │   └── services/
│   └── assets/
│
└── ARQUITETURA.md     # Documentação detalhada
```

## 🚀 Tecnologias

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT para autenticação
- Cloudinary para imagens
- Nodemailer para emails

### Mobile
- React Native + Expo
- React Navigation
- Expo Camera & Location
- AsyncStorage
- Axios

## 📦 Instalação Rápida

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd "Prefeitura App"
```

### 2. Configure o Backend
```bash
cd backend
npm install

# Configure o .env (copie de .env.example)
cp .env.example .env
# Edite o .env com suas credenciais

# Execute as migrations
npm run prisma:migrate

# Inicie o servidor
npm run dev
```

O backend estará em `http://localhost:3000`

### 3. Configure o Mobile
```bash
cd mobile
npm install

# Configure a URL da API em src/services/api.js
# Altere para o IP do seu computador

# Inicie o app
npm start
```

Escaneie o QR Code com o Expo Go no seu celular.

## 📚 Documentação Completa

- **[ARQUITETURA.md](./ARQUITETURA.md)** - Arquitetura completa do sistema
- **[backend/README.md](./backend/README.md)** - Documentação do backend
- **[mobile/README.md](./mobile/README.md)** - Documentação do app mobile

## 👥 Tipos de Usuários

### Vereador
- Criar e visualizar ocorrências
- Upload de fotos
- Acompanhar status
- Status inicial: **PENDENTE** (aguarda aprovação)

### Equipe Jurídica
- Visualizar todas ocorrências
- Atualizar status
- Adicionar comentários

### Admin
- Aprovar vereadores
- Gerenciar usuários
- Acessar relatórios

## 🔄 Fluxo de Uso

1. **Vereador se cadastra** no app
2. **Admin recebe email** e aprova cadastro
3. **Vereador faz login** e tira foto de problema
4. **Sistema captura GPS** e endereço automaticamente
5. **Vereador preenche** título, descrição e categoria
6. **Sistema envia email** para equipe jurídica
7. **Jurídico analisa** e atualiza status
8. **Vereador recebe notificação** da atualização

## 🗄️ Banco de Dados

### Principais Entidades

- **Users** (Vereadores, Jurídico, Admin)
- **Ocorrencias** (Título, descrição, status, localização)
- **Fotos** (URLs das imagens no Cloudinary)
- **Historico** (Log de alterações)
- **Notificacoes** (Alertas para usuários)

Ver schema completo em `backend/prisma/schema.prisma`

## 🔐 Segurança

- ✅ Senhas criptografadas (bcrypt)
- ✅ Autenticação JWT
- ✅ Rate limiting
- ✅ Validação de dados
- ✅ CORS configurável
- ✅ Logs de auditoria

## 💰 Custos Estimados

Usando serviços gratuitos para começar:

| Serviço | Gratuito | Custo Mensal |
|---------|----------|--------------|
| Hosting (Render/Railway) | ✅ | $0 - $10 |
| PostgreSQL | ✅ (até 1GB) | $0 - $5 |
| Cloudinary | ✅ (25GB) | $0 - $5 |
| Email (Gmail/SendGrid) | ✅ | $0 |
| **Total** | - | **~$0-20** |

## 📱 Screenshots

### App Mobile
- Login/Cadastro
- Lista de ocorrências
- Criar nova ocorrência (câmera + GPS)
- Detalhes com histórico
- Perfil do usuário

## 🚀 Deploy

### Backend (Render.com)
1. Crie conta no Render
2. Conecte repositório GitHub
3. Crie PostgreSQL Database
4. Crie Web Service
5. Configure variáveis de ambiente
6. Deploy automático!

### Mobile
```bash
# Gerar APK Android
eas build -p android --profile preview

# Publicar na Play Store
eas build -p android --profile production
eas submit -p android
```

## 🛠️ Scripts Úteis

### Backend
```bash
npm run dev              # Iniciar em desenvolvimento
npm run prisma:studio    # Visualizar banco de dados
npm run prisma:migrate   # Criar migration
```

### Mobile
```bash
npm start           # Iniciar Expo
npm run android     # Abrir no Android
npm run ios         # Abrir no iOS
expo start -c       # Limpar cache
```

## 📊 Funcionalidades Implementadas

### MVP ✅
- [x] Sistema de autenticação completo
- [x] Cadastro de vereadores (com aprovação)
- [x] Criar ocorrência com fotos
- [x] Upload para Cloudinary
- [x] Captura de GPS e endereço
- [x] Listagem de ocorrências
- [x] Detalhes com histórico
- [x] Atualização de status (jurídico)
- [x] Sistema de notificações
- [x] Emails automáticos

### Futuras Melhorias 📅
- [ ] Notificações push (Firebase)
- [ ] Dashboard web para admin
- [ ] Relatórios em PDF
- [ ] Gráficos e estatísticas
- [ ] Filtros avançados
- [ ] Busca de ocorrências
- [ ] Modo offline
- [ ] Editar ocorrências
- [ ] Comentários em threads
- [ ] Dark mode

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📞 Suporte

Em caso de dúvidas:
1. Consulte a documentação completa
2. Verifique os READMEs de cada módulo
3. Leia o troubleshooting nas docs

## 📄 Licença

MIT - Sinta-se livre para usar este projeto

---

## 🎯 Primeiros Passos

### Para Desenvolvedores

1. **Leia a [ARQUITETURA.md](./ARQUITETURA.md)** primeiro
2. **Configure o backend** seguindo [backend/README.md](./backend/README.md)
3. **Configure o mobile** seguindo [mobile/README.md](./mobile/README.md)
4. **Crie o primeiro admin** diretamente no banco:
   ```sql
   UPDATE users SET tipo = 'ADMIN', status = 'ATIVO' WHERE email = 'seu@email.com';
   ```

### Para Testar

1. Backend rodando em `http://localhost:3000`
2. Abra o app no Expo Go
3. Cadastre-se como vereador
4. Use o admin para aprovar
5. Faça login e crie ocorrência
6. Teste o fluxo completo!

## ✨ Agradecimentos

Sistema desenvolvido para facilitar a comunicação entre vereadores e o departamento jurídico, agilizando o registro e análise de problemas urbanos.

**Desenvolvido com ❤️ para melhorar a gestão pública**
