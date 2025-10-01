import React, { useState, useMemo } from 'react';
import type { LcaReport, ImpactResult, ImpactStage } from '../../types';

// Utility to format values nicely
const formatValue = (value: number) => {
    if (value === 0) return '0.00';
    if (Math.abs(value) > 10000 || (Math.abs(value) < 0.001 && value !==0)) {
        return value.toExponential(2);
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// --- ImpactTile (the flippable card) ---
const ImpactTile: React.FC<{ impact: ImpactResult; index: number; maxImpactValue: number }> = ({ impact, index, maxImpactValue }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const hasStages = impact.stages && impact.stages.length > 0 && impact.stages.some(s => s.value !== 0);

    const handleInteraction = () => {
        if (hasStages) {
            setIsFlipped(prev => !prev);
        }
    };
    
    const barWidth = `${Math.min((Math.abs(impact.value) / maxImpactValue) * 100, 100)}%`;

    return (
        <div 
            className="animated-impact-tile-container h-40" 
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={handleInteraction}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleInteraction()}
            role="button"
            tabIndex={0}
            aria-label={`Impact card for ${impact.name}. Value is ${formatValue(impact.value)}. ${hasStages ? 'Press enter to see details.' : ''}`}
        >
            <div className={`impact-tile-flipper ${isFlipped ? 'is-flipped' : ''} h-full`}>
                {/* Front of the card */}
                <div className="impact-tile-front justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] text-center truncate" title={impact.name}>
                            {impact.name}
                        </h4>
                        <p className="text-2xl font-bold text-[var(--color-brand-primary)] my-2 text-center">
                            {formatValue(impact.value)}
                        </p>
                        <p className="text-xs font-medium text-[var(--text-secondary)] text-center">{impact.unit}</p>
                    </div>
                    <div className="w-full bg-[var(--color-border-subtle)] rounded-full h-1.5 mt-2">
                        <div className="bg-gradient-to-r from-[var(--color-brand-secondary)] to-[var(--color-brand-primary)] h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: barWidth }}></div>
                    </div>
                    {hasStages && <div className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-50">Details ↻</div>}
                </div>

                {/* Back of the card */}
                <div className="impact-tile-back">
                    <h5 className="font-bold text-sm text-center mb-2 text-[var(--text-primary)]">Stage Breakdown</h5>
                    <ul className="text-xs space-y-1 w-full">
                        {impact.stages.filter(s => s.value !== 0).map((stage: ImpactStage) => (
                            <li key={stage.name} className="flex justify-between">
                                <span className="truncate text-[var(--text-secondary)] pr-2">{stage.name}:</span>
                                <span className="font-semibold text-[var(--text-primary)] whitespace-nowrap">{formatValue(stage.value)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};


// --- Main Grid Component ---
const impactOrder: (keyof LcaReport['impacts'])[] = [
    'gwp', 'energy', 'water', 'acidification', 'eutrophication', 'odp', 'pocp',
    'pm_formation', 'adp_elements', 'adp_fossil', 'human_toxicity_cancer',
    'human_toxicity_non_cancer', 'ecotoxicity_freshwater', 'ionizing_radiation', 'land_use'
];

interface AnimatedImpactGridProps {
    impacts: LcaReport['impacts'];
}

const AnimatedImpactGrid: React.FC<AnimatedImpactGridProps> = ({ impacts }) => {
    
    const maxImpactValue = useMemo(() => {
        let maxVal = 0;
        impactOrder.forEach(key => {
            const impact = impacts[key] as ImpactResult | undefined;
            if (impact?.value) {
                // Normalize by finding a common scale if possible, otherwise just use raw value for now
                // A more sophisticated approach might involve normalizing by a reference value
                if (Math.abs(impact.value) > maxVal) {
                    maxVal = Math.abs(impact.value);
                }
            }
        });
        return maxVal > 0 ? maxVal : 1;
    }, [impacts]);


    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {impactOrder.map((key, index) => {
                const impact = impacts[key] as ImpactResult | undefined;
                if (!impact) return null;
                return (
                    <ImpactTile key={key} impact={impact} index={index} maxImpactValue={maxImpactValue} />
                );
            })}
        </div>
    );
};

export default AnimatedImpactGrid;