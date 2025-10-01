import React from 'react';

interface CircularityAnalysisChartProps {
    score: number;
    details: {
        recyclabilityRate: number;
        recoveryEfficiency: number;
        secondaryMaterialContent: number;
    };
}

const MetricBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
            <span className="text-sm font-semibold" style={{color: color}}>{value}%</span>
        </div>
        <div className="w-full rounded-full h-2 bg-[var(--color-border-subtle)]">
            <div className="h-2 rounded-full" style={{ width: `${value}%`, backgroundColor: color }}></div>
        </div>
    </div>
);

const CircularityAnalysisChart: React.FC<CircularityAnalysisChartProps> = ({ score, details }) => {
    return (
        <div>
            <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full" viewBox="0 0 36 36" style={{transform: 'rotate(-90deg)'}}>
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="var(--color-border-subtle)"
                            strokeWidth="3"
                        />
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#scoreGradient)"
                            strokeWidth="3"
                            strokeDasharray={`${score}, 100`}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 1s ease-out' }}
                        />
                         <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--color-brand-primary)" />
                                <stop offset="100%" stopColor="var(--color-brand-secondary)" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-[var(--color-brand-primary)]">{score}%</span>
                        <span className="text-sm text-[var(--text-secondary)]">Circularity</span>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <MetricBar label="Recyclability Rate" value={details.recyclabilityRate} color="var(--color-brand-primary)" />
                <MetricBar label="Recovery Efficiency" value={details.recoveryEfficiency} color="var(--color-brand-secondary)" />
                <MetricBar label="Secondary Material Content" value={details.secondaryMaterialContent} color="var(--color-cta)" />
            </div>
        </div>
    );
};

export default CircularityAnalysisChart;