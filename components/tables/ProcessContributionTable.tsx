import React, { useMemo } from 'react';
import type { LcaReport } from '../../types';

// --- DATA CALCULATION LOGIC ---
// This logic is adapted from ProcessLifecycleDiagram.tsx to be self-contained in this component.
type StageImpacts = { gwp: number; energy: number; water: number };
const getStageImpacts = (stageName: string, report: LcaReport): StageImpacts => {
    const { impacts, inputs, primaryVsRecycled } = report;
    const fallback = { gwp: 0, energy: 0, water: 0 };

    const transportImpacts = {
        gwp: impacts.gwp.stages.filter(s => s.name.toLowerCase().includes('transport')).reduce((sum, s) => sum + s.value, 0),
        energy: impacts.energy.value * 0.1,
        water: impacts.water.value * 0.05,
    };

    const gwpProdTotal = impacts.gwp.value - transportImpacts.gwp;
    const energyProdTotal = impacts.energy.value - transportImpacts.energy;
    const waterProdTotal = impacts.water.value - transportImpacts.water;

    if (inputs.productionProcess === 'primary') {
        switch (stageName) {
            case 'Mining': return { gwp: gwpProdTotal * 0.25, energy: energyProdTotal * 0.30, water: waterProdTotal * 0.40 };
            case 'Concentrate': return { gwp: gwpProdTotal * 0.15, energy: energyProdTotal * 0.10, water: waterProdTotal * 0.20 };
            case 'Smelting/Refining': return { gwp: gwpProdTotal * 0.50, energy: energyProdTotal * 0.50, water: waterProdTotal * 0.35 };
            case 'Fabrication': return { gwp: gwpProdTotal * 0.10, energy: energyProdTotal * 0.10, water: waterProdTotal * 0.05 };
            case 'Use': return fallback;
            case 'End-of-Life': return { gwp: transportImpacts.gwp, energy: transportImpacts.energy, water: transportImpacts.water };
            case 'Recycling': return { gwp: transportImpacts.gwp * 0.8, energy: transportImpacts.energy * 0.8, water: transportImpacts.water * 0.8 };
            case 'Waste': return { gwp: transportImpacts.gwp * 0.2, energy: transportImpacts.energy * 0.2, water: transportImpacts.water * 0.2 };
            default: return fallback;
        }
    } else { // Recycled route
        const gwpRecycledProd = primaryVsRecycled.recycledGwp;
        const energyRecycledProd = primaryVsRecycled.recycledEnergy * 1000;
        const waterRecycledProd = primaryVsRecycled.recycledWater;
        switch (stageName) {
            case 'Mining': case 'Concentrate': return fallback;
            case 'Smelting/Refining': return { gwp: gwpRecycledProd * 0.7, energy: energyRecycledProd * 0.7, water: waterRecycledProd * 0.7 };
            case 'Fabrication': return { gwp: gwpRecycledProd * 0.1, energy: energyRecycledProd * 0.1, water: waterRecycledProd * 0.1 };
            case 'Use': return fallback;
            case 'End-of-Life': return { gwp: transportImpacts.gwp, energy: transportImpacts.energy, water: transportImpacts.water };
            case 'Recycling': return { 
                gwp: gwpRecycledProd * 0.2 + (transportImpacts.gwp * 0.8),
                energy: energyRecycledProd * 0.2 + (transportImpacts.energy * 0.8),
                water: waterRecycledProd * 0.2 + (transportImpacts.water * 0.8),
            };
            case 'Waste': return { gwp: transportImpacts.gwp * 0.2, energy: transportImpacts.energy * 0.2, water: transportImpacts.water * 0.2 };
            default: return fallback;
        }
    }
};

const processStages = ['Mining', 'Concentrate', 'Smelting/Refining', 'Fabrication', 'Use', 'End-of-Life', 'Recycling', 'Waste'];

// --- UI COMPONENTS ---

const PercentageBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="flex items-center">
        <div className="w-20 bg-[var(--color-border-subtle)] rounded-full h-2.5 mr-3">
            <div className="bg-[var(--color-brand-primary)] h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
        </div>
        <span className="text-sm font-medium text-[var(--text-secondary)] w-12 text-right">{value.toFixed(1)}%</span>
    </div>
);

const ProcessContributionTable: React.FC<{ report: LcaReport }> = ({ report }) => {
    const tableData = useMemo(() => {
        const totalGWP = report.impacts.gwp.value || 1;
        const totalEnergy = report.impacts.energy.value || 1;
        const totalWater = report.impacts.water.value || 1;

        return processStages.map(stageName => {
            const impacts = getStageImpacts(stageName, report);
            return {
                name: stageName,
                ...impacts,
                gwp_percent: (impacts.gwp / totalGWP) * 100,
                energy_percent: (impacts.energy / totalEnergy) * 100,
                water_percent: (impacts.water / totalWater) * 100,
            };
        }).filter(row => row.gwp > 0 || row.energy > 0 || row.water > 0);

    }, [report]);

    return (
        <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Process Contribution Analysis</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">A textual breakdown of environmental impacts attributed to each stage of the lifecycle.</p>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--color-border-subtle)]">
                    <thead>
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Process Stage</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">GWP ({report.impacts.gwp.unit})</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">GWP %</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">Energy ({report.impacts.energy.unit})</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Energy %</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">Water ({report.impacts.water.unit})</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Water %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                        {tableData.map(row => (
                            <tr key={row.name} className="hover:bg-white/5">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{row.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-[var(--text-secondary)]">{row.gwp.toLocaleString(undefined, {maximumFractionDigits: 1})}</td>
                                <td className="px-4 py-3 whitespace-nowrap"><PercentageBar value={row.gwp_percent} /></td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-[var(--text-secondary)]">{row.energy.toLocaleString(undefined, {maximumFractionDigits: 1})}</td>
                                <td className="px-4 py-3 whitespace-nowrap"><PercentageBar value={row.energy_percent} /></td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-[var(--text-secondary)]">{row.water.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                                <td className="px-4 py-3 whitespace-nowrap"><PercentageBar value={row.water_percent} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProcessContributionTable;