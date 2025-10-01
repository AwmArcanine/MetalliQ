import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import type { LcaReport, User, View } from '../types';
import { PlusCircleIcon } from '../constants';

interface ReportsProps {
  reports: LcaReport[];
  onViewReport: (report: LcaReport) => void;
  onNavigate: (view: View) => void;
  currentUser: User;
  onDeleteReport: (report: LcaReport) => void;
}

const Reports: React.FC<ReportsProps> = ({ reports, onViewReport, onNavigate, currentUser, onDeleteReport }) => {
  const [filters, setFilters] = useState({
    material: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      if (filters.material !== 'all' && report.inputs.material !== filters.material) return false;
      if (filters.category !== 'all' && report.inputs.category !== filters.category) return false;
      if (startDate && reportDate < startDate) return false;
      if (endDate && reportDate > endDate) return false;

      return true;
    });
  }, [reports, filters]);
  
  const uniqueMaterials = [...new Set(reports.map(r => r.inputs.material))];
  const uniqueCategories = [...new Set(reports.map(r => r.inputs.category))];
  const filterInputStyles = "w-full p-2.5 border bg-white text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-accent)] focus:border-[var(--color-brand-accent)] transition-colors duration-200";

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div>
                <h1 className="text-3xl font-bold text-[var(--text-on-light-primary)]">Report Archive</h1>
                <p className="text-[var(--text-on-light-secondary)] mt-1">Review and export your previously generated reports.</p>
            </div>
            <Button onClick={() => onNavigate('newStudy')} leftIcon={<PlusCircleIcon className="w-5 h-5 mr-2" />}>
                New Study
            </Button>
        </div>
      
      <Card padding="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <select name="material" value={filters.material} onChange={handleFilterChange} className={`${filterInputStyles}`}>
            <option value="all">All Materials</option>
            {uniqueMaterials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select name="category" value={filters.category} onChange={handleFilterChange} className={`${filterInputStyles}`}>
            <option value="all">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={`${filterInputStyles}`} />
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={`${filterInputStyles}`} />
        </div>
      </Card>
      
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-border)]">
            <thead className="">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Report Title</th>
                {isAdmin && <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Author</th>}
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Material</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Date Created</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">GWP (kg CO₂-eq)</th>
                 <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-on-light-primary)]">{report.title}</td>
                  {isAdmin && <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-on-light-secondary)]">{report.author}</td>}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-on-light-secondary)]">{report.inputs.material}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-on-light-secondary)]">{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[var(--text-on-light-primary)]">{report.impacts.gwp.value.toFixed(0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onViewReport(report)} className="text-[var(--color-brand-accent)] hover:text-blue-700 font-semibold mr-4">
                      View
                    </button>
                    <button onClick={() => onDeleteReport(report)} className="text-red-500 hover:text-red-700 font-semibold">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;