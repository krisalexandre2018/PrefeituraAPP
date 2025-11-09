#!/bin/bash

# Setup Script para Linux/Mac - Sistema de Ocorrências Urbanas

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "============================================================"
echo "  SETUP DO SISTEMA DE OCORRÊNCIAS URBANAS"
echo "============================================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERRO] Node.js não encontrado!${NC}"
    echo "Baixe em: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}[OK] Node.js encontrado$(node --version)${NC}"

# Verificar NPM
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERRO] NPM não encontrado!${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] NPM encontrado $(npm --version)${NC}"

# Verificar Docker (opcional)
HAS_DOCKER=0
if command -v docker &> /dev/null; then
    echo -e "${GREEN}[OK] Docker encontrado$(docker --version)${NC}"
    HAS_DOCKER=1
else
    echo -e "${YELLOW}[AVISO] Docker não encontrado - será necessário PostgreSQL local${NC}"
fi

echo ""
echo "============================================================"
echo "  Configurando Arquivos de Ambiente"
echo "============================================================"
echo ""

# Criar .env do backend se não existir
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp "backend/.env.example" "backend/.env"
        echo -e "${GREEN}[OK] Criado backend/.env${NC}"
        echo -e "${YELLOW}[IMPORTANTE] Configure as variáveis em backend/.env${NC}"
    else
        echo -e "${YELLOW}[AVISO] backend/.env.example não encontrado${NC}"
    fi
else
    echo -e "${GREEN}[OK] backend/.env já existe${NC}"
fi

# Criar .env raiz se não existir
if [ ! -f ".env" ]; then
    if [ -f ".env.docker" ]; then
        cp ".env.docker" ".env"
        echo -e "${GREEN}[OK] Criado .env na raiz${NC}"
    fi
fi

echo ""
echo "============================================================"
echo "  Instalando Dependências"
echo "============================================================"
echo ""

echo "Instalando dependências do monorepo..."
npm install

echo ""
echo "Instalando dependências do backend..."
cd backend
npm install
cd ..

echo ""
echo "Instalando dependências do mobile..."
cd mobile
npm install
cd ..

echo ""
echo "============================================================"
echo "  Configurando Banco de Dados"
echo "============================================================"
echo ""

if [ $HAS_DOCKER -eq 1 ]; then
    echo "Iniciando PostgreSQL com Docker..."
    docker-compose up -d postgres

    if [ $? -eq 0 ]; then
        echo "Aguardando PostgreSQL inicializar..."
        sleep 10

        echo "Gerando Prisma Client..."
        cd backend
        npx prisma generate

        echo "Executando migrations..."
        npx prisma migrate dev
        cd ..
    else
        echo -e "${YELLOW}[AVISO] Falha ao iniciar Docker. Configure manualmente.${NC}"
    fi
else
    echo -e "${YELLOW}[AVISO] Docker não disponível. Execute manualmente:${NC}"
    echo "  npm run prisma:generate"
    echo "  npm run prisma:migrate"
fi

echo ""
echo "============================================================"
echo "  SETUP CONCLUÍDO!"
echo "============================================================"
echo ""
echo -e "${GREEN}Próximos Passos:${NC}"
echo ""
echo "1. Configure as variáveis de ambiente em backend/.env"
echo ""
echo "2. Inicie o ambiente de desenvolvimento:"
echo -e "   ${CYAN}npm run dev${NC}"
echo ""
echo "3. Ou inicie separadamente:"
echo -e "   ${CYAN}npm run dev:backend${NC}  (Backend na porta 3000)"
echo -e "   ${CYAN}npm run dev:mobile${NC}   (Mobile com Expo)"
echo ""
echo "4. Acesse o Prisma Studio (opcional):"
echo -e "   ${CYAN}npm run prisma:studio${NC}"
echo ""
echo "5. Validar configuração:"
echo -e "   ${CYAN}npm run validate:env${NC}"
echo ""

if [ $HAS_DOCKER -eq 1 ]; then
    echo "Docker:"
    echo -e "   ${CYAN}docker-compose logs -f postgres${NC}    (Ver logs)"
    echo -e "   ${CYAN}docker-compose --profile admin up -d${NC}  (Iniciar PgAdmin)"
    echo "   PgAdmin: http://localhost:5050"
    echo ""
fi

echo "Documentação adicional:"
echo "   README.md - Guia geral do projeto"
echo "   DEPLOY.md - Instruções de deploy"
echo ""
