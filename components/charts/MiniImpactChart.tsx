import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { ImpactResult } from '../../types';

interface MiniImpactChartProps {
    impact: ImpactResult;
}

const formatValue = (value: number) => {
    if (Math.abs(value) > 1000) return value.toExponential(2);
    if (Math.abs(value) < 0.01 && value !== 0) return value.toExponential(2);
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const CustomTooltip = ({ active, payload, label, impact }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 rounded-lg shadow-md border text-xs" style={{ background: 'var(--soft-white)', borderColor: 'var(--color-chart-grid)' }}>
                <p className="font-bold text-[var(--text-on-light-primary)] mb-2">{impact.name}</p>
                <div className="space-y-1">
                    {impact.stages.map((stage: { name: string, value: number }) => (
                         <div key={stage.name} className="flex justify-between">
                            <span>{stage.name}:</span>
                            <span className="font-semibold ml-2">{formatValue(stage.value)}</span>
                        </div>
                    ))}
                </div>
                 <div className="border-t mt-2 pt-1 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatValue(impact.value)} {impact.unit}</span>
                </div>
            </div>
        );
    }
    return null;
};

const MiniImpactChart: React.FC<MiniImpactChartProps> = ({ impact }) => {
    const data = [{ name: impact.name, value: impact.value }];

    return (
        <div className="p-3 bg-white rounded-lg border border-gray-300/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-baseline mb-1">
                 <h4 className="text-sm font-semibold text-[var(--text-on-light-primary)] truncate" title={impact.name}>
                    {impact.name}
                </h4>
                 <p className="text-xs font-mono text-[var(--text-on-light-secondary)]">{impact.unit}</p>
            </div>
           
            <ResponsiveContainer width="100%" height={40}>
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 80, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide domain={[0, 'dataMax']} />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        content={<CustomTooltip impact={impact} />}
                    />
                    <Bar dataKey="value" fill="var(--color-chart-secondary)" barSize={20} radius={[4, 4, 4, 4]}>
                        <LabelList 
                            dataKey="value" 
                            position="right" 
                            formatter={(value: number) => formatValue(value)} 
                            fill="var(--color-chart-text)"
                            fontSize={12}
                            fontWeight="600"
                            offset={5}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MiniImpactChart;