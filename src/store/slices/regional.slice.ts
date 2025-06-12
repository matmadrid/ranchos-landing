// src/store/slices/regional.slice.ts
import { StateCreator } from 'zustand';

export type CountryCode = 'MX' | 'CO' | 'BR' | 'ES';

export interface UnitSystem {
  weight: 'kg' | 'lb' | 'arroba';
  area: 'hectare' | 'acre';
  volume: 'liter' | 'gallon';
  temperature: 'celsius' | 'fahrenheit';
}

export interface LocaleConfig {
  country: CountryCode;
  currency: string;
  locale: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  decimalSeparator: '.' | ',';
  thousandsSeparator: ',' | '.';
  units: UnitSystem;
  regulations: string[];
  taxRules: {
    vatRate: number;
    incomeTaxRate: number;
    specialRates: Record<string, number>;
  };
}

export interface RegionalSlice {
  // Estado
  currentCountry: CountryCode;
  localeConfig: LocaleConfig;
  unitSystem: UnitSystem;
  currency: string;
  
  // Acciones
  setCountry: (country: CountryCode) => Promise<void>;
  updateUnitSystem: (units: Partial<UnitSystem>) => void;
  setCurrency: (currency: string) => void;
  
  // Conversiones
  convertWeight: (value: number, from: UnitSystem['weight'], to: UnitSystem['weight']) => number;
  convertArea: (value: number, from: UnitSystem['area'], to: UnitSystem['area']) => number;
  convertVolume: (value: number, from: UnitSystem['volume'], to: UnitSystem['volume']) => number;
  convertTemperature: (value: number, from: UnitSystem['temperature'], to: UnitSystem['temperature']) => number;
  
  // Formato
  formatCurrency: (amount: number) => string;
  formatNumber: (value: number, decimals?: number) => string;
  formatDate: (date: Date | string) => string;
  formatWeight: (value: number, showUnit?: boolean) => string;
  formatArea: (value: number, showUnit?: boolean) => string;
  formatVolume: (value: number, showUnit?: boolean) => string;
  
  // Utilidades
  getCountryConfig: (country: CountryCode) => LocaleConfig;
  getAvailableCountries: () => Array<{ code: CountryCode; name: string; flag: string }>;
}

// Configuraciones predefinidas por país
const COUNTRY_CONFIGS: Record<CountryCode, Omit<LocaleConfig, 'country'>> = {
  MX: {
    currency: 'MXN',
    locale: 'es-MX',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    units: {
      weight: 'kg',
      area: 'hectare',
      volume: 'liter',
      temperature: 'celsius'
    },
    regulations: ['NOM-001-SAG-2023', 'NOM-033-SAG-2022'],
    taxRules: {
      vatRate: 0.16,
      incomeTaxRate: 0.30,
      specialRates: {
        'ganaderia': 0.0, // Tasa 0% para actividades ganaderas
        'exportacion': 0.0
      }
    }
  },
  CO: {
    currency: 'COP',
    locale: 'es-CO',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    units: {
      weight: 'kg',
      area: 'hectare',
      volume: 'liter',
      temperature: 'celsius'
    },
    regulations: ['Resolución ICA 3585', 'Decreto 616 de 2006'],
    taxRules: {
      vatRate: 0.19,
      incomeTaxRate: 0.35,
      specialRates: {
        'bovinos': 0.05,
        'leche': 0.0
      }
    }
  },
  BR: {
    currency: 'BRL',
    locale: 'pt-BR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    units: {
      weight: 'arroba', // Brasil usa arroba para ganado
      area: 'hectare',
      volume: 'liter',
      temperature: 'celsius'
    },
    regulations: ['IN 62/2011', 'IN 77/2018'],
    taxRules: {
      vatRate: 0.18, // ICMS promedio
      incomeTaxRate: 0.275,
      specialRates: {
        'pecuaria': 0.12,
        'leite': 0.07
      }
    }
  },
  ES: {
    currency: 'EUR',
    locale: 'es-ES',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    units: {
      weight: 'kg',
      area: 'hectare',
      volume: 'liter',
      temperature: 'celsius'
    },
    regulations: ['RD 1311/2012', 'Reglamento CE 1069/2009'],
    taxRules: {
      vatRate: 0.21,
      incomeTaxRate: 0.25,
      specialRates: {
        'ganaderia': 0.10,
        'productos_basicos': 0.04
      }
    }
  }
};

export const createRegionalSlice: StateCreator<RegionalSlice> = (set, get) => ({
  // Estado inicial (México por defecto)
  currentCountry: 'MX',
  localeConfig: {
    country: 'MX',
    ...COUNTRY_CONFIGS.MX
  },
  unitSystem: COUNTRY_CONFIGS.MX.units,
  currency: 'MXN',
  
  // Cambiar país
  setCountry: async (country) => {
    const config = COUNTRY_CONFIGS[country];
    if (!config) {
      throw new Error(`País no soportado: ${country}`);
    }
    
    set({
      currentCountry: country,
      localeConfig: {
        country,
        ...config
      },
      unitSystem: config.units,
      currency: config.currency
    });
    
    // Guardar preferencia
    localStorage.setItem('preferredCountry', country);
  },
  
  // Actualizar sistema de unidades
  updateUnitSystem: (units) => {
    set((state) => ({
      unitSystem: { ...state.unitSystem, ...units },
      localeConfig: {
        ...state.localeConfig,
        units: { ...state.localeConfig.units, ...units }
      }
    }));
  },
  
  // Establecer moneda
  setCurrency: (currency) => {
    set({ currency });
  },
  
  // === CONVERSIONES ===
  
  // Conversión de peso
  convertWeight: (value, from, to) => {
    if (from === to) return value;
    
    const toKg: Record<typeof from, number> = {
      kg: 1,
      lb: 0.453592,
      arroba: 15 // 1 arroba = 15 kg
    };
    
    const fromKg: Record<typeof to, number> = {
      kg: 1,
      lb: 2.20462,
      arroba: 0.0666667
    };
    
    return value * toKg[from] * fromKg[to];
  },
  
  // Conversión de área
  convertArea: (value, from, to) => {
    if (from === to) return value;
    
    // 1 hectárea = 2.47105 acres
    return from === 'hectare' 
      ? value * 2.47105 
      : value / 2.47105;
  },
  
  // Conversión de volumen
  convertVolume: (value, from, to) => {
    if (from === to) return value;
    
    // 1 galón = 3.78541 litros
    return from === 'liter' 
      ? value / 3.78541 
      : value * 3.78541;
  },
  
  // Conversión de temperatura
  convertTemperature: (value, from, to) => {
    if (from === to) return value;
    
    return from === 'celsius'
      ? (value * 9/5) + 32  // Celsius a Fahrenheit
      : (value - 32) * 5/9; // Fahrenheit a Celsius
  },
  
  // === FORMATEO ===
  
  // Formatear moneda
  formatCurrency: (amount) => {
    const { currency, locale } = get().localeConfig;
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  },
  
  // Formatear número
  formatNumber: (value, decimals = 2) => {
    const { locale } = get().localeConfig;
    
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },
  
  // Formatear fecha
  formatDate: (date) => {
    const { locale, dateFormat } = get().localeConfig;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Formato personalizado según configuración regional
    if (dateFormat === 'DD/MM/YYYY') {
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(dateObj);
    }
    
    return dateObj.toLocaleDateString(locale);
  },
  
  // Formatear peso
  formatWeight: (value, showUnit = true) => {
    const { unitSystem } = get();
    const formatted = get().formatNumber(value);
    
    if (!showUnit) return formatted;
    
    const units = {
      kg: 'kg',
      lb: 'lb',
      arroba: '@'
    };
    
    return `${formatted} ${units[unitSystem.weight]}`;
  },
  
  // Formatear área
  formatArea: (value, showUnit = true) => {
    const { unitSystem } = get();
    const formatted = get().formatNumber(value);
    
    if (!showUnit) return formatted;
    
    return unitSystem.area === 'hectare' 
      ? `${formatted} ha` 
      : `${formatted} acres`;
  },
  
  // Formatear volumen
  formatVolume: (value, showUnit = true) => {
    const { unitSystem } = get();
    const formatted = get().formatNumber(value, 1);
    
    if (!showUnit) return formatted;
    
    return unitSystem.volume === 'liter' 
      ? `${formatted} L` 
      : `${formatted} gal`;
  },
  
  // === UTILIDADES ===
  
  // Obtener configuración de país
  getCountryConfig: (country) => {
    const config = COUNTRY_CONFIGS[country];
    if (!config) {
      throw new Error(`País no soportado: ${country}`);
    }
    
    return {
      country,
      ...config
    };
  },
  
  // Obtener países disponibles
  getAvailableCountries: () => [
    { code: 'MX' as CountryCode, name: 'México', flag: '🇲🇽' },
    { code: 'CO' as CountryCode, name: 'Colombia', flag: '🇨🇴' },
    { code: 'BR' as CountryCode, name: 'Brasil', flag: '🇧🇷' },
    { code: 'ES' as CountryCode, name: 'España', flag: '🇪🇸' }
  ]
});