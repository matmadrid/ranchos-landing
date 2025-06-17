#!/bin/bash

# Buscar archivos modificados hoy, excluyendo .next y .git
files=$(find . -type f -not -path "./.next/*" -not -path "./.git/*" -newermt "$(date +%F)" -print)

if [ -z "$files" ]; then
  echo "No hay archivos modificados hoy para sincronizar."
  exit 0
fi

echo "Archivos modificados hoy:"
echo "$files"
echo

read -p "¿Quieres añadir estos archivos a git? (s/n): " confirm_add
if [[ "$confirm_add" =~ ^[Ss]$ ]]; then
  git add $files
else
  echo "No se añadieron archivos."
  exit 0
fi

read -p "¿Quieres hacer commit de los cambios? (s/n): " confirm_commit
if [[ "$confirm_commit" =~ ^[Ss]$ ]]; then
  read -p "Escribe el mensaje de commit (o presiona Enter para uno automático): " commit_msg
  if [ -z "$commit_msg" ]; then
    commit_msg="Actualización automática de archivos modificados hoy: $(date +'%Y-%m-%d %H:%M:%S')"
  fi
  git commit -m "$commit_msg"
else
  echo "No se hizo commit."
  exit 0
fi

read -p "¿Quieres hacer push a GitHub ahora? (s/n): " confirm_push
if [[ "$confirm_push" =~ ^[Ss]$ ]]; then
  git push
  echo "Cambios enviados a GitHub."
else
  echo "No se hizo push."
fi
