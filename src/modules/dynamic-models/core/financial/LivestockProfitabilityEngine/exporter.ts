// LivestockProfitabilityEngine/exporter.ts
import { ExportFormat, LocaleConfig } from '../../../types/base';
import { ProfitabilityResult } from './types';
import * as XLSX from 'xlsx';

export class LivestockExporter {
  export(result: ProfitabilityResult, format: ExportFormat, locale: LocaleConfig): Buffer {
    switch (format) {
      case 'excel':
        return this.exportToExcel(result, locale);
      case 'pdf':
        return this.exportToPDF(result, locale);
      case 'csv':
        return this.exportToCSV(result, locale);
      case 'json':
        return this.exportToJSON(result, locale);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private exportToExcel(result: ProfitabilityResult, locale: LocaleConfig): Buffer {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Concepto', 'Valor'],
      ['Ganancia Neta', this.formatCurrency(result.netProfit, locale)],
      ['Margen de Ganancia (%)', result.profitMargin.toFixed(2)],
      ['ROI (%)', result.roi.toFixed(2)],
      ['Punto de Equilibrio', result.breakEvenPoint.toString()],
      ['Ingresos Totales', this.formatCurrency(result.totalRevenue, locale)],
      ['Costos Totales', this.formatCurrency(result.totalCosts, locale)]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
    
    // Detailed breakdown sheet
    const detailData = [
      ['Categoría', 'Subcategoría', 'Valor'],
      ['Ingresos', 'Venta de Ganado', this.formatCurrency(result.revenue.livestock, locale)],
      ['Ingresos', 'Otros', this.formatCurrency(result.revenue.other || 0, locale)],
      ['Costos', 'Alimentación', this.formatCurrency(result.costs.feed, locale)],
      ['Costos', 'Mano de Obra', this.formatCurrency(result.costs.labor, locale)],
      ['Costos', 'Veterinario', this.formatCurrency(result.costs.veterinary, locale)],
      ['Costos', 'Infraestructura', this.formatCurrency(result.costs.infrastructure, locale)],
      ['Costos', 'Transporte', this.formatCurrency(result.costs.transport, locale)],
      ['Costos', 'Otros', this.formatCurrency(result.costs.other || 0, locale)]
    ];
    
    const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detalle');
    
    // Monthly projections if available
    if (result.monthlyProjections && result.monthlyProjections.length > 0) {
      const projectionsData = [
        ['Mes', 'Ingresos', 'Costos', 'Ganancia Neta']
      ];
      
      result.monthlyProjections.forEach((month, index) => {
        projectionsData.push([
          `Mes ${index + 1}`,
          this.formatCurrency(month.revenue, locale),
          this.formatCurrency(month.costs, locale),
          this.formatCurrency(month.profit || month.netProfit || 0, locale) // Updated to use profit first
        ]);
      });
      
      const projectionsSheet = XLSX.utils.aoa_to_sheet(projectionsData);
      XLSX.utils.book_append_sheet(workbook, projectionsSheet, 'Proyecciones');
    }
    
    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  }

  private exportToCSV(result: ProfitabilityResult, locale: LocaleConfig): Buffer {
    const csvData = [
      ['Concepto', 'Valor'],
      ['Ganancia Neta', this.formatCurrency(result.netProfit, locale)],
      ['Margen de Ganancia (%)', result.profitMargin.toFixed(2)],
      ['ROI (%)', result.roi.toFixed(2)],
      ['Punto de Equilibrio', result.breakEvenPoint.toString()],
      ['Ingresos Totales', this.formatCurrency(result.totalRevenue, locale)],
      ['Costos Totales', this.formatCurrency(result.totalCosts, locale)],
      [''],
      ['DESGLOSE DE INGRESOS'],
      ['Venta de Ganado', this.formatCurrency(result.revenue.livestock, locale)],
      ['Otros Ingresos', this.formatCurrency(result.revenue.other || 0, locale)],
      [''],
      ['DESGLOSE DE COSTOS'],
      ['Alimentación', this.formatCurrency(result.costs.feed, locale)],
      ['Mano de Obra', this.formatCurrency(result.costs.labor, locale)],
      ['Veterinario', this.formatCurrency(result.costs.veterinary, locale)],
      ['Infraestructura', this.formatCurrency(result.costs.infrastructure, locale)],
      ['Transporte', this.formatCurrency(result.costs.transport, locale)],
      ['Otros Costos', this.formatCurrency(result.costs.other || 0, locale)]
    ];
    
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    return Buffer.from(csvContent, 'utf-8');
  }

  private exportToPDF(result: ProfitabilityResult, locale: LocaleConfig): Buffer {
    // Simple PDF implementation - in a real scenario you'd use a library like PDFKit
    const pdfContent = `
REPORTE DE RENTABILIDAD GANADERA
================================

Ganancia Neta: ${this.formatCurrency(result.netProfit, locale)}
Margen de Ganancia: ${result.profitMargin.toFixed(2)}%
ROI: ${result.roi.toFixed(2)}%
Punto de Equilibrio: ${result.breakEvenPoint} unidades

INGRESOS TOTALES: ${this.formatCurrency(result.totalRevenue, locale)}
- Venta de Ganado: ${this.formatCurrency(result.revenue.livestock, locale)}
- Otros: ${this.formatCurrency(result.revenue.other || 0, locale)}

COSTOS TOTALES: ${this.formatCurrency(result.totalCosts, locale)}
- Alimentación: ${this.formatCurrency(result.costs.feed, locale)}
- Mano de Obra: ${this.formatCurrency(result.costs.labor, locale)}
- Veterinario: ${this.formatCurrency(result.costs.veterinary, locale)}
- Infraestructura: ${this.formatCurrency(result.costs.infrastructure, locale)}
- Transporte: ${this.formatCurrency(result.costs.transport, locale)}
- Otros: ${this.formatCurrency(result.costs.other || 0, locale)}

Generado el: ${new Date().toLocaleDateString(locale.language)}
    `.trim();
    
    return Buffer.from(pdfContent, 'utf-8');
  }

  private exportToJSON(result: ProfitabilityResult, locale: LocaleConfig): Buffer {
    const jsonData = {
      summary: {
        netProfit: result.netProfit,
        netProfitFormatted: this.formatCurrency(result.netProfit, locale),
        profitMargin: result.profitMargin,
        roi: result.roi,
        breakEvenPoint: result.breakEvenPoint,
        totalRevenue: result.totalRevenue,
        totalCosts: result.totalCosts
      },
      revenue: {
        livestock: result.revenue.livestock,
        livestockFormatted: this.formatCurrency(result.revenue.livestock, locale),
        other: result.revenue.other || 0,
        otherFormatted: this.formatCurrency(result.revenue.other || 0, locale)
      },
      costs: {
        feed: result.costs.feed,
        feedFormatted: this.formatCurrency(result.costs.feed, locale),
        labor: result.costs.labor,
        laborFormatted: this.formatCurrency(result.costs.labor, locale),
        veterinary: result.costs.veterinary,
        veterinaryFormatted: this.formatCurrency(result.costs.veterinary, locale),
        infrastructure: result.costs.infrastructure,
        infrastructureFormatted: this.formatCurrency(result.costs.infrastructure, locale),
        transport: result.costs.transport,
        transportFormatted: this.formatCurrency(result.costs.transport, locale),
        other: result.costs.other || 0,
        otherFormatted: this.formatCurrency(result.costs.other || 0, locale)
      },
      monthlyProjections: result.monthlyProjections?.map(month => ({
        ...month,
        profit: month.profit || month.netProfit || 0,  // Ensure backward compatibility
        profitFormatted: this.formatCurrency(month.profit || month.netProfit || 0, locale)
      })) || [],
      metadata: {
        exportedAt: new Date().toISOString(),
        locale: locale.country,
        currency: locale.currency,
        format: 'json'
      }
    };
    
    return Buffer.from(JSON.stringify(jsonData, null, 2), 'utf-8');
  }

  private formatCurrency(value: number, locale: LocaleConfig): string {
    return new Intl.NumberFormat(locale.language, {
      style: 'currency',
      currency: locale.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}

export default LivestockExporter;