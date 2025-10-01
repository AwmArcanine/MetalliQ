import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { LcaReport } from '../../types';

interface PrimaryRecycledComparisonProps {
  data: LcaReport['primaryVsRecycled'];
}

const SavingsPill: React.FC<{ value: number }> = ({ value }) => {
    const isPositive = value > 0;
    const styles = {
      backgroundColor: isPositive ? 'var(--color-chart-positive-light)' : 'var(--color-chart-negative-light)',
      color: isPositive ? 'var(--color-chart-positive)' : 'var(--color-chart-negative)'
    };
    return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full" style={styles}>
            {isPositive ? '▼' : '▲'} {Math.abs(value).toFixed(1)}%
        </span>
    );
};

const PrimaryRecycledComparison: React.FC<PrimaryRecycledComparisonProps> = ({ data }) => {
  const comparisonData = [
    {
      metric: 'GWP',
      primary: data.primaryGwp,
      recycled: data.recycledGwp,
      unit: 'kg CO₂-eq',
      savings: data.gwpSavings,
    },
    {
      metric: 'Energy',
      primary: data.primaryEnergy,
      recycled: data.recycledEnergy,
      unit: 'GJ',
      savings: data.energySavings,
    },
     {
      metric: 'Water',
      primary: data.primaryWater,
      recycled: data.recycledWater,
      unit: 'm³',
      savings: data.waterSavings,
    },
    {
        metric: 'Acidification',
        primary: data.primaryAcidification,
        recycled: data.recycledAcidification,
        unit: 'kg SO₂-eq',
        savings: data.acidificationSavings,
    },
    {
        metric: 'Eutrophication',
        primary: data.primaryEutrophication,
        recycled: data.recycledEutrophication,
        unit: 'kg PO₄-eq',
        savings: data.eutrophicationSavings,
    },
    {
        metric: 'Ozone Depletion',
        primary: data.primaryOdp,
        recycled: data.recycledOdp,
        unit: 'kg CFC-11 eq',
        savings: data.odpSavings,
    },
  ];
  
  const formatValue = (metric: string, value: number) => {
    if (metric === 'Ozone Depletion') {
        return value.toExponential(2);
    }
    return value.toLocaleString();
  };

  const chartComparisonMetrics = [
    { name: 'GWP', key: 'gwp' },
    { name: 'Energy Demand', key: 'energy' },
    { name: 'Water Use', key: 'water' },
  ];

  const chartData = chartComparisonMetrics.map(metric => ({
      name: metric.name,
      'Primary Route': data[`primary${metric.key.charAt(0).toUpperCase() + metric.key.slice(1)}` as keyof typeof data] || 0,
      'Recycled Route': data[`recycled${metric.key.charAt(0).toUpperCase() + metric.key.slice(1)}` as keyof typeof data] || 0,
  }));

  return (
    <div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-[var(--color-primary)]">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-on-dark-primary)] uppercase tracking-wider">Metric</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-[var(--text-on-dark-primary)] uppercase tracking-wider">Primary Route</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-[var(--text-on-dark-primary)] uppercase tracking-wider">Recycled Route</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-[var(--text-on-dark-primary)] uppercase tracking-wider">Savings</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-300">
                {comparisonData.map((row) => (
                    <tr key={row.metric}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-on-light-primary)]">{row.metric} ({row.unit})</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-on-light-primary)] text-right">{formatValue(row.metric, row.primary)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-on-light-primary)] text-right">{formatValue(row.metric, row.recycled)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-on-light-secondary)] text-center">
                        <SavingsPill value={row.savings} />
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-300/70">
            <h4 className="text-md font-semibold text-[var(--color-primary)] mb-4 text-center">Key Metrics Visual Comparison</h4>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical" barGap={5} barSize={15} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-chart-grid)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-chart-text)' }} />
                    <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 11, fill: 'var(--color-chart-text)' }} />
                    <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{
                            background: 'var(--soft-white)',
                            border: '1px solid var(--color-chart-grid)',
                            borderRadius: '0.5rem',
                        }}
                        formatter={(value: number, name: string) => [`${value.toFixed(1)}`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--color-chart-text)' }}/>
                    <Bar dataKey="Primary Route" fill="var(--color-chart-5)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Recycled Route" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default PrimaryRecycledComparison;