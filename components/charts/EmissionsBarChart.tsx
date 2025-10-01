

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import type { ScenarioComparisonData } from '../../types';

interface EmissionsBarChartProps {
  data: ScenarioComparisonData[];
}

const EmissionsBarChart: React.FC<EmissionsBarChartProps> = ({ data }) => {
  const colors = ['var(--color-chart-primary)', 'var(--color-chart-secondary)', 'var(--color-chart-tertiary)'];
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip
          cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
          contentStyle={{
            background: 'var(--soft-white)',
            border: '1px solid var(--color-chart-grid)',
            borderRadius: '0.5rem',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EmissionsBarChart;