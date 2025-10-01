import React from 'react';
import Card from './Card';

interface KpiCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  colorClass: string;
  className?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, unit, icon, colorClass, className }) => {
  return (
    <Card padding="sm" className={`transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${colorClass} shadow-md`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-on-light-secondary)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-on-light-primary)]">
            {value} <span className="text-base font-medium text-[var(--text-on-light-secondary)]">{unit}</span>
          </p>
        </div>
      </div>
    </Card>
  );
};
export default KpiCard;