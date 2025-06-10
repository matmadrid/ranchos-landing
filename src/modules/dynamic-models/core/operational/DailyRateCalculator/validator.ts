// DailyRateCalculator/validator.ts
import { ValidationResult, CountryRegulations } from '../../../types/base';

export class DailyRateCalculatorValidator {
  validate(data: any, regulations: CountryRegulations): ValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }
}