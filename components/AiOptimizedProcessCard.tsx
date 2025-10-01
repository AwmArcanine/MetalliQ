import React from 'react';
import Card from './ui/Card';
import type { AiOptimizedProcess } from '../types';
import { SparklesIcon, CheckCircleIcon } from '../constants';

interface AiOptimizedProcessCardProps {
  data: AiOptimizedProcess;
  className?: string;
}

const KpiComparison: React.FC<{ title: string; original: number; optimized: number; unit: string; higherIsBetter?: boolean }> = ({ title, original, optimized, unit, higherIsBetter = false }) => {
    const change = optimized - original;
    const changePercent = (change / original) * 100;
    const isImprovement = higherIsBetter ? change > 0 : change < 0;

    return (
        <div className="text-center">
            <p className="text-sm font-medium text-[var(--text-on-light-secondary)]">{title}</p>
            <p className="text-xl font-bold text-[var(--color-secondary)]">{optimized.toFixed(0)} <span className="text-base font-normal">{unit}</span></p>
            <p className={`text-sm font-semibold ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
                {isImprovement ? '▼' : '▲'} {Math.abs(changePercent).toFixed(1)}%
            </p>
        </div>
    );
};


const AiOptimizedProcessCard: React.FC<AiOptimizedProcessCardProps> = ({ data, className }) => {
  return (
    <Card className={className}>
      <h2 className="text-lg font-semibold text-[var(--text-on-light-primary)] mb-4 flex items-center">
        <SparklesIcon className="w-6 h-6 mr-2 text-[var(--color-secondary)]" />
        AI Optimized Scenario
      </h2>
      <div className="grid grid-cols-3 divide-x divide-gray-300 mb-4 bg-black/5 p-3 rounded-lg">
        <KpiComparison title="GWP" original={data.gwp.original} optimized={data.gwp.optimized} unit="kg CO₂-eq" />
        <KpiComparison title="Energy" original={data.energy.original} optimized={data.energy.optimized} unit="GJ" />
        <KpiComparison title="Circularity" original={data.circularity.original} optimized={data.circularity.optimized} unit="%" higherIsBetter />
      </div>
      <div>
        <h4 className="font-semibold text-[var(--text-on-light-primary)] text-sm mb-2">Suggested Actions:</h4>
        <ul className="space-y-1.5">
            {data.recommendations.map((rec, index) => (
                 <li key={index} className="flex items-center text-sm text-[var(--text-on-light-secondary)]">
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-[var(--color-secondary)] flex-shrink-0" />
                    {rec}
                </li>
            ))}
        </ul>
      </div>
    </Card>
  );
};

export default AiOptimizedProcessCard;