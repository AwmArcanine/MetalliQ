import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

interface MonteCarloChartProps {
  title: string;
  meanValue: number;
  confidenceInterval: [number, number];
  unit: string;
  simulationResults?: number[];
}

const MonteCarloChart: React.FC<MonteCarloChartProps> = ({ title, meanValue, confidenceInterval, unit, simulationResults }) => {

  const histogramData = React.useMemo(() => {
    if (!simulationResults || simulationResults.length === 0) return null;

    const min = Math.min(...simulationResults);
    const max = Math.max(...simulationResults);
    const binCount = 20;
    const binWidth = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: [min + i * binWidth, min + (i + 1) * binWidth],
      count: 0,
    }));

    for (const value of simulationResults) {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
      if (bins[binIndex]) {
        bins[binIndex].count++;
      }
    }
    
    return bins.map(bin => ({
        name: `${bin.range[0].toFixed(0)}`,
        x: bin.range[0],
        count: bin.count,
    }));
  }, [simulationResults]);

  const stdDev = React.useMemo(() => {
      if (!simulationResults || simulationResults.length === 0) return 0;
      const n = simulationResults.length;
      const mean = simulationResults.reduce((a, b) => a + b) / n;
      return Math.sqrt(simulationResults.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
  }, [simulationResults]);


  if (!histogramData) {
      return (
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h3>
          <p className="text-sm text-center text-gray-500 py-10">No detailed simulation data available.</p>
        </div>
      );
  }
  
  const domainMin = Math.min(...simulationResults) * 0.95;
  const domainMax = Math.max(...simulationResults) * 1.05;

  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
       <div className="flex justify-between items-baseline text-sm text-[var(--text-secondary)] mb-4">
           <span>{simulationResults.length} Runs</span>
           <span className="font-mono text-xs">σ = {stdDev.toFixed(1)}</span>
       </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart
          data={histogramData}
          margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
          barGap={0}
          barCategoryGap="1%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)"/>
          <XAxis 
            type="number"
            dataKey="x"
            domain={[domainMin, domainMax]}
            tick={{ fontSize: 10, fill: 'var(--color-chart-text)' }}
            tickFormatter={(val) => val.toFixed(0)}
           />
          <YAxis allowDecimals={false} hide />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ background: 'var(--color-panel-light)', border: '1px solid var(--color-border-subtle)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}
            formatter={(value: number, name, props) => [`${value} runs`, `Range: > ${props.payload.x.toFixed(0)}`]}
            labelFormatter={() => ''}
          />
          <Bar dataKey="count" fill="var(--color-border)" name="Frequency"/>

          <ReferenceLine x={meanValue} stroke="var(--color-brand-primary)" strokeWidth={2}>
             <Label value={`Mean: ${meanValue.toFixed(0)}`} position="top" fill="var(--color-brand-primary)" fontSize={12} dy={-5} />
          </ReferenceLine>
          <ReferenceLine x={confidenceInterval[0]} stroke="var(--color-brand-accent)" strokeWidth={1} strokeDasharray="3 3">
             <Label value={`95% CI`} position="top" fill="var(--color-brand-accent)" fontSize={10} dy={-5} dx={25} />
          </ReferenceLine>
          <ReferenceLine x={confidenceInterval[1]} stroke="var(--color-brand-accent)" strokeWidth={1} strokeDasharray="3 3" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonteCarloChart;