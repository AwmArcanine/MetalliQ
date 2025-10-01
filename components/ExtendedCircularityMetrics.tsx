import React from 'react';
import Card from './ui/Card';
import type { LcaReport } from '../types';

interface MetricTileProps {
    title: string;
    value: string | number;
    unit?: string | null;
}

const MetricTile: React.FC<MetricTileProps> = ({ title, value, unit }) => (
    <div className="bg-[var(--color-panel-light)] border border-[var(--color-border-subtle)] rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1">
        <h4 className="text-sm font-medium text-[var(--text-secondary)] h-10 flex items-center justify-center">{title}</h4>
        <p className="text-3xl font-bold text-[var(--color-brand-primary)] mt-1">
            {value}
            {unit && <span className="text-xl text-[var(--text-secondary)]">{unit}</span>}
        </p>
    </div>
);

interface ExtendedCircularityMetricsProps {
    details: LcaReport['circularityDetails'];
}

const ExtendedCircularityMetrics: React.FC<ExtendedCircularityMetricsProps> = ({ details }) => {
    const metrics: MetricTileProps[] = [
        { title: 'Resource Efficiency', value: details.recoveryEfficiency, unit: '%' },
        { title: 'Extended Product Life', value: details.extendedProductLife, unit: '%' },
        { title: 'Reuse Potential', value: `${details.reusePotential.value}/${details.reusePotential.max}`, unit: null },
        { title: 'Material Recovery', value: details.materialRecoveryRate, unit: '%' },
        { title: 'Closed-Loop Potential', value: details.closedLoopRecyclingRate, unit: '%' },
        { title: 'Recycling Content', value: details.secondaryMaterialContent, unit: '%' },
        { title: 'Landfill Rate', value: details.landfillRate, unit: '%' },
        { title: 'Energy Recovery', value: details.energyRecoveryRate, unit: '%' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map(metric => (
                <MetricTile key={metric.title} {...metric} />
            ))}
        </div>
    );
};

export default ExtendedCircularityMetrics;