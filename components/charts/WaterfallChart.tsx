

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, ReferenceLine, Cell } from 'recharts';

interface WaterfallChartProps {
    title: string;
    data: { name: string; value: number }[];
    unit: string;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-2 rounded-lg shadow-md border text-sm" style={{ backgroundColor: 'var(--soft-white)', borderColor: 'var(--color-chart-grid)'}}>
                <p className="font-bold text-[var(--text-on-light-primary)] mb-1">{label}</p>
                <p className="text-[var(--text-on-light-secondary)]">
                    <span className="font-semibold text-[var(--text-on-light-primary)]">Impact: </span> {data.value.toFixed(1)} {unit}
                </p>
            </div>
        );
    }
    return null;
};

const WaterfallChart: React.FC<WaterfallChartProps> = ({ title, data, unit }) => {

    const processedData = React.useMemo(() => {
        let cumulative = 0;
        const processed = data.filter(d => d.value !== 0).map(entry => {
            const result = {
                name: entry.name,
                value: entry.value,
                // for stack: [invisible base, visible value]
                stack: entry.value >= 0 
                    ? [cumulative, entry.value] 
                    : [cumulative + entry.value, -entry.value]
            };
            cumulative += entry.value;
            return result;
        });

        // Add total bar
        processed.push({
            name: 'Total GWP',
            value: cumulative,
            stack: [0, cumulative]
        });
        
        return processed;
    }, [data]);
    
    const renderTooltip = React.useCallback(
        (props: any) => <CustomTooltip {...props} unit={unit} />,
        [unit]
    );

    return (
        <div>
            <h3 className="text-lg font-semibold text-[var(--text-on-light-primary)] mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} axisLine={false} tickLine={false}>
                        <Label value={unit} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: 'var(--color-chart-text)' }} />
                    </YAxis>
                    <Tooltip content={renderTooltip} />
                    <ReferenceLine y={0} stroke="var(--color-chart-neutral-dark)" strokeDasharray="2 2" />
                    <Bar dataKey="stack[0]" stackId="a" fill="transparent" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="stack[1]" stackId="a" radius={[4, 4, 0, 0]}>
                        {processedData.map((entry, index) => {
                            let color = 'var(--color-chart-negative)'; // default increase (bad impact)
                            if (entry.name === 'Total GWP') color = 'var(--color-chart-5)';
                            else if (entry.value < 0) color = 'var(--color-chart-positive)'; // green for decrease (good impact)
                            return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WaterfallChart;