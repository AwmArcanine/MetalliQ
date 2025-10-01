import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartData {
    name: string;
    value: number;
}

interface WaterUsageChartProps {
  data: ChartData[];
  title: string;
  unit: string;
}

const WaterUsageChart: React.FC<WaterUsageChartProps> = ({ data, title, unit }) => {
  return (
    <div>
        <h3 className="text-lg font-semibold text-[var(--color-chart-text)] mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} axisLine={false} tickLine={false} unit={` ${unit}`} />
                <Tooltip
                    cursor={{ fill: 'rgba(229, 231, 235, 0.5)' }}
                    contentStyle={{
                        background: 'var(--soft-white)',
                        border: '1px solid var(--color-chart-grid)',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, 'Water Use']}
                />
                <Line type="monotone" dataKey="value" stroke="var(--color-chart-primary)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-chart-secondary)' }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default WaterUsageChart;