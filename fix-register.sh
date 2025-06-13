#!/bin/bash
echo "🔧 Aplicando correcciones completas..."

# 1. Revertir al backup
cp src/app/auth/register/page.tsx.backup src/app/auth/register/page.tsx

# 2. Aplicar TODOS los cambios de una vez
cat > /tmp/apply-all-changes.py << 'PYEOF'
#!/usr/bin/env python3

with open('src/app/auth/register/page.tsx', 'r') as f:
    content = f.read()

# 1. Agregar import si no existe
if 'CompleteProfileMessage' not in content:
    content = content.replace(
        'import { useToast } from \'@/hooks/useToast\';',
        'import { useToast } from \'@/hooks/useToast\';\nimport { CompleteProfileMessage } from \'@/components/auth/CompleteProfileMessage\';'
    )

# 2. Agregar lógica después de useToast
if 'isCompletingProfile' not in content:
    content = content.replace(
        'const { success, error } = useToast();',
        '''const { success, error } = useToast();
  
  // Detectar si es usuario temporal completando perfil
  const isTemporaryUser = currentUser?.id?.startsWith('demo-');
  const isCompletingProfile = message === 'complete-profile' && isTemporaryUser;
  
  // Obtener datos del rancho temporal
  const temporaryRanchData = currentRanch || ranches[0];
  const temporaryAnimalsCount = cattle?.length || 0;
  const temporaryProduction = useRanchOSStore.getState().getTotalMilkProduction?.() || 0;'''
    )

# 3. Actualizar destructuring si necesario
if 'currentRanch' not in content:
    content = content.replace(
        'const { setCurrentUser, setProfile, currentUser, ranches, setIsOnboardingComplete } = useRanchOSStore();',
        'const { setCurrentUser, setProfile, currentUser, ranches, setIsOnboardingComplete, currentRanch, cattle } = useRanchOSStore();'
    )

# 4. Cambiar textos del lado izquierdo
content = content.replace(
    'Join 10,000+ modern ranchers',
    '{isCompletingProfile ? "Convierte tu progreso en permanente" : "Únete a miles de ganaderos modernos"}'
)

content = content.replace(
    'Transform your ranch operations with cutting-edge technology',
    '{isCompletingProfile ? "Mantén todos tus datos y desbloquea funciones avanzadas" : "Transforma tu rancho con tecnología de punta"}'
)

# 5. Cambiar título principal
content = content.replace(
    'Create your account',
    '{isCompletingProfile ? \'Completa tu cuenta\' : \'Crea tu cuenta\'}'
)

# 6. Cambiar subtítulo
content = content.replace(
    'Start your 14-day free trial',
    '{isCompletingProfile ? \'Último paso para asegurar tu información\' : \'Únete gratis a la plataforma ganadera más moderna\'}'
)

# 7. Insertar mensaje contextual ANTES del logo
# Buscar el patrón del logo section
import re
logo_pattern = r'(\s*<div className="text-center">\s*<motion\.div[^>]*>\s*<LogoSatellite)'

message_component = '''
          {/* Mensaje contextual para usuarios temporales */}
          {isCompletingProfile && (
            <div className="mb-6">
              <CompleteProfileMessage
                ranchName={temporaryRanchData?.name}
                animalCount={temporaryAnimalsCount}
                productionData={{
                  totalProduction: temporaryProduction,
                  trend: 'up'
                }}
              />
            </div>
          )}

          '''

if 'CompleteProfileMessage' not in content or not re.search(r'isCompletingProfile\s*&&[^}]*CompleteProfileMessage', content):
    content = re.sub(logo_pattern, message_component + r'\1', content)

# 8. Cambiar botón
content = content.replace(
    'Create account',
    '{isCompletingProfile ? \'Completar registro\' : \'Crear cuenta gratis\'}'
)

# 9. Cambiar link final
content = content.replace(
    'Already have an account?',
    '{isCompletingProfile ? \'¿Prefieres seguir explorando?\' : \'¿Ya tienes cuenta?\'}'
)

# Guardar
with open('src/app/auth/register/page.tsx', 'w') as f:
    f.write(content)

print("✅ Todos los cambios aplicados correctamente")
PYEOF

python3 /tmp/apply-all-changes.py
rm -f /tmp/apply-all-changes.py

echo "✅ Correcciones completadas"
echo "🔄 Reinicia el servidor con: npm run dev"
