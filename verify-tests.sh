#!/bin/bash
echo "📋 ESTADO DE ARCHIVOS DE TEST"
echo "============================="
for f in src/services/storage/__tests__/*.test.* src/hooks/__tests__/*.test.* src/components/debug/__tests__/*.test.*; do
  if [ -f "$f" ]; then
    echo -n "$(basename "$f"): "
    size=$(wc -c < "$f")
    if [ "$size" -eq "0" ]; then
      echo "VACÍO"
    else
      lines=$(wc -l < "$f")
      tests=$(grep -c "describe(\|it(\|test(" "$f" 2>/dev/null || echo "0")
      echo "$lines líneas, $tests tests"
    fi
  fi
done 2>/dev/null
