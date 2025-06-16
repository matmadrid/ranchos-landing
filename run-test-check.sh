#!/bin/bash
# run-test-check.sh
# Script para ejecutar verificación completa de tests

echo "🚀 Ejecutando verificación completa de archivos de test..."
echo "=========================================================="

# Ejecutar el script de verificación
bash check-existing-tests.sh

echo
echo "📋 ACCIONES RECOMENDADAS:"
echo "========================="

echo
echo "1️⃣ Si faltan archivos de test, créalos con:"
echo "bash create-test-files.sh"

echo
echo "2️⃣ Para ver la lista completa de tests:"
echo "cat test-files-summary.md"

echo
echo "3️⃣ Para copiar contenido desde artifacts:"
echo "- StorageManager.test.ts → copia desde paste-3.txt"
echo "- Otros tests → usa los artifacts correspondientes"

echo
echo "4️⃣ Para ejecutar los tests:"
echo "npm test"

echo
echo "=========================================================="
