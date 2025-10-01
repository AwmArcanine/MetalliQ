import React from 'react';
import Card from './ui/Card';
import { ExclamationTriangleIcon } from '../constants';
import type { LcaReport } from '../types';

interface HotspotsAnalysisProps {
    hotspots: LcaReport['supplyChainHotspots'];
}

const HotspotsAnalysis: React.FC<HotspotsAnalysisProps> = ({ hotspots }) => {
    if (!hotspots || hotspots.length === 0) {
        return null;
    }

    const sortedHotspots = [...hotspots].sort((a, b) => b.percentage - a.percentage);

    return (
        <div className="space-y-3">
            {sortedHotspots.map((hotspot, index) => {
                const isHighRisk = hotspot.risk === 'High';
                return (
                    <div key={index} className={`p-4 rounded-lg flex justify-between items-center transition-all duration-300 ${isHighRisk ? 'bg-[var(--color-cta)]/10 border-2 border-[var(--color-cta)] shadow-lg' : 'bg-[var(--color-panel-light)] border border-[var(--color-border-subtle)]'}`}>
                        <div className="flex items-center">
                            {isHighRisk && <ExclamationTriangleIcon className="w-6 h-6 mr-3 text-[var(--color-cta)] flex-shrink-0" />}
                            <div>
                                <p className={`font-semibold ${isHighRisk ? 'text-[var(--color-cta)]' : 'text-[var(--text-primary)]'}`}>{hotspot.name}</p>
                                {isHighRisk && <p className="text-xs font-medium text-[var(--color-cta)]/80">Highest Environmental Impact Contributor</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-2xl font-bold ${isHighRisk ? 'text-[var(--color-cta)]' : 'text-[var(--text-primary)]'}`}>{hotspot.percentage.toFixed(0)}%</p>
                            <p className="text-xs text-[var(--text-secondary)]">of GWP Impact</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default HotspotsAnalysis;