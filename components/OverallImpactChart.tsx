import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import type { LcaReport } from '../../types';

interface OverallImpactChartProps {
  impacts: LcaReport['impacts'];
}

type ChartType = 'bar' | 'radar';

const OverallImpactChart: React.FC<OverallImpactChartProps> = ({ impacts }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({ 'A': true });
  
  const data = useMemo(() => {
    if (!impacts) return [];
    return [
      impacts.gwp && { name: 'GWP', value: impacts.gwp.value, unit: impacts.gwp.unit },
      impacts.energy && { name: 'Energy', value: impacts.energy.value, unit: impacts.energy.unit },
      impacts.water && { name: 'Water', value: impacts.water.value, unit: impacts.water.unit },
      impacts.eutrophication && { name: 'Eutrophication', value: impacts.eutrophication.value, unit: impacts.eutrophication.unit },
      impacts.acidification && { name: 'Acidification', value: impacts.acidification.value, unit: impacts.acidification.unit },
    ].filter((d): d is { name: string; value: number; unit: string; } => Boolean(d));
  }, [impacts]);


  const handleLegendClick = (e: any) => {
    const { dataKey } = e;
    setVisibility(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };
  
  if (!impacts || data.length === 0) {
      return <div className="text-center p-4 text-sm text-[var(--text-secondary)]">No impact data available to display.</div>;
  }

  // For radar chart, we need to normalize the data to be on a similar scale (0-100)
  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
  const radarData = data.map(d => ({
    subject: d.name,
    A: (d.value / maxValue) * 100,
    fullMark: 100,
  }));
  
  const colors = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)'];

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-chart-text)' }} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--color-chart-text)' }} />
        <Tooltip
          cursor={{ fill: 'rgba(229, 231, 235, 0.5)' }}
          contentStyle={{ background: 'var(--soft-white)', border: '1px solid var(--color-chart-grid)', borderRadius: '0.5rem', fontSize: '12px', color: 'var(--text-on-light-primary)' }}
          formatter={(value: number, name: string, props) => [`${value.toFixed(2)} ${props.payload.unit}`, "Value"]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderRadarChart = () => (
     <ResponsiveContainer width="100%" height={250}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid stroke="var(--color-chart-grid)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--color-chart-text)' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-chart-text)' }} />
          <Radar name="Impact" dataKey="A" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.6} hide={!visibility.A} />
           <Tooltip 
             contentStyle={{ background: 'var(--soft-white)', border: '1px solid var(--color-chart-grid)', borderRadius: '0.5rem', color: 'var(--text-on-light-primary)' }}
            formatter={(value: number, name, props) => {
               const subject = props.payload.subject?.toLowerCase();
               const originalImpact = subject ? data.find(d => d.name.toLowerCase() === subject) : null;
               
               if (!originalImpact) {
                   return [`${(value || 0).toFixed(2)}%`, 'Normalized'];
               }
               return [`${originalImpact.value.toFixed(2)} ${originalImpact.unit}`, 'Original Value'];
           }}/>
            <Legend onClick={handleLegendClick} wrapperStyle={{ color: 'var(--color-chart-text)', cursor: 'pointer' }} />
        </RadarChart>
      </ResponsiveContainer>
  );

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-sm font-medium ${chartType === 'bar' ? 'text-white bg-[var(--color-secondary)]' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-l-md border border-gray-300 focus:z-10 focus:ring-2 focus:ring-[var(--color-secondary)]`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType('radar')}
            className={`px-3 py-1 text-sm font-medium ${chartType === 'radar' ? 'text-white bg-[var(--color-secondary)]' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-r-md border-t border-b border-r border-gray-300 focus:z-10 focus:ring-2 focus:ring-[var(--color-secondary)]`}
          >
            Radar
          </button>
        </div>
      </div>
      {chartType === 'bar' ? renderBarChart() : renderRadarChart()}
    </div>
  );
};

export default OverallImpactChart;