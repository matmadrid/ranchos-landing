// src/lib/pdf-generator.ts
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para la generación de PDF
interface PDFData {
  ranchName: string;
  stats: {
    totalAnimals: number;
    femaleCount: number;
    maleCount: number;
    avgProduction: number;
    totalProduction: number;
    topBreed: { name: string; count: number };
    avgWeight: number;
    healthDistribution: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };
  };
  animals: Array<{
    tag: string;
    name?: string;
    breed: string;
    sex: string;
    weight?: number;
    healthStatus: string;
    avgProduction?: number;
  }>;
  milkProductions?: Array<{
    date: string;
    liters: number;
  }>;
}

// Función principal para generar PDF
export async function generateAnalyticsPDF(data: PDFData): Promise<void> {
  try {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();
    let currentY = 20;

    doc.setFont('helvetica');
    
    // ENCABEZADO
    doc.setFontSize(20);
    doc.setTextColor(40, 44, 52);
    doc.text('Reporte de Analytics', 20, currentY);
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`Rancho: ${data.ranchName}`, 20, currentY + 10);
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, currentY + 20);
    
    currentY += 40;

    // ESTADÍSTICAS GENERALES
    doc.setFontSize(16);
    doc.setTextColor(40, 44, 52);
    doc.text('Resumen General', 20, currentY);
    currentY += 15;

    const statsData = [
      ['Métrica', 'Valor'],
      ['Total de animales', data.stats.totalAnimals.toString()],
      ['Hembras', data.stats.femaleCount.toString()],
      ['Machos', data.stats.maleCount.toString()],
      ['Producción promedio por vaca (L/día)', data.stats.avgProduction.toFixed(2)],
      ['Producción total mensual (L)', data.stats.totalProduction.toFixed(0)],
      ['Raza predominante', `${data.stats.topBreed.name} (${data.stats.topBreed.count})`],
      ['Peso promedio (kg)', data.stats.avgWeight.toFixed(0)]
    ];

    (doc as any).autoTable({
      head: [statsData[0]],
      body: statsData.slice(1),
      startY: currentY,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [248, 249, 250] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;

    // DISTRIBUCIÓN DE SALUD
    doc.setFontSize(16);
    doc.text('Distribución de Salud', 20, currentY);
    currentY += 15;

    const healthTotal = data.stats.totalAnimals || 1;
    const healthData = [
      ['Estado de Salud', 'Cantidad', 'Porcentaje'],
      ['Excelente', data.stats.healthDistribution.excellent.toString(), 
       `${((data.stats.healthDistribution.excellent / healthTotal) * 100).toFixed(1)}%`],
      ['Buena', data.stats.healthDistribution.good.toString(),
       `${((data.stats.healthDistribution.good / healthTotal) * 100).toFixed(1)}%`],
      ['Regular', data.stats.healthDistribution.fair.toString(),
       `${((data.stats.healthDistribution.fair / healthTotal) * 100).toFixed(1)}%`],
      ['Mala', data.stats.healthDistribution.poor.toString(),
       `${((data.stats.healthDistribution.poor / healthTotal) * 100).toFixed(1)}%`]
    ];

    (doc as any).autoTable({
      head: [healthData[0]],
      body: healthData.slice(1),
      startY: currentY,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [34, 197, 94] },
      alternateRowStyles: { fillColor: [248, 249, 250] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;

    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    // DETALLE DE ANIMALES
    doc.setFontSize(16);
    doc.text('Detalle de Animales', 20, currentY);
    currentY += 15;

    const animalHeaders = ['Etiqueta', 'Nombre', 'Raza', 'Sexo', 'Peso (kg)', 'Salud', 'Prod. Prom.'];
    const animalData = data.animals.map(animal => [
      animal.tag,
      animal.name || '-',
      animal.breed,
      animal.sex === 'female' ? 'Hembra' : 'Macho',
      animal.weight?.toString() || '-',
      animal.healthStatus,
      animal.avgProduction ? animal.avgProduction.toFixed(2) + ' L' : 'N/A'
    ]);

    (doc as any).autoTable({
      head: [animalHeaders],
      body: animalData,
      startY: currentY,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [168, 85, 247] },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 }
      }
    });

    // PIE DE PÁGINA
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text('Generado por RanchoOS', 150, doc.internal.pageSize.height - 10);
    }

    const fileName = `analytics_${data.ranchName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Error al generar el PDF: ' + (error as Error).message);
  }
}

// Función auxiliar para convertir gráfico a imagen
export async function chartToImage(chartElement: HTMLCanvasElement): Promise<string> {
  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(chartElement);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error converting chart to image:', error);
    return '';
  }
}

// Función para generar reporte específico de producción
export async function generateProductionPDF(data: {
  ranchName: string;
  productions: Array<{ date: string; liters: number }>;
  period: string;
}): Promise<void> {
  try {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Producción de Leche', 20, 20);
    doc.setFontSize(12);
    doc.text(`Rancho: ${data.ranchName}`, 20, 35);
    doc.text(`Período: ${data.period}`, 20, 45);
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 55);

    const totalProduction = data.productions.reduce((sum, p) => sum + p.liters, 0);
    const avgDaily = data.productions.length > 0 ? totalProduction / data.productions.length : 0;
    const maxDaily = data.productions.length > 0 ? Math.max(...data.productions.map(p => p.liters)) : 0;
    const minDaily = data.productions.length > 0 ? Math.min(...data.productions.map(p => p.liters)) : 0;

    const summaryData = [
      ['Métrica', 'Valor'],
      ['Producción total', `${totalProduction.toFixed(0)} L`],
      ['Promedio diario', `${avgDaily.toFixed(1)} L`],
      ['Máximo diario', `${maxDaily.toFixed(0)} L`],
      ['Mínimo diario', `${minDaily.toFixed(0)} L`],
      ['Días registrados', data.productions.length.toString()]
    ];

    (doc as any).autoTable({
      head: [summaryData[0]],
      body: summaryData.slice(1),
      startY: 70,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    if (data.productions.length > 0) {
      const productionHeaders = ['Fecha', 'Producción (L)', 'Variación'];
      const productionData = data.productions.map((prod, index) => {
        const prevProd = index > 0 ? data.productions[index - 1].liters : prod.liters;
        const variation = index > 0 ? ((prod.liters - prevProd) / prevProd * 100).toFixed(1) + '%' : '-';
        
        return [
          format(new Date(prod.date), 'dd/MM/yyyy', { locale: es }),
          prod.liters.toFixed(1),
          variation
        ];
      });

      (doc as any).autoTable({
        head: [productionHeaders],
        body: productionData,
        startY: (doc as any).lastAutoTable.finalY + 20,
        margin: { left: 20, right: 20 },
        styles: { fontSize: 9 },
        headStyles: { fillColor: [34, 197, 94] },
        alternateRowStyles: { fillColor: [248, 249, 250] }
      });
    }

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text('Generado por RanchoOS', 150, doc.internal.pageSize.height - 10);
    }

    const fileName = `produccion_${data.ranchName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating production PDF:', error);
    throw new Error('Error al generar el PDF de producción: ' + (error as Error).message);
  }
}