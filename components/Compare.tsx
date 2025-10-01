import React, { useState, useMemo, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import type { LcaReport, LcaInputData, User, ImpactResult } from '../types';
import { getLcaAnalysis, getComparisonSuggestion, getAIOptimizedMaterialSuggestion } from '../services/geminiService';
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter } from 'recharts';
import { BrainIcon, DocumentTextIcon, ALL_METALS } from '../constants';
import AILoadingAnimation from './ui/AILoadingAnimation';
import PrimaryRecycledComparisonDetailedChart from './charts/PrimaryRecycledComparisonDetailedChart';

const inputStyles = "mt-1 block w-full px-3 py-2 border border-gray-400 bg-white text-[var(--text-on-light-primary)] rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] sm:text-sm";

const MATERIALS = ["Steel", "Aluminum (Al)", "Copper (Cu)", "Cement", "Polymers (PET)", "Composites (CFRP)", "Solar PV Panel", "Wind Turbine Blade"];

interface CompareProps {
    currentUser: User;
    workspaceId: string;
    reports: LcaReport[];
}

const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-2 bg-white border border-gray-300 rounded-md shadow-lg text-sm">
                <p className="font-bold mb-1">{data.name}</p>
                <p>GWP: {data.gwp.toFixed(0)} kg CO₂-eq</p>
                <p>Circularity: {data.circularity.toFixed(0)}%</p>
            </div>
        );
    }
    return null;
};

const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const subject = payload[0].payload.subject;
        return (
            <div className="p-2 bg-white border border-gray-300 rounded-md shadow-lg text-sm">
                <p className="font-bold mb-1">{subject}</p>
                {payload.map((p: any) => {
                    const originalValue = p.payload[`${p.dataKey}_original`];
                    const unit = p.payload[`${p.dataKey}_unit`];
                    return (
                        <p key={p.dataKey} style={{ color: p.color }}>
                            {p.name}: {originalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unit}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};


export const Compare: React.FC<CompareProps> = ({ currentUser, workspaceId, reports }) => {
    const [scenarioData, setScenarioData] = useState<Omit<LcaInputData, 'material' | 'projectName' | 'intendedApplication' | 'intendedAudience' | 'isComparativeAssertion' | 'systemBoundary' | 'limitations' | 'reliability' | 'completeness' | 'temporal' | 'geographical' | 'technological' | 'adqi' | 'uncertaintyDeviation'>>({
        category: 'Automotive',
        productionProcess: 'primary',
        secondaryMaterialContent: 10,
        alloyComplexity: 'simple',
        coatingsAndAdditives: 'none',
        transportationStages: [{ id: 1, name: 'Standard Transport', mode: 'Truck', distance: 500, fuelType: 'Diesel' }],
        functionalUnit: '1 unit of product',
        usePhase: '15 years',
        endOfLife: '75% Recycled',
        region: 'Global Average',
        gridElectricityMix: 'National Average',
        processEnergyEfficiency: 85,
        waterSourceType: 'Surface',
        wasteTreatmentMethod: 'Controlled Landfill',
        productLifetimeExtensionPotential: 15,
    });
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>(['Steel', 'Aluminum (Al)']);
    const [comparisonResults, setComparisonResults] = useState<LcaReport[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [aiOptimizedSuggestion, setAIOptimizedSuggestion] = useState<{ material: string, status: 'generating' | 'complete' } | null>(null);
    const [seriesVisibility, setSeriesVisibility] = useState<{ [key: string]: boolean }>({});

    // --- NEW STATE FOR WORKSPACE REPORT VISUALIZATION ---
    const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
    const [radarSeriesVisibility, setRadarSeriesVisibility] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (reports.length > 0) {
            const recentReportIds = [...reports]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 2)
                .map(r => r.id);
            setSelectedReportIds(recentReportIds);
        }
    }, [reports]);

    const handleReportSelectionChange = (reportId: string) => {
        setSelectedReportIds(prev =>
            prev.includes(reportId)
                ? prev.filter(id => id !== reportId)
                : [...prev, reportId]
        );
    };

    const selectedReports = useMemo(() =>
        reports.filter(r => selectedReportIds.includes(r.id)),
        [reports, selectedReportIds]
    );

    useEffect(() => {
        if (selectedReports.length > 0) {
            const initialVisibility = selectedReports.reduce((acc, result) => {
                acc[result.title] = true;
                return acc;
            }, {} as { [key: string]: boolean });
            setRadarSeriesVisibility(initialVisibility);
        }
    }, [selectedReportIds]);

    const handleRadarLegendClick = (e: any) => {
        const { dataKey } = e;
        setRadarSeriesVisibility(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
    };

    const scatterDataByMaterial = useMemo(() => {
        if (selectedReports.length === 0) return [];
        
        const groupedByMaterial = selectedReports.reduce((acc, report) => {
            const material = report.inputs.material;
            if (!acc[material]) {
                acc[material] = [];
            }
            acc[material].push({
                gwp: report.impacts.gwp.value,
                circularity: report.circularityScore,
                name: report.title,
            });
            return acc;
        }, {} as Record<string, { gwp: number; circularity: number; name: string }[]>);

        return Object.entries(groupedByMaterial).map(([name, data]) => ({
            name,
            data
        }));
    }, [selectedReports]);

    const radarData = useMemo(() => {
        if (selectedReports.length < 1) return [];
        const subjects: { name: string; key: keyof LcaReport['impacts'] }[] = [
            { name: 'GWP', key: 'gwp' },
            { name: 'Energy', key: 'energy' },
            { name: 'Water', key: 'water' },
            { name: 'Acidification', key: 'acidification' },
            { name: 'Eutrophication', key: 'eutrophication' },
        ];

        const maxValues: { [key: string]: number } = {};
        subjects.forEach(({ key }) => {
            maxValues[key] = Math.max(...selectedReports.map(r => (r.impacts[key] as ImpactResult)?.value || 0), 1);
        });

        const dataForRadar = subjects.map(({ name, key }) => {
            const entry: { [key: string]: any } = { subject: name };
            selectedReports.forEach(report => {
                const impact = report.impacts[key] as ImpactResult | undefined;
                if (impact) {
                    entry[report.title] = (impact.value / maxValues[key]) * 100;
                    entry[`${report.title}_original`] = impact.value;
                    entry[`${report.title}_unit`] = impact.unit;
                }
            });
            return entry;
        });

        return dataForRadar;
    }, [selectedReports]);

     const handleRunComparison = async () => {
        if (selectedMaterials.length < 2) return;
        setIsLoading(true);
        setComparisonResults([]);
        setAiSuggestion(null);

        const results: LcaReport[] = [];
        for (const material of selectedMaterials) {
            const inputs: LcaInputData = {
                ...scenarioData,
                material: material,
                projectName: `Comparison for ${scenarioData.category}`,
                intendedApplication: 'Screening comparison',
                intendedAudience: 'Internal',
                isComparativeAssertion: false,
                systemBoundary: ['Cradle-to-Gate'],
                limitations: 'Screening level data',
                reliability: 3, completeness: 3, temporal: 3, geographical: 3, technological: 3,
                adqi: 3, uncertaintyDeviation: 20,
            };
            const report = await getLcaAnalysis(inputs, currentUser, workspaceId);
            results.push(report);
        }
        
        setComparisonResults(results);
        const suggestion = getComparisonSuggestion(results, scenarioData.category);
        setAiSuggestion(suggestion);
        setIsLoading(false);
    };

    const handleMaterialSelect = (material: string) => {
        setSelectedMaterials(prev => 
            prev.includes(material) 
            ? prev.filter(m => m !== material)
            : [...prev, material]
        );
    };
    
    if (isLoading) {
        return <AILoadingAnimation />;
    }

    return (
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Compare Scenarios & Reports</h1>
            <p className="text-gray-600 mt-1">
                Run side-by-side analyses of different materials or visualize existing reports from your workspace.
            </p>
        </div>

        <Card>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">1. Define New Scenario for Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select name="category" value={scenarioData.category} onChange={e => setScenarioData(p => ({...p, category: e.target.value}))} className={inputStyles}><option>Automotive</option><option>Structural</option><option>Packaging</option></select>
                <select name="productionProcess" value={scenarioData.productionProcess} onChange={e => setScenarioData(p => ({...p, productionProcess: e.target.value as 'primary' | 'recycled'}))} className={inputStyles}><option value="primary">Primary Route</option><option value="recycled">Recycled Route</option></select>
                <input type="text" name="functionalUnit" value={scenarioData.functionalUnit} onChange={e => setScenarioData(p => ({...p, functionalUnit: e.target.value}))} className={inputStyles} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {MATERIALS.map(material => (
                    <label key={material} className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedMaterials.includes(material) ? 'bg-[var(--color-brand-primary)] text-white shadow-lg border-[var(--color-brand-primary)]' : 'bg-white hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={selectedMaterials.includes(material)} onChange={() => handleMaterialSelect(material)} className="hidden" />
                        <span className="font-semibold">{material}</span>
                    </label>
                ))}
            </div>
            <Button onClick={handleRunComparison} disabled={selectedMaterials.length < 2}>Run Comparison ({selectedMaterials.length} materials)</Button>
        </Card>

        {comparisonResults.length > 0 && (
            <Card>
                {aiSuggestion && (
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg mb-6">
                        <h3 className="font-bold flex items-center"><BrainIcon className="w-5 h-5 mr-2" /> AI Suggestion: Best Fit Material</h3>
                        <p className="mt-1 text-sm" dangerouslySetInnerHTML={{ __html: aiSuggestion }} />
                    </div>
                )}
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Impact Breakdown</h2>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonResults.map(r => ({ name: r.inputs.material, 'Global Warming Potential': r.impacts.gwp.value, 'Energy Demand': r.impacts.energy.value / 1000 }))} >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Global Warming Potential" fill="var(--color-brand-primary)" />
                        <Bar dataKey="Energy Demand" fill="var(--color-brand-secondary)" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        )}

        <Card>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">2. Visualize Workspace Reports</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Select reports from this workspace to compare their environmental profiles visually.</p>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 {reports.slice(0, 12).map(report => ( // Limit to 12 reports for readability
                     <label key={report.id} className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 text-sm ${selectedReportIds.includes(report.id) ? 'bg-[var(--color-brand-primary)] text-white shadow-lg border-[var(--color-brand-primary)]' : 'bg-white hover:bg-gray-50'}`}>
                         <input type="checkbox" checked={selectedReportIds.includes(report.id)} onChange={() => handleReportSelectionChange(report.id)} className="hidden" />
                         <span className="font-semibold block truncate">{report.title}</span>
                         <span className={`block text-xs ${selectedReportIds.includes(report.id) ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>{new Date(report.createdAt).toLocaleDateString()}</span>
                     </label>
                 ))}
             </div>
        </Card>

        {selectedReports.length > 0 && (
             <Card>
                 <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Radar Comparison</h3>
                 <ResponsiveContainer width="100%" height={300}>
                     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                         <PolarGrid />
                         <PolarAngleAxis dataKey="subject" />
                         <PolarRadiusAxis angle={30} domain={[0, 100]} />
                         <Tooltip content={<CustomRadarTooltip />} />
                         <Legend onClick={handleRadarLegendClick} />
                         {selectedReports.map((report, i) => (
                             <Radar
                                 key={report.id}
                                 name={report.title}
                                 dataKey={report.title}
                                 stroke={`hsl(${i * 60}, 70%, 50%)`}
                                 fill={`hsl(${i * 60}, 70%, 50%)`}
                                 fillOpacity={0.2}
                                 hide={!radarSeriesVisibility[report.title]}
                             />
                         ))}
                     </RadarChart>
                 </ResponsiveContainer>
             </Card>
        )}

      </div>
    );
};
export default Compare;