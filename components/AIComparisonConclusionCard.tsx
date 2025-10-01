import React from 'react';
import Card from './ui/Card';
import type { LcaReport } from '../types';
import { BrainIcon } from '../constants';

interface AIComparisonConclusionCardProps {
    conclusion: LcaReport['primaryVsRecycled']['aiComparisonConclusion'];
}

const AIComparisonConclusionCard: React.FC<AIComparisonConclusionCardProps> = ({ conclusion }) => {
    if (!conclusion) return null;

    const confidenceColor = conclusion.confidenceScore > 75 ? 'var(--color-brand-primary)' : 'var(--color-brand-secondary)';

    return (
        <Card>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center">
                <BrainIcon className="w-6 h-6 mr-2 text-[var(--color-brand-primary)]" />
                AI Conclusion
            </h3>
            <div className="p-3 bg-[var(--color-panel-light)] rounded-lg border border-[var(--color-border-subtle)]">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Best Route:</span>
                    <span className="px-3 py-1 text-sm font-bold rounded-full bg-[var(--color-brand-primary)] text-white">{conclusion.bestRoute}</span>
                </div>
                 <div className="mb-2">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Confidence:</span>
                     <div className="w-full bg-[var(--color-border-subtle)] rounded-full h-2.5 mt-1">
                        <div 
                            className="h-2.5 rounded-full" 
                            style={{ width: `${conclusion.confidenceScore}%`, backgroundColor: confidenceColor }}>
                        </div>
                    </div>
                </div>
                 <div>
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Rationale:</span>
                    <p className="text-sm text-[var(--text-primary)] mt-1 italic">"{conclusion.rationale}"</p>
                </div>
            </div>
        </Card>
    );
};

export default AIComparisonConclusionCard;