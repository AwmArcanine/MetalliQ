import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CircularityPieChartProps {
    recyclabilityRate: number;
}

const CircularityPieChart: React.FC<CircularityPieChartProps> = ({ recyclabilityRate }) => {
    const data = [
        { name: 'Recyclable', value: recyclabilityRate, color: 'var(--color-chart-primary)' },
        { name: 'Landfilled / Waste', value: 100 - recyclabilityRate, color: 'var(--color-chart-neutral-light)' },
    ];

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                    </Pie>
                     <Tooltip 
                        contentStyle={{ background: 'var(--soft-white)', border: '1px solid var(--color-chart-grid)', borderRadius: '0.5rem', color: 'var(--text-on-light-primary)' }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                    />
                </PieChart>
            </ResponsiveContainer>
             <div className="flex justify-center space-x-4 text-xs">
                {data.map(entry => (
                    <div key={entry.name} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                        <span>{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CircularityPieChart;