@echo off
REM Script de Backup Simples para Windows

echo ============================================================
echo   BACKUP DO BANCO DE DADOS
echo ============================================================
echo.

node scripts\backup.js %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha ao executar backup
    pause
    exit /b 1
)

pause
