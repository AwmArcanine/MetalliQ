

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Label, LabelList } from 'recharts';
import type { ImpactResult } from '../../types';

interface ImpactChartProps {
  data: ImpactResult;
  title: string;
}

const formatImpactValue = (n: number, digits = 2) => {
    if (n === 0) return (0).toFixed(digits);
    // Use scientific notation for small non-zero numbers
    if (Math.abs(n) > 0 && Math.abs(n) < 0.01) {
        return n.toExponential(digits);
    }
    return n.toFixed(digits);
};

const CustomizedLabel = (props: any) => {
    const { x, y, width, value } = props;
    
    // Do not render label for zero values to avoid clutter
    if (value === 0) {
        return null;
    }
    
    const formattedValue = formatImpactValue(value, 2);

    return (
        <text x={x + width / 2} y={y} dy={-12} fill="var(--color-chart-text)" fontSize={11} textAnchor="middle" fontWeight="600">
            {formattedValue}
        </text>
    );
};


const ImpactChart: React.FC<ImpactChartProps> = ({ data, title }) => {
  const colors = ['var(--color-brand-primary)', 'var(--color-brand-secondary)', 'var(--color-brand-accent)', 'var(--color-cta)'];
  return (
    <div>
        <h3 className="text-md font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="text-sm text-[var(--text-secondary)]/80 mb-4">
            Total: {formatImpactValue(data.value)} {data.unit} 
            <span className="text-xs ml-2">
                (CI: {formatImpactValue(data.confidenceInterval[0])} - {formatImpactValue(data.confidenceInterval[1])})
            </span>
        </p>
        <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.stages} margin={{ top: 30, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} axisLine={false} tickLine={false}>
                <Label value={data.unit} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: 'var(--color-chart-text)' }} />
            </YAxis>
            <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{
                background: 'var(--color-panel-light)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '0.5rem',
                fontSize: '12px',
                color: 'var(--text-primary)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: number) => [`${formatImpactValue(value)} ${data.unit}`, 'Value']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="value" content={CustomizedLabel} />
                {data.stages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
            </Bar>
        </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default ImpactChart;