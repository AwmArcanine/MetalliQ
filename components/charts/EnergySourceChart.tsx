import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Label } from 'recharts';

interface ChartData {
    name: string;
    value: number;
}

interface EnergySourceChartProps {
  data: ChartData[];
  title: string;
  unit: string;
}

const EnergySourceChart: React.FC<EnergySourceChartProps> = ({ data, title, unit }) => {
  const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const initialVisibility = data.reduce((acc, curr) => {
      acc[curr.name] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    setVisibility(initialVisibility);
  }, [data]);

  const handleLegendClick = (e: any) => {
    const { dataKey } = e;
    setVisibility(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  const chartData = [{ name: 'Energy', ...data.reduce((acc, curr) => ({...acc, [curr.name]: curr.value }), {}) }];
  const colors = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-4)', 'var(--color-chart-5)'];

  return (
    <div>
        <h3 className="text-lg font-semibold text-[var(--text-on-light-primary)] mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-chart-grid)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }}>
                    <Label value={unit} position="insideBottom" offset={-5} style={{ fill: 'var(--color-chart-text)' }} />
                </XAxis>
                <YAxis type="category" dataKey="name" hide />
                <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{
                        background: 'var(--soft-white)',
                        border: '1px solid var(--color-chart-grid)',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                        color: 'var(--text-on-light-primary)'
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, 'Consumption']}
                />
                <Legend onClick={handleLegendClick} wrapperStyle={{ fontSize: '12px', color: 'var(--color-chart-text)', cursor: 'pointer' }} />
                {data.map((source, index) => (
                     <Bar key={source.name} hide={!visibility[source.name]} dataKey={source.name} stackId="a" fill={colors[index % colors.length]} radius={index === data.length - 1 ? [0, 4, 4, 0] : [0,0,0,0]}/>
                ))}
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default EnergySourceChart;