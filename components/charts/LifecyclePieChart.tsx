import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartData {
    name: string;
    value: number;
    // Fix: Added index signature to be compatible with Recharts data prop type.
    [key: string]: any;
}

interface LifecyclePieChartProps {
  data: PieChartData[];
  title: string;
}

const COLORS = ['var(--color-chart-primary)', 'var(--color-chart-secondary)', 'var(--color-chart-tertiary)', 'var(--color-chart-neutral-dark)', 'var(--color-chart-neutral-light)'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  // Hide labels for very small slices to prevent clutter
  if (percent < 0.05) {
    return null;
  }
  const radius = outerRadius + 25; // Position label outside the pie
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <text x={x} y={y} fill="var(--color-chart-text)" textAnchor={textAnchor} dominantBaseline="central" fontSize={12}>
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


const LifecyclePieChart: React.FC<LifecyclePieChartProps> = ({ data, title }) => {
  const [opacity, setOpacity] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const initialOpacity = data.reduce((acc, curr) => {
      acc[curr.name] = 1;
      return acc;
    }, {} as { [key: string]: number });
    setOpacity(initialOpacity);
  }, [data]);

  const handleLegendClick = (e: any) => {
    const { value } = e; // Pie chart legend uses 'value' which is the name of the slice
    setOpacity(prev => ({ ...prev, [value]: prev[value] === 1 ? 0.2 : 1 })); // dim, not hide
  };

  return (
    <div>
        <h3 className="text-lg font-semibold text-[var(--text-on-light-primary)] mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 30, right: 40, bottom: 30, left: 40 }}>
                <Pie
                    data={data.filter(d => d.value !== 0)} // Filter out zero-value stages
                    cx="50%"
                    cy="50%"
                    labelLine={{ stroke: 'var(--color-chart-text)', strokeOpacity: 0.6 }}
                    outerRadius={85}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={renderCustomizedLabel}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={opacity[entry.name]}/>
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ background: 'var(--soft-white)', border: '1px solid var(--color-chart-grid)', borderRadius: '0.5rem', color: 'var(--text-on-light-primary)' }}
                    formatter={(value: number, name: string) => [`${value.toFixed(2)}`, name]}
                />
                <Legend onClick={handleLegendClick} iconSize={10} wrapperStyle={{ fontSize: '12px', color: 'var(--color-chart-text)', cursor: 'pointer' }} />
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
};

export default LifecyclePieChart;