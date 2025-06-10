// InfrastructureCostCalculator/validator.ts
import { ValidationResult, CountryRegulations } from '../../../types/base';

export class InfrastructureCostCalculatorValidator {
  validate(data: any, regulations: CountryRegulations): ValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }
}