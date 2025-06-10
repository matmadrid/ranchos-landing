// StrategicBudgetPlanner/validator.ts
import { ValidationResult, CountryRegulations } from '../../../types/base';

export class StrategicBudgetPlannerValidator {
  validate(data: any, regulations: CountryRegulations): ValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }
}