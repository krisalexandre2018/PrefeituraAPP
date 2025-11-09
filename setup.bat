@echo off
REM Setup Script para Windows - Sistema de Ocorrências Urbanas

echo ============================================================
echo   SETUP DO SISTEMA DE OCORRENCIAS URBANAS - WINDOWS
echo ============================================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Baixe em: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js encontrado

REM Verificar NPM
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] NPM nao encontrado!
    pause
    exit /b 1
)
echo [OK] NPM encontrado

REM Verificar Docker (opcional)
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker encontrado
    set HAS_DOCKER=1
) else (
    echo [AVISO] Docker nao encontrado - sera necessario PostgreSQL local
    set HAS_DOCKER=0
)

echo.
echo ============================================================
echo   Configurando Arquivos de Ambiente
echo ============================================================
echo.

REM Criar .env do backend se não existir
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env"
        echo [OK] Criado backend\.env
        echo [IMPORTANTE] Configure as variaveis em backend\.env
    ) else (
        echo [AVISO] backend\.env.example nao encontrado
    )
) else (
    echo [OK] backend\.env ja existe
)

REM Criar .env raiz se não existir
if not exist ".env" (
    if exist ".env.docker" (
        copy ".env.docker" ".env"
        echo [OK] Criado .env na raiz
    )
)

echo.
echo ============================================================
echo   Instalando Dependencias
echo ============================================================
echo.

echo Instalando dependencias do monorepo...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do monorepo
    pause
    exit /b 1
)

echo.
echo Instalando dependencias do backend...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do backend
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo Instalando dependencias do mobile...
cd mobile
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do mobile
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ============================================================
echo   Configurando Banco de Dados
echo ============================================================
echo.

if %HAS_DOCKER% EQU 1 (
    echo Iniciando PostgreSQL com Docker...
    docker-compose up -d postgres
    if %ERRORLEVEL% EQU 0 (
        echo Aguardando PostgreSQL inicializar...
        timeout /t 10 /nobreak >nul

        echo Gerando Prisma Client...
        cd backend
        call npx prisma generate

        echo Executando migrations...
        call npx prisma migrate dev
        cd ..
    ) else (
        echo [AVISO] Falha ao iniciar Docker. Configure manualmente.
    )
) else (
    echo [AVISO] Docker nao disponivel. Execute manualmente:
    echo   npm run prisma:generate
    echo   npm run prisma:migrate
)

echo.
echo ============================================================
echo   SETUP CONCLUIDO!
echo ============================================================
echo.
echo Proximos Passos:
echo.
echo 1. Configure as variaveis de ambiente em backend\.env
echo.
echo 2. Inicie o ambiente de desenvolvimento:
echo    npm run dev
echo.
echo 3. Ou inicie separadamente:
echo    npm run dev:backend  (Backend na porta 3000)
echo    npm run dev:mobile   (Mobile com Expo)
echo.
echo 4. Acesse o Prisma Studio (opcional):
echo    npm run prisma:studio
echo.
echo 5. Validar configuracao:
echo    npm run validate:env
echo.

if %HAS_DOCKER% EQU 1 (
    echo Docker:
    echo    docker-compose logs -f postgres    (Ver logs)
    echo    docker-compose --profile admin up -d  (Iniciar PgAdmin)
    echo    PgAdmin: http://localhost:5050
    echo.
)

echo Pressione qualquer tecla para sair...
pause >nul
