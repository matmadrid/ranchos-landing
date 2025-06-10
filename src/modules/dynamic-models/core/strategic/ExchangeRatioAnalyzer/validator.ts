// ExchangeRatioAnalyzer/validator.ts
import { ValidationResult, CountryRegulations } from '../../../types/base';

export class ExchangeRatioAnalyzerValidator {
  validate(data: any, regulations: CountryRegulations): ValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }
}