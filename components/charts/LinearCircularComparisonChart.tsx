import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { LcaReport } from '../../types';

interface LinearCircularComparisonChartProps {
  data: LcaReport['primaryVsRecycled'];
}

const LinearCircularComparisonChart: React.FC<LinearCircularComparisonChartProps> = ({ data }) => {
    const comparisonMetrics = [
        { name: 'CO₂ Emissions', key: 'gwp', unit: 'kg CO₂-eq' },
        { name: 'Energy Demand', key: 'energy', unit: 'GJ' },
        { name: 'Water Use', key: 'water', unit: 'm³' },
    ];

    const chartData = comparisonMetrics.map(metric => ({
        name: metric.name,
        Linear: data[`primary${metric.key.charAt(0).toUpperCase() + metric.key.slice(1)}` as keyof typeof data],
        Circular: data[`recycled${metric.key.charAt(0).toUpperCase() + metric.key.slice(1)}` as keyof typeof data],
    }));

    return (
        <div>
            <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-4">Linear vs. Circular Impact</h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical" barGap={5} barSize={15} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-chart-grid)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-chart-text)' }} />
                    <YAxis type="category" dataKey="name" width={85} tick={{ fontSize: 11, fill: 'var(--color-chart-text)' }} />
                    <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{
                            background: 'var(--soft-white)',
                            border: '1px solid var(--color-chart-grid)',
                            borderRadius: '0.5rem',
                        }}
                        formatter={(value: number, name: string) => [`${value.toFixed(1)}`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--color-chart-text)' }}/>
                    <Bar dataKey="Linear" fill="var(--color-chart-neutral-dark)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Circular" fill="var(--color-chart-primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LinearCircularComparisonChart;