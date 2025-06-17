#!/bin/bash
echo "📅 Archivos modificados hoy:"
echo "============================"
find . -type f -not -path "./.git/*" -newermt "$(date +%F)" -exec stat -f "%m %N" {} \; | sort -rn | cut -d' ' -f2-
