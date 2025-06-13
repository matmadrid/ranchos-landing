#!/bin/bash
FECHA=$(date +%Y%m%d-%H%M%S)
NOMBRE="RanchOS-backup-${FECHA}"

echo "🔒 CREANDO BACKUP DE RANCHOS"
echo "==========================="

# 1. Commit actual si hay cambios
if [[ -n $(git status -s) ]]; then
    echo "📝 Guardando cambios actuales..."
    git add -A
    git commit -m "🔒 Backup automático: ${FECHA}"
fi

# 2. Crear tag
git tag -a "backup-${FECHA}" -m "Backup: Complete Profile + Favicon implementados"

# 3. Crear archivo comprimido
echo "📦 Creando archivo backup..."
tar -czf ~/Desktop/${NOMBRE}.tar.gz \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='dist' \
    .

# 4. Crear bundle Git
echo "🔐 Creando Git bundle..."
git bundle create ~/Desktop/${NOMBRE}.bundle --all

echo ""
echo "✅ BACKUP COMPLETADO"
echo "===================="
echo "📁 Archivos creados en el Escritorio:"
echo "   - ${NOMBRE}.tar.gz (código sin dependencias)"
echo "   - ${NOMBRE}.bundle (historia completa de Git)"
echo ""
echo "💡 Para restaurar desde bundle:"
echo "   git clone ~/Desktop/${NOMBRE}.bundle RanchOS-restored"
