import React from 'react';
import type { LcaReport, ImpactResult } from '../../types';

// Same order as the grid for consistency
const impactOrder: (keyof LcaReport['impacts'])[] = [
    'gwp', 'energy', 'water', 'acidification', 'eutrophication', 'odp', 'pocp',
    'pm_formation', 'adp_elements', 'adp_fossil', 'human_toxicity_cancer',
    'human_toxicity_non_cancer', 'ecotoxicity_freshwater', 'ionizing_radiation', 'land_use'
];

const formatValue = (value: number) => {
    if (value === 0) return '0.00';
    if (Math.abs(value) > 10000 || (Math.abs(value) < 0.001)) {
        return value.toExponential(2);
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface DetailedImpactTableProps {
    impacts: LcaReport['impacts'];
}

const DetailedImpactTable: React.FC<DetailedImpactTableProps> = ({ impacts }) => {
    // 1. Get all unique stage names to create dynamic columns
    const allStages = React.useMemo(() => {
        const stageSet = new Set<string>();
        impactOrder.forEach(key => {
            const impact = impacts[key] as ImpactResult | undefined;
            if (impact?.stages) {
                impact.stages.forEach(stage => stageSet.add(stage.name));
            }
        });
        return Array.from(stageSet);
    }, [impacts]);

    // 2. Prepare data rows for the table
    const tableData = React.useMemo(() => {
        return impactOrder.map(key => {
            const impact = impacts[key] as ImpactResult | undefined;
            if (!impact) return null;

            const stageValues: { [key: string]: number } = {};
            if (impact.stages) {
                impact.stages.forEach(stage => {
                    stageValues[stage.name] = stage.value;
                });
            }

            return {
                ...impact,
                stageValues,
            };
        }).filter((d): d is ImpactResult & { stageValues: { [key: string]: number } } => Boolean(d));
    }, [impacts, allStages]);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border-subtle)]">
                <thead>
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Impact Category</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Value</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Unit</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Confidence Interval (95%)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                    {tableData.map((impact) => (
                        <tr key={impact.name} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{impact.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono font-semibold text-[var(--text-primary)]">{formatValue(impact.value)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-left font-mono text-[var(--text-secondary)]">{impact.unit}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-[var(--text-secondary)]">[{formatValue(impact.confidenceInterval[0])} - {formatValue(impact.confidenceInterval[1])}]</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DetailedImpactTable;