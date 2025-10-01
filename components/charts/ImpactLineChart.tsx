import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Label } from 'recharts';
import type { ImpactResult } from '../../types';

interface ImpactLineChartProps {
  data: ImpactResult;
  title: string;
}

const ImpactLineChart: React.FC<ImpactLineChartProps> = ({ data, title }) => {
  const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({
    'value': true,
  });

  const handleLegendClick = (e: any) => {
    const { dataKey } = e;
    setVisibility(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  return (
    <div>
        <h3 className="text-lg font-semibold text-[var(--color-primary)]">{title}</h3>
        <p className="text-sm text-[var(--color-primary)]/80 mb-4">
            Total: {data.value.toFixed(2)} {data.unit} 
            <span className="text-xs ml-2">
                (CI: {data.confidenceInterval[0].toFixed(2)} - {data.confidenceInterval[1].toFixed(2)})
            </span>
        </p>
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.stages} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-gray-light)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} axisLine={false} tickLine={false}>
                    <Label value={data.unit} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: 'var(--color-chart-text)' }} />
                </YAxis>
                <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{
                        background: 'var(--color-light)',
                        border: '1px solid var(--color-chart-gray-light)',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} ${data.unit}`, 'Impact']}
                />
                <Legend onClick={handleLegendClick} wrapperStyle={{fontSize: "12px", color: 'var(--color-chart-text)', cursor: 'pointer'}}/>
                <Line hide={!visibility.value} type="monotone" dataKey="value" name="Impact" stroke="var(--color-chart-secondary)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-chart-secondary)' }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default ImpactLineChart;