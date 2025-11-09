#!/bin/bash

# Script de Backup Simples para Linux/Mac

echo "============================================================"
echo "  BACKUP DO BANCO DE DADOS"
echo "============================================================"
echo ""

node scripts/backup.js "$@"

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERRO] Falha ao executar backup"
    exit 1
fi
