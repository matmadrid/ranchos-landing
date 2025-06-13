#!/bin/bash
python3 << 'PYTHON'
import re

with open('src/app/auth/register/page.tsx', 'r') as f:
    content = f.read()

# Buscar y eliminar la sección de floating elements
pattern = r'{/\* Floating elements \*/}.*?</div>\s*(?={/\* Content overlay \*/})'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open('src/app/auth/register/page.tsx', 'w') as f:
    f.write(content)

print("✅ Emojis flotantes eliminados")
print("✨ Diseño más limpio y profesional")
PYTHON
