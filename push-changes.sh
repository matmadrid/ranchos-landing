#!/bin/bash
# push-changes.sh

echo "🔍 Verificando cambios en el repositorio..."
git status

echo ""
echo "📄 Archivos modificados o nuevos:"
git diff --name-only
git ls-files --others --exclude-standard

echo ""
echo -n "¿Deseas hacer commit y push de estos cambios? (s/n): "
read confirm

if [[ "$confirm" != "s" ]]; then
  echo "❌ Operación cancelada."
  exit 1
fi

echo "✅ Agregando todos los cambios..."
git add -A

echo -n "📝 Ingresa un mensaje para el commit: "
read commit_msg

if [[ -z "$commit_msg" ]]; then
  commit_msg="Actualiza cambios locales"
fi

git commit -m "$commit_msg"

echo "🚀 Enviando a GitHub..."
git push origin main

echo "✅ ¡Listo! Cambios subidos correctamente."
