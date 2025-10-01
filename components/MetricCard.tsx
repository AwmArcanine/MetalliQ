

import React from 'react';
import Card from './ui/Card';
import type { Metric } from '../types';

interface MetricCardProps {
  metric: Metric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const isDecrease = metric.changeType === 'decrease';

  const ChangeArrow = isDecrease ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l-4-4m0 0l-4 4m4-4v12" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 7l4 4m0 0l4-4m-4 4v12" />
    </svg>
  );

  return (
    <Card padding="sm" className="flex-1">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-[var(--text-on-light-secondary)]">{metric.title}</h3>
        <div className="p-2 bg-blue-100 rounded-lg">
          <metric.icon className="h-5 w-5 text-blue-600" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-[var(--text-on-light-primary)]">{metric.value}</p>
        <span
          className="ml-2 flex items-center text-sm font-semibold"
          style={{ color: isDecrease ? 'var(--color-chart-positive)' : 'var(--color-chart-negative)' }}
        >
          {ChangeArrow}
          {metric.change}
        </span>
      </div>
      <div className="mt-2 text-xs text-[var(--text-on-light-secondary)] flex items-center space-x-2">
        {metric.details.map((detail, index) => (
          <React.Fragment key={index}>
            <span>{detail}</span>
            {index < metric.details.length - 1 && <span className="text-slate-300">|</span>}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
};

export default MetricCard;