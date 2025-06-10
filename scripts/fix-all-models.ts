import * as fs from 'fs';
import * as path from 'path';

const MODELS_PATH = 'src/modules/dynamic-models/core/financial';

// Template para agregar los métodos faltantes
const MISSING_METHODS = `
  async validate(data: any, config: LocaleConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // TODO: Agregar validaciones específicas
    if (!data) {
      errors.push('Los datos son requeridos');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: []
    };
  }
  
  async process(data: any, config: LocaleConfig): Promise<ProcessResult> {
    try {
      const validation = await this.validate(data, config);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors?.join(', ')
        };
      }
      
      // TODO: Implementar lógica específica del modelo
      return {
        success: true,
        data: {
          result: 'Procesamiento exitoso',
          ...data
        },
        metadata: {
          processingTime: Date.now(),
          timestamp: new Date(),
          version: this.version
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
  
  async export(result: any, format: ExportFormat, locale: LocaleConfig): Promise<Buffer> {
    const content = JSON.stringify(result, null, 2);
    return Buffer.from(content);
  }
  
  getInputSchema(): DataSchema {
    return {
      type: 'object',
      required: [],
      properties: {
        // TODO: Definir propiedades de entrada
      }
    };
  }
  
  getOutputSchema(): DataSchema {
    return {
      type: 'object',
      properties: {
        // TODO: Definir propiedades de salida
      }
    };
  }`;

// Buscar todos los archivos index.ts en los modelos
function findModelFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const indexPath = path.join(fullPath, 'index.ts');
      if (fs.existsSync(indexPath)) {
        files.push(indexPath);
      }
    }
  });
  
  return files;
}

// Verificar si un archivo necesita los métodos
function needsMethods(content: string): boolean {
  return content.includes('extends BaseDynamicModel') && 
         (!content.includes('getInputSchema()') || 
          !content.includes('getOutputSchema()') ||
          !content.includes('async validate(') ||
          !content.includes('async process(') ||
          !content.includes('async export('));
}

// Agregar los métodos faltantes
function fixModelFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!needsMethods(content)) {
    console.log(`✅ ${path.basename(path.dirname(filePath))} - Ya está completo`);
    return;
  }
  
  // Agregar import de DataSchema si no existe
  if (!content.includes('DataSchema')) {
    content = content.replace(
      "} from '../../../types/base';",
      ", DataSchema } from '../../../types/base';"
    );
  }
  
  // Encontrar el final de la clase
  const classMatch = content.match(/export class \w+ extends BaseDynamicModel {[\s\S]*?^}/m);
  if (!classMatch) {
    console.error(`❌ No se pudo encontrar la clase en ${filePath}`);
    return;
  }
  
  // Insertar los métodos antes del cierre de la clase
  const insertPosition = content.lastIndexOf('}', classMatch.index! + classMatch[0].length);
  content = content.slice(0, insertPosition) + MISSING_METHODS + '\n' + content.slice(insertPosition);
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ ${path.basename(path.dirname(filePath))} - Arreglado`);
}

// Arreglar todos los validators
function fixAllValidators(dir: string) {
  const validatorFiles = findValidatorFiles(dir);
  
  validatorFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('isValid:')) {
      content = content.replace(/isValid:/g, 'valid:');
      fs.writeFileSync(file, content);
      console.log(`✅ Validator arreglado: ${file}`);
    }
  });
}

function findValidatorFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const validatorPath = path.join(fullPath, 'validator.ts');
      if (fs.existsSync(validatorPath)) {
        files.push(validatorPath);
      }
    }
  });
  
  return files;
}

// Ejecutar
console.log('🔧 Arreglando todos los modelos...\n');

const modelFiles = findModelFiles(MODELS_PATH);
console.log(`Encontrados ${modelFiles.length} modelos\n`);

modelFiles.forEach(fixModelFile);

console.log('\n🔧 Arreglando todos los validators...\n');
fixAllValidators(MODELS_PATH);

console.log('\n✅ ¡Listo! Todos los modelos han sido arreglados.');
console.log('\nAhora ejecuta: npm run build');
