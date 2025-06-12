# Sistema de Tipos de RanchOS

## 📁 Estructura

```
src/types/
├── index.ts       # Re-exporta todos los tipos
├── models.ts      # Definiciones de tipos principales
└── README.md      # Esta documentación
```

## 🎯 Uso

### Importar tipos en componentes

```typescript
// Importar tipos específicos
import type { Animal, Cattle, Ranch } from '@/types';

// Importar constantes
import { COMMON_BREEDS, HEALTH_STATUS_OPTIONS } from '@/types';
```

### Importar desde el store

```typescript
// El store re-exporta los tipos principales
import useRanchOSStore, { type Animal, type Cattle } from '@/store';
```

## 📋 Tipos Principales

### Animal
Tipo base para todos los animales:
- `sex` es **requerido** (male | female)
- `tag` es **requerido**
- `ranchId` es **requerido**
- Otros campos son opcionales

### Cattle
Extiende `Animal` con campos específicos para ganado:
- `location` - Ubicación en el rancho
- `purchasePrice` - Precio de compra
- `purchaseDate` - Fecha de compra
- `motherId` - ID de la madre
- `fatherId` - ID del padre

## 🔧 Type Guards

```typescript
import { isAnimal, isCattle } from '@/types';

// Verificar si un objeto es Animal
if (isAnimal(obj)) {
  // obj es tipo Animal
}

// Verificar si un objeto es Cattle
if (isCattle(obj)) {
  // obj es tipo Cattle
  console.log(obj.location); // ✅ Campo específico de Cattle
}
```

## 🎨 Constantes

### COMMON_BREEDS
```typescript
const breeds = [...COMMON_BREEDS]; // Array de razas comunes
```

### HEALTH_STATUS_OPTIONS
```typescript
HEALTH_STATUS_OPTIONS.map(option => (
  <option value={option.value}>{option.label}</option>
))
```

## ⚠️ Notas Importantes

1. **NUNCA** definas tipos duplicados en componentes
2. **SIEMPRE** importa desde `@/types` o `@/store`
3. **USA** type guards para verificar tipos en runtime
4. **MANTÉN** los tipos actualizados cuando cambies el modelo de datos

## 📝 Ejemplo Completo

```typescript
// src/components/ejemplo.tsx
import type { Animal, Cattle } from '@/types';
import { HEALTH_STATUS_OPTIONS, isCattle } from '@/types';

function MiComponente({ animal }: { animal: Animal | Cattle }) {
  // Verificar si es Cattle para acceder a campos específicos
  const location = isCattle(animal) ? animal.location : 'Sin ubicación';
  
  return (
    <div>
      <h3>{animal.name || animal.tag}</h3>
      <p>Sexo: {animal.sex === 'female' ? 'Hembra' : 'Macho'}</p>
      <p>Ubicación: {location}</p>
    </div>
  );
}
