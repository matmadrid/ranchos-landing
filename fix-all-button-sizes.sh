#!/bin/bash

FILE="src/app/profile/page.tsx"

echo "🔧 Removiendo prop 'size' de todos los Buttons..."

# Remover cualquier variación de size
sed -i '' 's/ size="sm"//g' $FILE
sed -i '' 's/ size={"sm"}//g' $FILE
sed -i '' 's/ size={"sm" as const}//g' $FILE
sed -i '' 's/ size="md"//g' $FILE
sed -i '' 's/ size="lg"//g' $FILE

echo "✅ Todos los 'size' removidos de los Buttons"

# Verificar si quedan más
REMAINING=$(grep -c 'Button.*size=' $FILE || echo "0")
echo "📊 Buttons con 'size' restantes: $REMAINING"
