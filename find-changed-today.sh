#!/bin/bash
echo "📅 Archivos modificados hoy (excluyendo .next):"
echo "=============================================="
find . -type f -not -path "./.next/*" -newermt "$(date +%F)" -print | sort
