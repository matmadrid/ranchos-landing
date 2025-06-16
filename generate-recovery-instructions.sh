#!/bin/bash
# Script para generar instrucciones de recuperación actualizadas

FECHA=$(date +"%d de %B %Y")
HORA=$(date +"%H:%M:%S")
USUARIO=$(whoami)
MAQUINA=$(hostname)
RUTA_PROYECTO=$(pwd)
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
ULTIMO_COMMIT=$(git log -1 --pretty=format:"%h - %s" 2>/dev/null || echo "No Git")

cat > RECOVERY-INSTRUCTIONS.md << EOD
# 🚨 INSTRUCCIONES DE RECUPERACIÓN - PROYECTO RANCHOS

## 📍 INFORMACIÓN DEL BACKUP

**Fecha del backup**: ${FECHA} a las ${HORA}
**Usuario**: ${USUARIO}
**Máquina**: ${MAQUINA}
**Ruta del proyecto**: ${RUTA_PROYECTO}
**Rama Git**: ${GIT_BRANCH}
**Último commit**: ${ULTIMO_COMMIT}

## 🔍 BACKUPS CREADOS HOY

### Archivos de backup:
$(ls -la ~/Desktop/RanchOS-backup-* 2>/dev/null | tail -5 || echo "No se encontraron backups en Desktop")

### Tags Git recientes:
$(git tag -l | tail -5)

## 📁 ESTRUCTURA ACTUAL DEL PROYECTO

\`\`\`
$(tree -L 2 -I 'node_modules|.next|.git' 2>/dev/null || find . -maxdepth 2 -type d | grep -v node_modules | sort)
\`\`\`

## 🔧 PARA RESTAURAR

Ver instrucciones completas en el artifact anterior.

---
Generado automáticamente el: ${FECHA} ${HORA}
EOD

echo "✅ Instrucciones guardadas en: RECOVERY-INSTRUCTIONS.md"
echo "📋 También puedes encontrarlas en el artifact de Claude"
