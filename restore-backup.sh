#!/bin/zsh

file="src/components/debug/__tests__/StorageQuickActions.test.tsx"

# Paso 1: Renombrar si existe
if [ -f "${file}.backup-COMPLETE-2300" ]; then
  echo "✅ Backup encontrado: renombrando a FINAL"
  mv "${file}.backup-COMPLETE-2300" "${file}.backup-FINAL"
else
  echo "⚠️  No se encontró backup-COMPLETE-2300"
fi

# Paso 2: Borrar otros backups
echo "🧹 Eliminando otros backups..."
setopt +o nomatch
rm -f "${file}.backup"*
setopt -o nomatch

# Paso 3: Renombrar a COMPLETE si existe
if [ -f "${file}.backup-FINAL" ]; then
  echo "✅ Renombrando FINAL a COMPLETE"
  mv "${file}.backup-FINAL" "${file}.backup-COMPLETE"
else
  echo "⚠️  No se encontró backup-FINAL"
fi
