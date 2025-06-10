// src/modules/dynamic-models/core/financial/LivestockProfitabilityEngine/validator.ts
import { LocaleConfig } from '../../../types/base';
import { LivestockData } from './types';

export class LivestockValidator {
  validate(data: LivestockData, config: LocaleConfig): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    
    // Basic field validation
    if (!data.farmId || data.farmId.trim() === '') {
      errors.push('Farm ID is required');
    }
    
    // Date validations
    if (!data.analysisDate) {
      errors.push('Analysis date is required');
    }
    
    if (!data.periodStartDate) {
      errors.push('Period start date is required');
    }
    
    if (!data.periodEndDate) {
      errors.push('Period end date is required');
    }
    
    if (data.periodStartDate && data.periodEndDate) {
      const start = new Date(data.periodStartDate);
      const end = new Date(data.periodEndDate);
      
      if (start >= end) {
        errors.push('Period end date must be after start date');
      }
      
      // Check if period is reasonable (not more than 5 years)
      const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 1825) { // 5 years
        errors.push('Analysis period cannot exceed 5 years');
      }
    }
    
    // Inventory validations
    if (!data.initialInventory || data.initialInventory < 1) {
      errors.push('Initial inventory must be at least 1');
    }
    
    if (data.initialInventory > 100000) {
      errors.push('Initial inventory cannot exceed 100,000 animals');
    }
    
    // Weight validations
    if (!data.averageWeight || data.averageWeight <= 0) {
      errors.push('Average weight must be greater than 0');
    }
    
    if (!data.expectedFinalWeight || data.expectedFinalWeight <= 0) {
      errors.push('Expected final weight must be greater than 0');
    }
    
    if (data.averageWeight && data.expectedFinalWeight && data.expectedFinalWeight < data.averageWeight) {
      errors.push('Expected final weight must be greater than or equal to average weight');
    }
    
    // Price validations
    if (!data.purchasePrice || data.purchasePrice < 0) {
      errors.push('Purchase price must be non-negative');
    }
    
    if (!data.salePrice || data.salePrice <= 0) {
      errors.push('Sale price must be greater than 0');
    }
    
    // Cost validations
    if (data.feedCostPerDay === undefined || data.feedCostPerDay < 0) {
      errors.push('Feed cost per day must be non-negative');
    }
    
    if (data.laborCostPerMonth === undefined || data.laborCostPerMonth < 0) {
      errors.push('Labor cost per month must be non-negative');
    }
    
    if (data.veterinaryCostPerHead === undefined || data.veterinaryCostPerHead < 0) {
      errors.push('Veterinary cost per head must be non-negative');
    }
    
    // Risk factor validations
    if (data.mortalityRate === undefined || data.mortalityRate < 0 || data.mortalityRate > 100) {
      errors.push('Mortality rate must be between 0 and 100');
    }
    
    if (data.morbidityRate !== undefined && (data.morbidityRate < 0 || data.morbidityRate > 100)) {
      errors.push('Morbidity rate must be between 0 and 100');
    }
    
    if (data.priceVolatility !== undefined && (data.priceVolatility < 0 || data.priceVolatility > 100)) {
      errors.push('Price volatility must be between 0 and 100');
    }
    
    // Financial validations
    if (data.financingRate !== undefined && (data.financingRate < 0 || data.financingRate > 100)) {
      errors.push('Financing rate must be between 0 and 100');
    }
    
    if (data.initialInvestment && data.initialInvestment < 0) {
      errors.push('Initial investment must be non-negative');
    }
    
    // Breed validation
    const validBreeds = [
      'Angus', 'Hereford', 'Charolais', 'Simmental', 'Limousin',
      'Brahman', 'Brangus', 'Beefmaster', 'Gelbvieh', 'Red Angus',
      'Holstein', 'Jersey', 'Guernsey', 'Brown Swiss', 'Ayrshire',
      'Criollo', 'Cebu', 'Santa Gertrudis'
    ];
    
    if (data.breed && !validBreeds.includes(data.breed)) {
      errors.push(`Invalid breed. Must be one of: ${validBreeds.join(', ')}`);
    }
    
    // Production system validation
    const validSystems = ['intensive', 'semi-intensive', 'extensive', 'feedlot', 'pasture-based', 'mixed'];
    
    if (data.productionSystem && !validSystems.includes(data.productionSystem)) {
      errors.push(`Invalid production system. Must be one of: ${validSystems.join(', ')}`);
    }
    
    // Certification validation
    const validCertifications = [
      'Organic', 'Grass-fed', 'Non-GMO', 'Animal Welfare',
      'Sustainable', 'Carbon Neutral', 'Fair Trade'
    ];
    
    if (data.certifications && data.certifications.length > 0) {
      const invalidCerts = data.certifications.filter(cert => !validCertifications.includes(cert));
      if (invalidCerts.length > 0) {
        errors.push(`Invalid certifications: ${invalidCerts.join(', ')}`);
      }
    }
    
    // Country-specific validations
    if (config.country === 'MX' && data.priceUnit && !['MXN/kg', 'USD/kg'].includes(data.priceUnit)) {
      errors.push('For Mexico, price unit must be MXN/kg or USD/kg');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

export default LivestockValidator;