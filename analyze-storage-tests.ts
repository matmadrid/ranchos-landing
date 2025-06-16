// analyze-storage-tests.ts
/**
 * Script para analizar tests existentes de StorageManager
 * Ejecutar con: npx ts-node analyze-storage-tests.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestAnalysis {
  filePath: string;
  totalTests: number;
  testNames: string[];
  methodsCovered: Set<string>;
  hasBeforeEach: boolean;
  hasMocks: boolean;
  usesTypeScript: boolean;
  patterns: {
    usesJest: boolean;
    usesTestingLibrary: boolean;
    hasAsyncTests: boolean;
    hasErrorHandling: boolean;
  };
}

class StorageTestAnalyzer {
  private storageManagerMethods = [
    'get', 'set', 'remove', 'clear',
    'getAllKeys', 'getStorageSize', 'subscribe',
    'export', 'import', 'getItemMetadata',
    'getOperationsLog', 'getInstance'
  ];

  async analyzeTests(testFilePath: string): Promise<TestAnalysis> {
    try {
      const content = fs.readFileSync(testFilePath, 'utf-8');
      
      return {
        filePath: testFilePath,
        totalTests: this.countTests(content),
        testNames: this.extractTestNames(content),
        methodsCovered: this.findCoveredMethods(content),
        hasBeforeEach: content.includes('beforeEach'),
        hasMocks: content.includes('mock') || content.includes('Mock'),
        usesTypeScript: testFilePath.endsWith('.ts') || testFilePath.endsWith('.tsx'),
        patterns: {
          usesJest: content.includes('jest.') || content.includes('expect('),
          usesTestingLibrary: content.includes('@testing-library'),
          hasAsyncTests: content.includes('async') && content.includes('await'),
          hasErrorHandling: content.includes('throw') || content.includes('.rejects')
        }
      };
    } catch (error) {
      console.error(`Error analizando ${testFilePath}:`, error);
      return null as any;
    }
  }

  private countTests(content: string): number {
    const itMatches = content.match(/it\s*\(/g) || [];
    const testMatches = content.match(/test\s*\(/g) || [];
    return itMatches.length + testMatches.length;
  }

  private extractTestNames(content: string): string[] {
    const regex = /(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    const names: string[] = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      names.push(match[1]);
    }
    
    return names;
  }

  private findCoveredMethods(content: string): Set<string> {
    const covered = new Set<string>();
    
    for (const method of this.storageManagerMethods) {
      const patterns = [
        `storageManager.${method}`,
        `storageManager\\['${method}'\\]`,
        `\\.${method}\\(`
      ];
      
      if (patterns.some(pattern => new RegExp(pattern).test(content))) {
        covered.add(method);
      }
    }
    
    return covered;
  }

  generateReport(analysis: TestAnalysis): string {
    if (!analysis) return 'No se pudo analizar el archivo';

    const uncoveredMethods = this.storageManagerMethods.filter(
      method => !analysis.methodsCovered.has(method)
    );

    return `
=== ANÁLISIS DE TESTS DE STORAGEMANAGER ===

📁 Archivo: ${analysis.filePath}
📊 Total de tests: ${analysis.totalTests}
🔧 Usa TypeScript: ${analysis.usesTypeScript ? 'Sí' : 'No'}
🎭 Tiene mocks: ${analysis.hasMocks ? 'Sí' : 'No'}
🔄 Tiene beforeEach: ${analysis.hasBeforeEach ? 'Sí' : 'No'}

📋 MÉTODOS CUBIERTOS (${analysis.methodsCovered.size}/${this.storageManagerMethods.length}):
${Array.from(analysis.methodsCovered).map(m => `  ✅ ${m}`).join('\n')}

⚠️  MÉTODOS NO CUBIERTOS (${uncoveredMethods.length}):
${uncoveredMethods.map(m => `  ❌ ${m}`).join('\n') || '  ✅ Todos los métodos están cubiertos'}

🔍 PATRONES DETECTADOS:
  ${analysis.patterns.usesJest ? '✅' : '❌'} Usa Jest
  ${analysis.patterns.usesTestingLibrary ? '✅' : '❌'} Usa Testing Library
  ${analysis.patterns.hasAsyncTests ? '✅' : '❌'} Tiene tests asíncronos
  ${analysis.patterns.hasErrorHandling ? '✅' : '❌'} Testea manejo de errores

📝 NOMBRES DE TESTS:
${analysis.testNames.map((name, i) => `  ${i + 1}. ${name}`).join('\n')}

💡 RECOMENDACIONES:
${this.generateRecommendations(analysis, uncoveredMethods).map(r => `  • ${r}`).join('\n')}
`;
  }

  private generateRecommendations(analysis: TestAnalysis, uncoveredMethods: string[]): string[] {
    const recommendations: string[] = [];

    if (uncoveredMethods.length > 0) {
      recommendations.push(`Agregar tests para métodos no cubiertos: ${uncoveredMethods.join(', ')}`);
    }

    if (!analysis.patterns.hasErrorHandling) {
      recommendations.push('Agregar tests para manejo de errores (casos de fallo)');
    }

    if (!analysis.patterns.hasAsyncTests && analysis.methodsCovered.has('subscribe')) {
      recommendations.push('Considerar agregar tests asíncronos para suscripciones');
    }

    if (!analysis.methodsCovered.has('export') || !analysis.methodsCovered.has('import')) {
      recommendations.push('Agregar tests de export/import para verificar backup/restore');
    }

    if (!analysis.methodsCovered.has('getStorageSize')) {
      recommendations.push('Agregar tests para verificar límites de almacenamiento');
    }

    if (analysis.totalTests < 20) {
      recommendations.push('Considerar agregar más casos de prueba para mejor cobertura');
    }

    return recommendations.length > 0 ? recommendations : ['¡Excelente cobertura de tests!'];
  }

  async findStorageTests(baseDir: string = 'src'): Promise<string[]> {
    const testFiles: string[] = [];
    
    function searchDir(dir: string) {
      try {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            searchDir(fullPath);
          } else if (
            stat.isFile() && 
            (file.includes('storage') || file.includes('Storage')) &&
            (file.includes('test') || file.includes('spec')) &&
            (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js'))
          ) {
            testFiles.push(fullPath);
          }
        }
      } catch (error) {
        console.error(`Error buscando en ${dir}:`, error);
      }
    }
    
    searchDir(baseDir);
    return testFiles;
  }
}

// Función principal para ejecutar el análisis
async function main() {
  console.log('🔍 Buscando tests de StorageManager...\n');
  
  const analyzer = new StorageTestAnalyzer();
  const testFiles = await analyzer.findStorageTests();
  
  if (testFiles.length === 0) {
    console.log('❌ No se encontraron archivos de test para StorageManager');
    console.log('\nBusca archivos que contengan "storage" y "test" en su nombre');
    return;
  }
  
  console.log(`📁 Encontrados ${testFiles.length} archivo(s) de test:\n`);
  
  for (const file of testFiles) {
    console.log(`\nAnalizando: ${file}`);
    const analysis = await analyzer.analyzeTests(file);
    const report = analyzer.generateReport(analysis);
    console.log(report);
    
    // Opcionalmente guardar el reporte
    const reportPath = `storage-test-analysis-${Date.now()}.txt`;
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Reporte guardado en: ${reportPath}`);
  }

  // Generar resumen de integración
  console.log('\n' + '='.repeat(50));
  console.log('📋 PLAN DE INTEGRACIÓN SUGERIDO:');
  console.log('='.repeat(50));
  console.log(`
1. MANTENER tests existentes sin modificación
2. CREAR archivo complementario: storageManager.extended.test.ts
3. AGREGAR solo tests para funcionalidades no cubiertas
4. USAR los mismos patrones de mocking detectados
5. EJECUTAR tests existentes para verificar compatibilidad
`);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

export { StorageTestAnalyzer };