// LivestockProfitabilityEngine/types.ts

// ===== TYPE DEFINITIONS FIRST (to avoid circular references) =====

export type LivestockBreed = 
  | 'Angus' | 'Hereford' | 'Charolais' | 'Simmental' | 'Limousin'
  | 'Brahman' | 'Brangus' | 'Beefmaster' | 'Gelbvieh' | 'Red Angus'
  | 'Holstein' | 'Jersey' | 'Guernsey' | 'Brown Swiss' | 'Ayrshire'
  | 'Criollo' | 'Cebu' | 'Santa Gertrudis';

export type ProductionSystem = 
  | 'intensive' | 'semi-intensive' | 'extensive' 
  | 'feedlot' | 'pasture-based' | 'mixed';

export type CertificationType = 
  | 'Organic' | 'Grass-fed' | 'Non-GMO' | 'Animal Welfare'
  | 'Sustainable' | 'Carbon Neutral' | 'Fair Trade';

// ===== CORE DATA INTERFACES =====

export interface LivestockData {
  farmId: string;
  analysisDate: Date;
  periodStartDate: Date;
  periodEndDate: Date;
  
  // Inventory
  initialInventory: number;
  averageWeight: number;
  expectedFinalWeight: number;
  
  // Pricing
  purchasePrice: number;
  salePrice: number;
  priceUnit: string;
  
  // Feed & Nutrition
  feedCostPerDay: number;
  feedType: string;
  supplementCost: number;
  
  // Operational
  laborCostPerMonth: number;
  veterinaryCostPerHead: number;
  infrastructureCost: number;
  transportCost: number;
  
  // Financial
  initialInvestment: number;
  financingRate: number;
  financingPeriod: number;
  
  // Risk Factors
  mortalityRate: number;
  morbidityRate: number;
  priceVolatility: number;
  
  // Additional - ✅ FIXED: Using proper types instead of strings
  breed: LivestockBreed;
  productionSystem: ProductionSystem;
  certifications: CertificationType[];
}

export interface RevenueBreakdown {
  livestock: number;
  byProducts?: number;
  subsidies?: number;
  other?: number;
}

export interface CostBreakdown {
  feed: number;
  labor: number;
  veterinary: number;
  infrastructure: number;
  transport: number;
  insurance?: number;
  financing?: number;
  depreciation?: number; // ✅ FIXED: Was "deprecation"
  other?: number;
  percentages?: {
    feed: number;
    labor: number;
    veterinary: number;
    infrastructure: number;
    transport: number;
    financing: number;
    other: number;
  };
}

export interface MonthlyProjection {
  month: number;
  revenue: number;
  costs: number;
  profit: number; // Changed from netProfit to match calculator.ts
  cumulativeProfit: number;
  inventory?: number; // Added to match calculator.ts
  averageWeight?: number; // Added to match calculator.ts
  // Keep netProfit as optional for backward compatibility
  netProfit?: number;
}

export interface CashFlowProjection {
  // Simplified to match calculator.ts
  period: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulativeFlow: number;
  
  // Keep old properties as optional for backward compatibility
  periodName?: string;
  operatingRevenue?: number;
  assetSales?: number;
  financing?: number;
  totalInflows?: number;
  operatingExpenses?: number;
  capitalExpenditure?: number;
  debtPayments?: number;
  taxes?: number;
  totalOutflows?: number;
  netCashFlow?: number;
  cumulativeCashFlow?: number;
  beginningBalance?: number;
  endingBalance?: number;
  cashFlowMargin?: number;
  operatingCashFlowRatio?: number;
}

export interface RiskAnalysis {
  mortalityImpact: number;
  priceVolatilityImpact: number;
  feedCostRisk: number;
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// ===== NEW INTERFACES NEEDED BY CALCULATOR =====

export interface TaxBreakdown {
  incomeTax: number;
  vat: number;
  localTaxes: number;
  specialTaxes: number;
  total: number;
}

export interface ComplianceStatus {
  isCompliant: boolean;
  requirements: any[];
  certifications: any[];
}

// ===== SCENARIO ANALYSIS (simplified to avoid circular reference) =====

export interface ScenarioComparison {
  base: {
    netProfit: number;
    roi: number;
    profitMargin: number;
    totalRevenue: number;
    totalCosts: number;
  };
  optimistic: {
    netProfit: number;
    roi: number;
    profitMargin: number;
    totalRevenue: number;
    totalCosts: number;
  };
  pessimistic: {
    netProfit: number;
    roi: number;
    profitMargin: number;
    totalRevenue: number;
    totalCosts: number;
  };
}

export interface ScenarioAnalysis {
  scenarioName?: string;
  description?: string;
  probability?: number;
  
  // Support the structure returned by calculator.ts
  pessimistic?: {
    name: string;
    probability: number;
    netProfit: number;
    roi: number;
    breakEvenDays: number;
    assumptions: {
      priceVariation: number;
      costVariation: number;
      mortalityRate: number;
    };
  };
  realistic?: {
    name: string;
    probability: number;
    netProfit: number;
    roi: number;
    breakEvenDays: number;
    assumptions: {
      priceVariation: number;
      costVariation: number;
      mortalityRate: number;
    };
  };
  optimistic?: {
    name: string;
    probability: number;
    netProfit: number;
    roi: number;
    breakEvenDays: number;
    assumptions: {
      priceVariation: number;
      costVariation: number;
      mortalityRate: number;
    };
  };
  
  // Keep old properties as optional
  inputChanges?: {
    priceChange: number;
    costChange: number;
    volumeChange: number;
    mortalityChange: number;
  };
  projectedResults?: {
    netProfit: number;
    roi: number;
    profitMargin: number;
    totalRevenue: number;
    totalCosts: number;
  };
  impactAnalysis?: {
    revenueImpact: number;
    costImpact: number;
    profitImpact: number;
    roiImpact: number;
  };
  riskMetrics?: {
    valueAtRisk: number;
    expectedShortfall: number;
    probabilityOfLoss: number;
  };
}

// ===== MAIN RESULT INTERFACE =====

export interface ProfitabilityResult {
  // ===== CORE FINANCIAL METRICS =====
  netProfit: number;
  profitMargin: number;
  roi: number;
  breakEvenPoint: number;
  
  // ===== REVENUE METRICS =====
  totalRevenue: number;         // Total revenue from all sources
  grossRevenue: number;         // ✅ ADDED BACK: Used by calculator.ts
  salesVolume: number;
  averageSellingPrice: number;
  revenuePerHead: number;
  
  // ===== COST METRICS (✅ FIXED: Clear hierarchy) =====
  totalCosts: number;           // Total of operating + capital
  totalOperatingCosts: number;  // Subset of totalCosts
  totalCapitalCosts: number;    // Subset of totalCosts
  costPerHead: number;          // Cost per animal
  profitPerHead: number;        // Profit per animal
  
  // ===== ADDITIONAL COST PROPERTIES FROM CALCULATOR =====
  purchaseCosts: number;
  feedCosts: number;
  operationalCosts: number;
  financingCosts: number;
  
  // ===== DETAILED BREAKDOWNS =====
  revenue: RevenueBreakdown;    // Revenue breakdown structure
  costs: CostBreakdown;         // Cost breakdown structure
  costBreakdown: CostBreakdown; // Added: calculator returns this
  
  // ===== PROFITABILITY METRICS FROM CALCULATOR =====
  grossProfit: number;
  operatingProfit: number;
  ebitda: number;
  
  // ===== ANALYSIS PROJECTIONS =====
  monthlyProjections?: MonthlyProjection[];
  cashFlowProjections?: CashFlowProjection[];
  cashFlow?: CashFlowProjection[]; // Added: calculator returns this
  riskAnalysis?: RiskAnalysis;
  
  // ===== MARGIN ANALYSIS =====
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  
  // ===== COST RATIOS =====
  costOfFeedRatio: number;
  laborCostRatio: number;
  operatingExpenseRatio: number;
  
  // ===== TIME & EFFICIENCY METRICS =====
  paybackPeriod: number;
  productionCycle: number;
  feedConversionRatio: number;
  feedConversion?: number;       // Added: calculator returns this
  weightGainPerDay: number;
  dailyWeightGain?: number;      // Added: calculator returns this
  daysToMarket: number;
  
  // ===== FINANCIAL RATIOS =====
  currentRatio: number;
  debtToEquityRatio: number;
  assetTurnover: number;
  irr?: number;                  // Added: calculator returns this
  npv?: number;                  // Added: calculator returns this
  
  // ===== EFFICIENCY METRICS FROM CALCULATOR =====
  costPerKg?: number;
  profitPerKg?: number;
  
  // ===== RISK METRICS FROM CALCULATOR =====
  safetyMargin?: number;
  priceRisk?: number;
  
  // ===== MARKET METRICS =====
  marketShare?: number;
  competitivePosition?: string;
  priceCompetitiveness: number;
  
  // ===== SUSTAINABILITY METRICS =====
  carbonFootprint?: number;
  waterUsageEfficiency?: number;
  landUseEfficiency: number;
  
  // ===== TAX & COMPLIANCE FROM CALCULATOR =====
  taxes?: number;
  taxBreakdown?: TaxBreakdown;
  complianceStatus?: ComplianceStatus;
  
  // ===== RECOMMENDATIONS =====
  recommendations?: {
    category: 'cost-reduction' | 'revenue-increase' | 'risk-management' | 'efficiency-improvement';
    priority: 'high' | 'medium' | 'low';
    description: string;
    estimatedImpact: number;
    implementationCost?: number;
    timeframe?: string;
  }[];
  
  // ===== SCENARIO COMPARISONS (✅ FIXED: Flexible types) =====
  scenarios?: ScenarioComparison | ScenarioAnalysis | ScenarioAnalysis[] | any;
}

// ===== SUPPORTING INTERFACES =====

export interface LivestockCalculationInputs {
  data: LivestockData;
  
  // Market conditions
  marketPrices: {
    currentPrice: number;
    projectedPrice: number;
    priceHistory: Array<{ date: Date; price: number }>;
  };
  
  // Regional factors
  regionalFactors: {
    feedCostMultiplier: number;
    laborCostMultiplier: number;
    transportCostMultiplier: number;
    marketAccessScore: number;
  };
  
  // Economic conditions
  economicConditions: {
    inflationRate: number;
    interestRate: number;
    exchangeRate?: number;
    gdpGrowthRate: number;
  };
}

export interface ValidationRules {
  minInventory: number;
  maxInventory: number;
  minWeight: number;
  maxWeight: number;
  minPrice: number;
  maxPrice: number;
  maxMortalityRate: number;
  maxFinancingRate: number;
}

export interface CalculationConstants {
  // Default values
  defaultFeedConversionRatio: number;
  defaultDailyWeightGain: number;
  defaultMortalityRate: number;
  
  // Calculation factors
  insuranceRatePercentage: number;
  depreciationRatePercentage: number; // ✅ FIXED: Was "deprecation"
  managementCostPercentage: number;
  
  // Market factors
  seasonalPriceVariation: number;
  qualityPremiumPercentage: number;
  certificationPremiumPercentage: number;
}

export interface LivestockPerformanceMetrics {
  averageDailyGain: number;
  feedConversionRatio: number;
  daysToMarket: number;
  mortalityRate: number;
  morbidityRate: number;
  reproductionRate?: number;
  calfWeightAtWeaning?: number;
}

export interface MarketConditions {
  currentMarketPrice: number;
  priceVolatility: number;
  demandIndex: number;
  supplyIndex: number;
  seasonalFactors: Array<{
    month: number;
    priceMultiplier: number;
    demandLevel: 'low' | 'medium' | 'high';
  }>;
}