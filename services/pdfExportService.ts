import type { LcaReport, ExportOptions, ImpactResult, LcaInputData, RecommendationItem } from '../types';
import { MetalliQLogo } from '../components/ui/Logo';

// Helper to format numbers for the PDF
const formatNum = (value: number | undefined, decimals = 2): string => {
  if (value === undefined || value === null) return 'N/A';
  if (Math.abs(value) < 0.001 && value !== 0) return value.toExponential(1);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const SECTION_STYLE = {
    h1: { fontSize: 24, bold: true, margin: [0, 0, 0, 10], color: '#1A538C' }, 
    h2: { fontSize: 18, bold: true, margin: [0, 15, 0, 5], color: '#1D2C3D' }, 
    h3: { fontSize: 14, bold: true, margin: [0, 10, 0, 5], color: '#2D3748' }, 
    body: { fontSize: 10, margin: [0, 0, 0, 8], lineHeight: 1.15, color: '#2D3748' },
    quote: { fontSize: 10, italics: true, margin: [20, 5, 20, 10], color: '#718096', background: '#F7F9FC' },
    tableHeader: { bold: true, fontSize: 9, color: 'white', fillColor: '#1D2C3D' }, 
    dataTable: { margin: [0, 5, 0, 15], fontSize: 9 },
    tocEntry: { fontSize: 12, margin: [0, 0, 0, 5], color: '#1A538C' },
    listItem: { fontSize: 10, margin: [10, 0, 0, 5], color: '#2D3748' },
};

// --- SECTION BUILDERS ---

function buildTitlePage(report: LcaReport): any[] {
    return [
        {
            svg: MetalliQLogo({ width: 200, color: '#1A538C', textColor: '#1D2C3D' }),
            width: 200,
            alignment: 'center',
            margin: [0, 100, 0, 20]
        },
        { text: 'Life Cycle Assessment Report', style: SECTION_STYLE.h1, alignment: 'center', margin: [0, 20, 0, 0] },
        { text: report.title, style: SECTION_STYLE.h2, alignment: 'center', color: '#111827', margin: [0, 10, 0, 50] },
        { canvas: [{ type: 'line', x1: 100, y1: 5, x2: 420, y2: 5, lineWidth: 0.5, lineColor: '#D1D5DB' }], margin: [0, 50, 0, 50] },
        {
            table: {
                widths: ['auto', '*'],
                body: [
                    [{ text: 'Author:', bold: true }, report.author],
                    [{ text: 'Organization:', bold: true }, `Workspace ID: ${report.workspaceId}`],
                    [{ text: 'Date:', bold: true }, new Date(report.createdAt).toLocaleDateString()],
                ]
            },
            layout: 'noBorders',
            style: { margin: [0, 20, 0, 20], fontSize: 11, alignment: 'center' },
        },
        { text: 'This is a screening-level LCA intended for internal use and decision support.', alignment: 'center', italics: true, color: '#6B7281', margin: [0, 100, 0, 0], fontSize: 9 },
        { text: '', pageBreak: 'after' }
    ];
}

function buildExecutiveSummary(report: LcaReport): any[] {
    const mainResult = `The total Global Warming Potential (GWP) was determined to be ${formatNum(report.impacts.gwp.value, 0)} ${report.impacts.gwp.unit}.`;
    const mainFinding = `The analysis identifies ${report.supplyChainHotspots[0]?.name || 'the production stage'} as the most significant contributor to environmental impacts.`;
    const mainRec = `The primary recommendation is to ${report.aiActionPlan.recommendations[0]?.title.toLowerCase() || 'increase the use of recycled content'}.`;
    
    return [
        { text: '1. Executive Summary', style: 'h2', toc: { text: '1. Executive Summary', style: 'tocEntry' } },
        { text: `This study evaluates the environmental impact of one ${report.inputs.functionalUnit.toLowerCase()} of ${report.inputs.material}, based on the '${report.inputs.productionProcess}' production route. The system boundary for this analysis is cradle-to-grave.`, style: 'body' },
        { text: [mainResult, mainFinding, mainRec].join(' '), style: 'body' },
        { text: 'AI Interpretation Summary', style: 'h3' },
        { text: report.lifeCycleInterpretation, style: 'quote' },
    ];
}

function buildGoalAndScope(report: LcaReport): any[] {
    const { inputs } = report;
    const impactCategories = Object.values(report.impacts).map(i => i.name).filter(Boolean);
    
    return [
        { text: '2. Goal & Scope Definition (ISO 14044)', style: 'h2', toc: { text: '2. Goal & Scope Definition', style: 'tocEntry' } },
        {
            table: {
                widths: ['*', '*'],
                body: [
                    [{ text: 'Goal of the Study', bold: true }, inputs.intendedApplication],
                    [{ text: 'Functional Unit', bold: true }, inputs.functionalUnit],
                    [{ text: 'System Boundary', bold: true }, inputs.systemBoundary.join(', ')],
                    [{ text: 'Intended Audience', bold: true }, inputs.intendedAudience],
                    [{ text: 'Allocation Rules', bold: true }, 'Recycling credits are handled using the cut-off approach.'],
                    [{ text: 'Limitations', bold: true }, inputs.limitations],
                ]
            },
            layout: 'lightHorizontalLines',
            style: 'dataTable'
        },
        { text: 'Impact Categories Assessed', style: 'h3' },
        {
            columns: [
                { ul: impactCategories.slice(0, Math.ceil(impactCategories.length / 2)) },
                { ul: impactCategories.slice(Math.ceil(impactCategories.length / 2)) },
            ],
            style: 'listItem'
        }
    ];
}

function buildLci(report: LcaReport, svgs: Record<string, string>): any[] {
    const { inputs } = report;
    return [
        { text: '3. Life Cycle Inventory (LCI)', style: 'h2', toc: { text: '3. Life Cycle Inventory', style: 'tocEntry' }, pageBreak: 'before' },
        { text: 'The following table summarizes the key foreground data and parameters used in the life cycle model.', style: 'body' },
        { text: 'Key Input Parameters', style: 'h3' },
        {
            table: {
                widths: ['*', '*', '*', '*'],
                body: [
                    [{text: 'Parameter', style: 'tableHeader'}, {text: 'Value', style: 'tableHeader'}, {text: 'Parameter', style: 'tableHeader'}, {text: 'Value', style: 'tableHeader'}],
                    ['Material', inputs.material, 'Production Process', inputs.productionProcess],
                    ['Category', inputs.category, 'Alloy Complexity', inputs.alloyComplexity],
                    ['Region', inputs.region, 'Grid Electricity Mix', inputs.gridElectricityMix],
                    ['Use Phase', inputs.usePhase, 'End of Life', inputs.endOfLife],
                    [{ text: 'Transportation', colSpan: 4, style: 'tableHeader', alignment: 'center' }],
                    ...inputs.transportationStages.map(stage => [stage.name, stage.mode, `${stage.distance} km`, '']),
                ],
            },
            layout: 'lightHorizontalLines',
            style: 'dataTable'
        },
        { text: 'System Flow Diagram', style: 'h3' },
        svgs.processLifecycle ? { svg: svgs.processLifecycle, width: 500, alignment: 'center' } : { text: 'Process diagram not available.', style: 'body' }
    ];
}

function buildLcia(report: LcaReport, svgs: Record<string, string>): any[] {
    const { primaryVsRecycled } = report;
    const impactTableBody: (string | { text: string | number; style?: string; alignment?: 'right' | 'center' | 'justify' })[][] = [
        [
            {text: 'Impact Category', style: 'tableHeader'}, 
            {text: 'Primary Route', style: 'tableHeader', alignment: 'right'},
            {text: 'Recycled Route', style: 'tableHeader', alignment: 'right'},
            {text: 'Unit', style: 'tableHeader'},
        ]
    ];
    impactTableBody.push(['Global Warming', {text: formatNum(primaryVsRecycled.primaryGwp), alignment: 'right'}, {text: formatNum(primaryVsRecycled.recycledGwp), alignment: 'right'}, 'kg CO₂-eq']);
    impactTableBody.push(['Energy Demand', {text: formatNum(primaryVsRecycled.primaryEnergy), alignment: 'right'}, {text: formatNum(primaryVsRecycled.recycledEnergy), alignment: 'right'}, 'GJ']);
    impactTableBody.push(['Water Consumption', {text: formatNum(primaryVsRecycled.primaryWater), alignment: 'right'}, {text: formatNum(primaryVsRecycled.recycledWater), alignment: 'right'}, 'm³']);
    impactTableBody.push(['Acidification', {text: formatNum(primaryVsRecycled.primaryAcidification), alignment: 'right'}, {text: formatNum(primaryVsRecycled.recycledAcidification), alignment: 'right'}, 'kg SO₂-eq']);
    impactTableBody.push(['Eutrophication', {text: formatNum(primaryVsRecycled.primaryEutrophication), alignment: 'right'}, {text: formatNum(primaryVsRecycled.recycledEutrophication), alignment: 'right'}, 'kg PO₄-eq']);
    impactTableBody.push(['Ozone Depletion', {text: formatNum(primaryVsRecycled.primaryOdp), alignment: 'right'}, {text: formatNum(primaryVsRecycled.recycledOdp), alignment: 'right'}, 'kg CFC-11 eq']);

    return [
        { text: '4. Life Cycle Impact Assessment (LCIA)', style: 'h2', toc: { text: '4. Life Cycle Impact Assessment', style: 'tocEntry' }, pageBreak: 'before' },
        { text: 'The LCIA phase converts inventory data into environmental impact scores. The table below compares the primary (virgin) production route with the secondary (recycled) route.', style: 'body' },
        { text: 'Primary vs. Recycled Scenario Comparison', style: 'h3' },
        { table: { widths: ['*', 'auto', 'auto', 'auto'], body: impactTableBody }, layout: 'lightHorizontalLines', style: 'dataTable' },
        svgs.primaryRecycledDetailed ? { svg: svgs.primaryRecycledDetailed, width: 500, alignment: 'center' } : { text: 'Comparison chart not available.', style: 'body' },
        { text: 'Contribution Analysis', style: 'h3', margin: [0, 20, 0, 5] },
        {
            columns: [
                svgs.waterfall ? { svg: svgs.waterfall, width: 250 } : { text: '' },
                svgs.energySource ? { svg: svgs.energySource, width: 250 } : { text: '' }
            ]
        }
    ];
}

function buildCircularityAnalysis(report: LcaReport, svgs: Record<string, string>): any[] {
    return [
        { text: '5. Circularity Analysis', style: 'h2', toc: { text: '5. Circularity Analysis', style: 'tocEntry' }, pageBreak: 'before' },
        { text: 'This section details the circular economy performance of the product system, including material flows and key circularity metrics.', style: 'body' },
        {
            columns: [
                {
                    stack: [
                        { text: 'Circularity Score', style: 'h3'},
                        svgs.circularityAnalysis ? { svg: svgs.circularityAnalysis, width: 200, alignment: 'center' } : {text: ''}
                    ]
                },
                {
                    stack: [
                        { text: 'Key Metrics', style: 'h3'},
                        {
                            table: {
                                widths: ['*', 'auto'],
                                body: [
                                    ['Recyclability Rate', `${report.circularityDetails.recyclabilityRate}%`],
                                    ['Secondary Content', `${report.circularityDetails.secondaryMaterialContent}%`],
                                    ['Recovery Efficiency', `${report.circularityDetails.recoveryEfficiency}%`],
                                    ['Landfill Rate', `${report.circularityDetails.landfillRate}%`],
                                ]
                            },
                             layout: 'lightHorizontalLines', style: 'dataTable'
                        }
                    ]
                }
            ]
        },
        { text: 'Material Flow Analysis (Sankey Diagram)', style: 'h3', margin: [0, 15, 0, 5] },
        svgs.sankey ? { svg: svgs.sankey, width: 500, alignment: 'center' } : { text: 'Sankey diagram not available.', style: 'body' }
    ];
}

function buildInterpretation(report: LcaReport): any[] {
    const hotspotItems = report.supplyChainHotspots.map(h => ({
        text: `${h.name}: ${h.percentage.toFixed(0)}% contribution (Risk: ${h.risk})`
    }));

    const recommendationItems = report.aiActionPlan.recommendations.map((rec: RecommendationItem) => ([
        { text: rec.title, style: 'h3', margin: [0, 10, 0, 5] },
        { text: `Evidence: ${rec.evidence}`, italics: true, style: 'body' },
        { text: `Root Cause: ${rec.rootCause}`, style: 'body' },
        { text: 'Action Steps:', bold: true, style: 'body', margin: [0, 5, 0, 2] },
        { ul: rec.actionSteps.map(step => step.title), style: 'listItem' }
    ]));

    return [
        { text: '6. Interpretation', style: 'h2', toc: { text: '6. Interpretation', style: 'tocEntry' }, pageBreak: 'before' },
        { text: 'AI-Generated Interpretation Summary', style: 'h3' },
        { text: report.lifeCycleInterpretation, style: 'body' },
        { text: 'Identified Hotspots', style: 'h3' },
        { ul: hotspotItems, style: 'listItem' },
        { text: 'AI-Generated Recommendations', style: 'h3' },
        ...recommendationItems.flat(),
        { text: 'Uncertainty Discussion', style: 'h3' },
        { text: `The results of this study have an estimated uncertainty of ±${report.inputs.uncertaintyDeviation}%, based on a Monte Carlo simulation of 1,000 runs and an Aggregated Data Quality Index (ADQI) of ${formatNum(report.inputs.adqi, 2)}/5.0. For detailed distributions, see the Annexes.`, style: 'body' },
    ];
}

function buildConclusion(report: LcaReport): any[] {
    return [
        { text: '7. Conclusion', style: 'h2', toc: { text: '7. Conclusion', style: 'tocEntry' } },
        { text: `This Life Cycle Assessment demonstrates that for ${report.inputs.material}, the choice of production route has a substantial impact on environmental performance. Recycling ${report.inputs.material} can reduce the carbon footprint by approximately ${formatNum(report.primaryVsRecycled.gwpSavings, 0)}%.`, style: 'body' },
        { text: `The primary hotspot identified is the energy-intensive nature of virgin material processing. Therefore, for maximum impact reduction, strategies should focus on increasing the use of secondary (recycled) materials and improving energy efficiency in the manufacturing stage. The recommendations provided in the Interpretation section offer a clear path toward achieving these improvements.`, style: 'body' }
    ];
}

function buildReferences(): any[] {
    return [
        { text: '8. References', style: 'h2', toc: { text: '8. References', style: 'tocEntry' } },
        {
            ul: [
                'ISO 14040:2006 – Environmental management — Life cycle assessment — Principles and framework',
                'ISO 14044:2006 – Environmental management — Life cycle assessment — Requirements and guidelines',
                'Generic LCI Data: Sourced from industry-average databases (e.g., Ecoinvent, GaBi).',
            ],
            style: 'listItem'
        }
    ];
}

function buildAnnexes(report: LcaReport, svgs: Record<string, string>): any[] {
    return [
         { text: '9. Annexes', style: 'h2', toc: { text: '9. Annexes', style: 'tocEntry' }, pageBreak: 'before' },
         { text: 'A. Detailed Impact Results', style: 'h3' },
         svgs.overallImpact ? { svg: svgs.overallImpact, width: 500, alignment: 'center' } : { text: 'Overall impact chart not available.', style: 'body' },
         { text: 'B. Uncertainty Analysis (Monte Carlo Simulation)', style: 'h3', pageBreak: 'before' },
         { text: 'The following charts illustrate the distribution of potential outcomes based on 1,000 simulation runs to account for data uncertainty.', style: 'body' },
         svgs.monteCarloGwp ? { svg: svgs.monteCarloGwp, width: 500, alignment: 'center' } : { text: 'GWP Monte Carlo chart not available.', style: 'body' },
         svgs.monteCarloEnergy ? { svg: svgs.monteCarloEnergy, width: 500, alignment: 'center' } : { text: 'Energy Monte Carlo chart not available.', style: 'body' },
         svgs.monteCarloWater ? { svg: svgs.monteCarloWater, width: 500, alignment: 'center' } : { text: 'Water Monte Carlo chart not available.', style: 'body' },
    ];
}


export const exportLcaReportToPdf = async (
  report: LcaReport,
  svgs: Record<string, string>,
  options: ExportOptions
): Promise<void> => {
  const pdfMake = (window as any).pdfMake;
  if (!pdfMake) {
    console.error('pdfmake not found on window object.');
    alert('PDF export service is not available.');
    return;
  }

  const content: any[] = [
    ...buildTitlePage(report),
    { text: 'Table of Contents', style: 'h2', toc: { title: { text: 'Table of Contents', style: 'h2' } } },
    ...buildExecutiveSummary(report),
    ...buildGoalAndScope(report),
    ...buildLci(report, svgs),
    ...buildLcia(report, svgs),
    ...buildCircularityAnalysis(report, svgs),
    ...buildInterpretation(report),
    ...buildConclusion(report),
    ...buildReferences(),
    ...buildAnnexes(report, svgs),
  ];

  const docDefinition = {
    content,
    footer: (currentPage: number, pageCount: number) => ({
      text: `Page ${currentPage.toString()} of ${pageCount}`,
      alignment: 'center',
      style: 'footer'
    }),
    header: (currentPage: number) => {
        if (currentPage === 1) return null; // No header on title page
        return {
            columns: [
                { text: report.title, alignment: 'left', style: 'header' },
                { text: `Generated: ${new Date(report.createdAt).toLocaleDateString()}`, alignment: 'right', style: 'header' }
            ],
            margin: [40, 20, 40, 10]
        };
    },
    styles: {
      ...SECTION_STYLE,
      header: { fontSize: 9, color: '#6B7281', italics: true },
      footer: { fontSize: 9, color: '#6B7281' }
    },
    defaultStyle: {
        font: 'Roboto',
        columnGap: 20
    }
  };

  pdfMake.createPdf(docDefinition).download(`${report.title.replace(/\s/g, '_')}_LCA_Report.pdf`);
};