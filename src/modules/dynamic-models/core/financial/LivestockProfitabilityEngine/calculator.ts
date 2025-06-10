// src/modules/dynamic-models/core/financial/LivestockProfitabilityEngine/calculator.ts
import { LocaleConfig } from '../../../types/base';
import { 
  LivestockData, 
  ProfitabilityResult, 
  CostBreakdown, 
  MonthlyProjection,
  CashFlowProjection,
  ScenarioAnalysis,
  RevenueBreakdown
} from './types';

export class LivestockCalculator {
  async calculate(data: LivestockData, config: LocaleConfig): Promise<ProfitabilityResult> {
    // Calculate basic metrics
    const totalDays = this.calculateDays(data.periodStartDate, data.periodEndDate);
    const totalAnimals = data.initialInventory;
    const mortalityLoss = totalAnimals * (data.mortalityRate / 100);
    const finalInventory = totalAnimals - mortalityLoss;
    
    // Weight calculations
    const totalWeightGain = (data.expectedFinalWeight - data.averageWeight) * finalInventory;
    const dailyWeightGain = totalWeightGain / (finalInventory * totalDays);
    
    // Revenue calculations
    const salesVolume = finalInventory * data.expectedFinalWeight;
    const grossRevenue = salesVolume * data.salePrice;
    const revenuePerHead = grossRevenue / finalInventory;
    
    // Cost calculations
    const costs = this.calculateCosts(data, totalDays, totalAnimals);
    const totalCosts = this.sumCosts(costs);
    
    // Calculate individual cost components
    const totalOperatingCosts = costs.operationalCosts;
    const totalCapitalCosts = costs.purchaseCosts + costs.infrastructureCosts;
    const costPerHead = totalCosts / finalInventory;
    const profitPerHead = (grossRevenue - totalCosts) / finalInventory;
    
    // Profitability calculations
    const grossProfit = grossRevenue - costs.purchaseCosts - costs.feedCosts;
    const operatingProfit = grossProfit - costs.operationalCosts;
    const netProfit = operatingProfit - costs.financingCosts - costs.taxes;
    const ebitda = operatingProfit + costs.depreciation;
    
    // Margins
    const grossMargin = (grossProfit / grossRevenue) * 100;
    const operatingMargin = (operatingProfit / grossRevenue) * 100;
    const netMargin = (netProfit / grossRevenue) * 100;
    const profitMargin = netMargin; // Alias
    
    // Financial metrics
    const roi = (netProfit / data.initialInvestment) * 100;
    const irr = this.calculateIRR(data, netProfit, totalDays);
    const npv = this.calculateNPV(data, netProfit, config);
    const paybackPeriod = this.calculatePaybackPeriod(data.initialInvestment, netProfit, totalDays);
    
    // Efficiency metrics
    const costPerKg = totalCosts / salesVolume;
    const profitPerKg = netProfit / salesVolume;
    const feedConversion = costs.totalFeedConsumed / totalWeightGain;
    
    // Risk metrics
    const breakEvenPoint = this.calculateBreakEvenPoint(costs, data.salePrice);
    const safetyMargin = ((salesVolume - breakEvenPoint) / salesVolume) * 100;
    const priceRisk = this.calculatePriceRisk(data, netProfit);
    
    // Projections
    const monthlyProjections = this.generateMonthlyProjections(data, costs, totalDays);
    const cashFlow = this.generateCashFlow(data, costs, grossRevenue, totalDays);
    const scenarios = this.generateScenarios(data, costs, config);
    
    // Create revenue breakdown
    const revenueBreakdown: RevenueBreakdown = {
      livestock: grossRevenue,
      byProducts: 0,
      subsidies: 0,
      other: 0
    };
    
    // Calculate cost ratios
    const costOfFeedRatio = (costs.feedCosts / totalCosts) * 100;
    const laborCostRatio = (costs.breakdown.labor / totalCosts) * 100;
    const operatingExpenseRatio = (costs.operationalCosts / totalCosts) * 100;
    
    // Calculate additional metrics
    const productionCycle = totalDays;
    const feedConversionRatio = feedConversion;
    const weightGainPerDay = dailyWeightGain * 1000; // in grams
    const daysToMarket = totalDays;
    
    // Financial ratios
    const currentRatio = 1.5; // Simplified calculation
    const debtToEquityRatio = data.financingRate > 0 ? 0.6 : 0;
    const assetTurnover = grossRevenue / data.initialInvestment;
    
    // Market and sustainability metrics
    const priceCompetitiveness = 100; // Base value
    const landUseEfficiency = finalInventory / 100; // Animals per hectare (simplified)
    
    return {
      // Revenue
      totalRevenue: grossRevenue,  // Added to match type
      grossRevenue,
      salesVolume,
      averageSellingPrice: data.salePrice,
      revenuePerHead,
      
      // Costs
      totalCosts,
      totalOperatingCosts,         // Added
      totalCapitalCosts,           // Added
      costPerHead,                 // Added
      profitPerHead,               // Added
      purchaseCosts: costs.purchaseCosts,
      feedCosts: costs.feedCosts,
      operationalCosts: costs.operationalCosts,
      financingCosts: costs.financingCosts,
      costBreakdown: costs.breakdown,
      
      // Revenue and cost breakdowns
      revenue: revenueBreakdown,   // Added
      costs: costs.breakdown,      // Added
      
      // Profitability
      grossProfit,
      operatingProfit,
      netProfit,
      ebitda,
      
      // Margins & Ratios
      grossMargin,
      operatingMargin,
      netMargin,
      profitMargin,
      
      // Cost ratios
      costOfFeedRatio,             // Added
      laborCostRatio,              // Added
      operatingExpenseRatio,       // Added
      
      // Financial Metrics
      roi,
      irr,
      npv,
      paybackPeriod,
      currentRatio,                // Added
      debtToEquityRatio,           // Added
      assetTurnover,               // Added
      
      // Efficiency Metrics
      costPerKg,
      profitPerKg,
      feedConversion,
      feedConversionRatio,         // Added
      dailyWeightGain: weightGainPerDay,
      weightGainPerDay,            // Added
      productionCycle,             // Added
      daysToMarket,                // Added
      
      // Risk Metrics
      breakEvenPoint,
      safetyMargin,
      priceRisk,
      
      // Market metrics
      priceCompetitiveness,        // Added
      landUseEfficiency,           // Added
      
      // Projections
      monthlyProjections,
      cashFlow,
      cashFlowProjections: cashFlow, // Added alias
      scenarios,
      
      // Tax & Compliance
      taxes: costs.taxes,
      taxBreakdown: costs.taxBreakdown,
      complianceStatus: {
        isCompliant: true,
        requirements: [],
        certifications: []
      }
    };
  }
  
  private calculateCosts(data: LivestockData, totalDays: number, totalAnimals: number): any {
    const purchaseCosts = data.initialInventory * data.averageWeight * data.purchasePrice;
    const feedCosts = data.feedCostPerDay * totalAnimals * totalDays;
    const supplementCosts = (data.supplementCost || 0) * totalAnimals * totalDays;
    const totalFeedCosts = feedCosts + supplementCosts;
    
    const months = totalDays / 30;
    const laborCosts = data.laborCostPerMonth * months;
    const veterinaryCosts = data.veterinaryCostPerHead * totalAnimals;
    const transportCosts = data.transportCost;
    const infrastructureCosts = data.infrastructureCost;
    
    const operationalCosts = laborCosts + veterinaryCosts + transportCosts + infrastructureCosts;
    
    const financingCosts = data.financingRate 
      ? (purchaseCosts * (data.financingRate / 100) * (totalDays / 365))
      : 0;
    
    const subtotal = purchaseCosts + totalFeedCosts + operationalCosts + financingCosts;
    const taxes = subtotal * 0.15; // Simplified tax calculation
    
    const breakdown: CostBreakdown = {
      feed: totalFeedCosts,
      labor: laborCosts,
      veterinary: veterinaryCosts,
      infrastructure: infrastructureCosts,
      transport: transportCosts,
      financing: financingCosts,
      other: 0,
      percentages: {
        feed: (totalFeedCosts / subtotal) * 100,
        labor: (laborCosts / subtotal) * 100,
        veterinary: (veterinaryCosts / subtotal) * 100,
        infrastructure: (infrastructureCosts / subtotal) * 100,
        transport: (transportCosts / subtotal) * 100,
        financing: (financingCosts / subtotal) * 100,
        other: 0
      }
    };
    
    return {
      purchaseCosts,
      feedCosts: totalFeedCosts,
      operationalCosts,
      financingCosts,
      infrastructureCosts,  // Added for totalCapitalCosts calculation
      taxes,
      totalFeedConsumed: totalFeedCosts / (data.feedCostPerDay / 10), // Estimate kg
      depreciation: infrastructureCosts * 0.1, // 10% annual depreciation
      breakdown,
      taxBreakdown: {
        incomeTax: taxes * 0.6,
        vat: taxes * 0.3,
        localTaxes: taxes * 0.1,
        specialTaxes: 0,
        total: taxes
      }
    };
  }
  
  private sumCosts(costs: any): number {
    return costs.purchaseCosts + costs.feedCosts + costs.operationalCosts + 
           costs.financingCosts + costs.taxes;
  }
  
  private calculateDays(start: Date, end: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  private calculateIRR(data: LivestockData, netProfit: number, days: number): number {
    // Simplified IRR calculation
    const annualizedReturn = (netProfit / data.initialInvestment) * (365 / days);
    return annualizedReturn * 100;
  }
  
  private calculateNPV(data: LivestockData, netProfit: number, config: LocaleConfig): number {
    // Simplified NPV calculation
    const discountRate = 0.12; // 12% discount rate
    const years = this.calculateDays(data.periodStartDate, data.periodEndDate) / 365;
    return netProfit / Math.pow(1 + discountRate, years);
  }
  
  private calculatePaybackPeriod(initialInvestment: number, netProfit: number, totalDays: number): number {
    const dailyProfit = netProfit / totalDays;
    return Math.ceil(initialInvestment / dailyProfit);
  }
  
  private calculateBreakEvenPoint(costs: any, salePrice: number): number {
    const fixedCosts = costs.operationalCosts + costs.financingCosts;
    const variableCostPerUnit = (costs.purchaseCosts + costs.feedCosts) / 
                                (costs.totalAnimals * costs.averageWeight);
    return fixedCosts / (salePrice - variableCostPerUnit);
  }
  
  private calculatePriceRisk(data: LivestockData, baseProfit: number): number {
    const priceVolatility = data.priceVolatility || 0.15; // 15% default volatility
    const worstCasePrice = data.salePrice * (1 - priceVolatility);
    const worstCaseRevenue = data.initialInventory * data.expectedFinalWeight * worstCasePrice;
    const riskImpact = (baseProfit - worstCaseRevenue) / baseProfit;
    return riskImpact * 100;
  }
  
  private generateMonthlyProjections(data: LivestockData, costs: any, totalDays: number): MonthlyProjection[] {
    const months = Math.ceil(totalDays / 30);
    const projections: MonthlyProjection[] = [];
    const monthlyWeightGain = (data.expectedFinalWeight - data.averageWeight) / months;
    
    let cumulativeProfit = 0;
    
    for (let month = 1; month <= months; month++) {
      const currentWeight = data.averageWeight + (monthlyWeightGain * month);
      const monthlyRevenue = month === months ? 
        data.initialInventory * currentWeight * data.salePrice : 0;
      const monthlyCosts = (costs.totalCosts / months);
      const monthlyProfit = monthlyRevenue - monthlyCosts;
      cumulativeProfit += monthlyProfit;
      
      projections.push({
        month,
        revenue: monthlyRevenue,
        costs: monthlyCosts,
        profit: monthlyProfit,
        netProfit: monthlyProfit, // Added for compatibility
        cumulativeProfit,
        inventory: data.initialInventory,
        averageWeight: currentWeight
      });
    }
    
    return projections;
  }
  
  private generateCashFlow(data: LivestockData, costs: any, revenue: number, totalDays: number): CashFlowProjection[] {
    const periods = Math.ceil(totalDays / 30);
    const cashFlow: CashFlowProjection[] = [];
    let cumulativeFlow = -data.initialInvestment;
    
    for (let period = 1; period <= periods; period++) {
      const isLastPeriod = period === periods;
      const inflow = isLastPeriod ? revenue : 0;
      const outflow = costs.totalCosts / periods;
      const netFlow = inflow - outflow;
      cumulativeFlow += netFlow;
      
      cashFlow.push({
        period: `Month ${period}`,
        inflow,
        outflow,
        netFlow,
        cumulativeFlow
      });
    }
    
    return cashFlow;
  }
  
  private generateScenarios(data: LivestockData, costs: any, config: LocaleConfig): ScenarioAnalysis {
    const baseCase = {
      netProfit: costs.netProfit,
      roi: costs.roi
    };
    
    return {
      pessimistic: {
        name: 'Pesimista',
        probability: 0.25,
        netProfit: baseCase.netProfit * 0.7,
        roi: baseCase.roi * 0.7,
        breakEvenDays: 180,
        assumptions: {
          priceVariation: -15,
          costVariation: 10,
          mortalityRate: data.mortalityRate * 1.5
        }
      },
      realistic: {
        name: 'Realista',
        probability: 0.5,
        netProfit: baseCase.netProfit,
        roi: baseCase.roi,
        breakEvenDays: 120,
        assumptions: {
          priceVariation: 0,
          costVariation: 0,
          mortalityRate: data.mortalityRate
        }
      },
      optimistic: {
        name: 'Optimista',
        probability: 0.25,
        netProfit: baseCase.netProfit * 1.3,
        roi: baseCase.roi * 1.3,
        breakEvenDays: 90,
        assumptions: {
          priceVariation: 15,
          costVariation: -10,
          mortalityRate: data.mortalityRate * 0.5
        }
      }
    };
  }
}