import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';
import type { LcaReport } from '../types';

interface PrimaryRecycledComparisonDetailedChartProps {
  data: LcaReport['primaryVsRecycled'];
  title: string;
}

const formatValue = (metric: string, value: number) => {
    if (metric.includes('Ozone')) {
        return value.toExponential(1);
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
};

const SavingsLabel = (props: any) => {
    const { x, y, width, index, payload, data } = props;
    const item = data[index];
    const { savings = 0 } = item || {};
    
    if (!savings || savings <= 0) return null;

    const barX = x + width + 8;

    return (
        <g>
            <text x={barX} y={y + 10} fill="var(--color-chart-positive)" textAnchor="start" fontSize={11} fontWeight="bold">
                ▼{savings.toFixed(0)}%
            </text>
        </g>
    );
};


const PrimaryRecycledComparisonDetailedChart: React.FC<PrimaryRecycledComparisonDetailedChartProps> = ({ data, title }) => {
    const comparisonData = [
        { name: 'GWP', 'Primary Route': data.primaryGwp, 'Recycled Route': data.recycledGwp, savings: data.gwpSavings, unit: 'kg CO₂-eq' },
        { name: 'Energy', 'Primary Route': data.primaryEnergy, 'Recycled Route': data.recycledEnergy, savings: data.energySavings, unit: 'GJ' },
        { name: 'Water', 'Primary Route': data.primaryWater, 'Recycled Route': data.recycledWater, savings: data.waterSavings, unit: 'm³' },
        { name: 'Acidification', 'Primary Route': data.primaryAcidification, 'Recycled Route': data.recycledAcidification, savings: data.acidificationSavings, unit: 'kg SO₂-eq' },
        { name: 'Eutrophication', 'Primary Route': data.primaryEutrophication, 'Recycled Route': data.recycledEutrophication, savings: data.eutrophicationSavings, unit: 'kg PO₄-eq' },
        { name: 'Ozone Depletion', 'Primary Route': data.primaryOdp, 'Recycled Route': data.recycledOdp, savings: data.odpSavings, unit: 'kg CFC-11 eq' },
    ];

    return (
        <div>
            {title && <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h3>}
            <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Metric</th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Primary Route</th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Recycled Route</th>
                            <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Savings</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {comparisonData.map((row) => (
                            <tr key={row.name}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{formatValue(row.name, row['Primary Route'])}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold text-right">{formatValue(row.name, row['Recycled Route'])}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        ▼ {row.savings.toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h4 className="font-semibold text-center text-gray-600 mb-2">Key Metrics Visual Comparison</h4>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={comparisonData} layout="vertical" barSize={15} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-chart-grid)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-chart-text)' }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: 'var(--text-primary)' }} />
                    <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{
                            background: 'white',
                            border: '1px solid var(--color-border)',
                            borderRadius: '0.5rem',
                        }}
                        formatter={(value: number, name: string, props) => [`${formatValue(props.payload.name, value)} ${props.payload.unit}`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}/>
                    <Bar dataKey="Primary Route" fill="#A0AEC0" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Recycled Route" fill="var(--color-brand-secondary)" radius={[0, 4, 4, 0]}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PrimaryRecycledComparisonDetailedChart;