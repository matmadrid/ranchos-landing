// src/utils/demoDataGenerator.ts
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * Generador de datos DEMO para mostrar el potencial de la plataforma
 */

export async function loadDemoDataToStore(store: any) {
  console.log('🚀 Iniciando carga de datos DEMO...');
  
  try {
    // Datos de ranchos demo
    const demoRanches = [
      {
        name: 'Rancho Santa María',
        location: 'Guadalajara, Jalisco',
        countryCode: 'MX' as const,
        size: 450,
        sizeUnit: 'hectare' as const,
        type: 'dairy' as const,
        description: 'Especializado en producción lechera premium'
      },
      {
        name: 'Hacienda Los Alamos',
        location: 'Querétaro, Querétaro',
        countryCode: 'MX' as const,
        size: 320,
        sizeUnit: 'hectare' as const,
        type: 'beef' as const,
        description: 'Ganado de engorda con genética de alta calidad'
      },
      {
        name: 'Finca El Progreso',
        location: 'Monterrey, Nuevo León',
        countryCode: 'MX' as const,
        size: 580,
        sizeUnit: 'hectare' as const,
        type: 'mixed' as const,
        description: 'Operación mixta con doble propósito'
      }
    ];

    // Cargar ranchos
    const ranchIds: string[] = [];
    for (const ranch of demoRanches) {
      const result = await store.addRanch(ranch);
      if (result.success && result.data) {
        ranchIds.push(result.data.id);
      }
    }

    // Datos de animales demo
    const animalTypes = ['Vaca', 'Toro', 'Becerro', 'Vaquilla'];
    const breeds = ['Holstein', 'Angus', 'Charolais', 'Brahman'];
    let animalCount = 0;

    // Generar animales para cada rancho
    for (let ranchIndex = 0; ranchIndex < ranchIds.length; ranchIndex++) {
      const ranchId = ranchIds[ranchIndex];
      const animalsPerRanch = [120, 85, 150][ranchIndex];
      
      for (let i = 0; i < animalsPerRanch; i++) {
        const type = animalTypes[Math.floor(Math.random() * animalTypes.length)];
        const breed = breeds[Math.floor(Math.random() * breeds.length)];
        
        await store.addAnimal({
          tagNumber: `DEMO-${String(animalCount + 1).padStart(4, '0')}`,
          name: `${type} ${i + 1}`,
          type: type,
          breed: breed,
          birthDate: new Date(2020 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1).toISOString(),
          sex: type === 'Toro' ? 'male' : 'female',
          weight: 150 + Math.floor(Math.random() * 400),
          weightUnit: 'kg',
          status: 'active',
          ranchId: ranchId,
          notes: 'Animal de demostración'
        });
        animalCount++;
      }
    }

    // Generar algunos pesajes recientes (si existe el método)
    if (store.addWeighingRecord) {
      console.log('📊 Generando histórico de pesajes...');
      
      const animals = store.animals || [];
      for (let i = 0; i < Math.min(30, animals.length); i++) {
        const animal = animals[i];
        
        // Generar 3 pesajes históricos por animal
        for (let j = 0; j < 3; j++) {
          const date = new Date();
          date.setMonth(date.getMonth() - j);
          
          await store.addWeighingRecord({
            animalId: animal.id,
            animalTag: animal.tagNumber,
            fecha: date.toISOString(),
            peso: animal.weight - (j * 15) + Math.random() * 10,
            categoriaActual: animal.type,
            edad: 12 + j,
            gmd: 0.8 + Math.random() * 0.4,
            lote: 'Lote-Demo',
            notas: 'Pesaje de demostración'
          });
        }
      }
    }

    console.log('✅ Datos DEMO cargados exitosamente');
    
    return {
      success: true,
      summary: {
        ranchos: ranchIds.length,
        animales: animalCount,
        pesajes: store.weighingRecords?.length || 0
      }
    };
    
  } catch (error) {
    console.error('❌ Error cargando datos demo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}
