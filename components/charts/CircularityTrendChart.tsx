import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { LcaReport } from '../../types';

interface CircularityTrendChartProps {
  reports: LcaReport[];
}

const CircularityTrendChart: React.FC<CircularityTrendChartProps> = ({ reports }) => {
  const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({
    'Circularity Score': true,
  });

  const handleLegendClick = (e: any) => {
    // The dataKey for Area chart is 'score', but the legend name is 'Circularity Score'.
    // We toggle based on the name presented to the user.
    const { payload } = e;
    setVisibility(prev => ({ ...prev, [payload.value]: !prev[payload.value] }));
  };

  const data = reports
    .map(report => ({
      date: new Date(report.createdAt).toLocaleDateString('en-CA'), // YYYY-MM-DD for sorting
      score: report.circularityScore,
      name: report.title,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--color-chart-text)] mb-4">Circularity Score Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-primary)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-chart-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-gray-light)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
           />
          <YAxis 
            tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} 
            axisLine={false} 
            tickLine={false} 
            unit="%" 
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              background: '#FAFAFA',
              border: '1px solid var(--color-chart-gray-light)',
              borderRadius: '0.5rem',
              fontSize: '12px',
            }}
            formatter={(value: number, name, props) => [`${value}%`, `Report: ${props.payload.name}`]}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Legend onClick={handleLegendClick} wrapperStyle={{fontSize: '12px', color: 'var(--color-chart-text)', cursor: 'pointer'}} verticalAlign="top" align="right" />
          <Area 
            type="monotone" 
            dataKey="score" 
            name="Circularity Score" 
            stroke="var(--color-chart-primary)" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorScore)" 
            dot={{ r: 4, fill: 'var(--color-chart-primary)' }} 
            activeDot={{ r: 6 }} 
            hide={!visibility['Circularity Score']}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CircularityTrendChart;