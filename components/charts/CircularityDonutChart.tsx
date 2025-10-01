import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import type { CircularityScoreData } from '../../types';

interface CircularityDonutChartProps {
  data: CircularityScoreData[];
  score: number;
}

const CircularityDonutChart: React.FC<CircularityDonutChartProps> = ({ data, score }) => {
  return (
    <div className="w-48 h-48 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold text-gray-900">{score}%</span>
      </div>
    </div>
  );
};

export default CircularityDonutChart;