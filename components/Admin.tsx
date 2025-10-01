
import React, { useState, useEffect, useMemo } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import type { LcaReport, PlatformAnalytics, View } from '../types';
import { MOCK_MODEL_HISTORY, MOCK_GLOBAL_DATA_SOURCES, MOCK_UPLOAD_HISTORY, ArrowUpTrayIcon, ArrowUturnLeftIcon, ExclamationTriangleIcon, CheckCircleIcon, UsersIcon, CircleStackIcon, CpuChipIcon, PresentationChartLineIcon, DocumentTextIcon, RecycleIcon } from '../constants';
import { getPlatformAnalytics, simulateRetraining } from '../services/geminiService';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import AILoadingAnimation from './ui/AILoadingAnimation';

type AdminView = 'platform_analytics' | 'all_user_reports' | 'dataset_management' | 'ai_model_hub';

interface AdminProps {
  allReports: LcaReport[];
  onViewReport: (report: LcaReport, source: View) => void;
}

const KpiStatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <Card padding="sm" className="flex items-center space-x-4 transition-all hover:shadow-xl hover:-translate-y-1">
        <div className="p-3 rounded-full bg-[var(--color-brand-secondary)]/10 text-[var(--color-brand-secondary)]">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        </div>
    </Card>
);

const AllReportsListView: React.FC<{ reports: LcaReport[], onViewReport: (report: LcaReport, source: View) => void }> = ({ reports, onViewReport }) => {
    const [userFilter, setUserFilter] = useState('All Users');
    const [materialFilter, setMaterialFilter] = useState('All Materials');

    const users = useMemo(() => ['All Users', ...Array.from(new Set(reports.map(r => r.author)))], [reports]);
    const materials = useMemo(() => ['All Materials', ...Array.from(new Set(reports.map(r => r.inputs.material)))], [reports]);

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const userMatch = userFilter === 'All Users' || report.author === userFilter;
            const materialMatch = materialFilter === 'All Materials' || report.inputs.material === materialFilter;
            return userMatch && materialMatch;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [reports, userFilter, materialFilter]);

    return (
        <Card padding="sm">
            <div className="flex space-x-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className="p-2 border rounded-md w-full">
                    {users.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <select value={materialFilter} onChange={e => setMaterialFilter(e.target.value)} className="p-2 border rounded-md w-full">
                    {materials.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--color-border)]">
                    <thead>
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Report</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Author</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">GWP</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                        {filteredReports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{report.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{report.author}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(report.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{report.impacts.gwp.value.toFixed(0)} kg CO₂-eq</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button onClick={() => onViewReport(report, 'admin')} className="text-[var(--color-brand-accent)] font-semibold">View Report</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const AdminDashboardView: React.FC<{ allReports: LcaReport[] }> = ({ allReports }) => {
    const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadAnalytics = async () => {
            if (!isMounted) return;
            setIsLoading(true);
            const sortedReports = [...allReports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            try {
                const previewData = await getPlatformAnalytics(sortedReports, 50);
                if (isMounted) {
                    setAnalytics(previewData);
                    setIsLoading(false); 
                }
                const fullData = await getPlatformAnalytics(sortedReports);
                if (isMounted) {
                    setAnalytics(fullData);
                }
            } catch (error) {
                console.error("Failed to load analytics", error);
                if(isMounted) setIsLoading(false);
            }
        };
        loadAnalytics();
        return () => { isMounted = false; };
    }, [allReports]);

    if (isLoading && !analytics) {
        return <AILoadingAnimation />;
    }

    if (!analytics) {
        return <Card><p>No analytics data available.</p></Card>;
    }

    return (
        <div className="space-y-6">
            {analytics.isPreview && (
                <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 text-sm rounded-r-lg animate-pulse">
                    <strong>Note:</strong> Displaying a preview based on the latest 50 reports. Full analytics are loading.
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiStatCard title="Total Analyses" value={analytics.totalAnalyses.toLocaleString()} icon={<PresentationChartLineIcon className="w-6 h-6" />} />
                <KpiStatCard title="Active Projects" value={analytics.activeProjects.toLocaleString()} icon={<DocumentTextIcon className="w-6 h-6" />} />
                <KpiStatCard title="Avg. GWP Savings" value={`${analytics.avgGwpSavings.toFixed(1)}%`} icon={<RecycleIcon className="w-6 h-6" />} />
                <KpiStatCard title="Top Hotspot" value={analytics.topHotspot.name} icon={<ExclamationTriangleIcon className="w-6 h-6" />} />
            </div>
            {/* Charts would go here */}
        </div>
    );
};

const DatasetManagementView: React.FC = () => (
    <Card>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Database Management</h3>
        <Button leftIcon={<ArrowUpTrayIcon className="w-5 h-5"/>}>Upload New Dataset</Button>
        <h4 className="text-md font-semibold text-[var(--text-secondary)] mt-6 mb-2">Upload History & Version Control</h4>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                {/* Table content from video */}
            </table>
        </div>
    </Card>
);

const AIModelHubView: React.FC = () => {
    const [isTraining, setIsTraining] = useState(false);
    const [modelInfo, setModelInfo] = useState({ version: '2.1', accuracy: '96.50%', lastTrained: '2023-10-15' });
    const handleRetrain = async () => {
        setIsTraining(true);
        await new Promise(res => setTimeout(res, 3000));
        setModelInfo({ version: '2.2', accuracy: '96.80%', lastTrained: new Date().toISOString().split('T')[0] });
        setIsTraining(false);
    }
    return (
        <Card>
             <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">AI Model Training Hub</h3>
             {/* Content from video */}
             <Button onClick={handleRetrain} disabled={isTraining}>{isTraining ? 'Training in Progress...' : 'Retrain Model from All Sources'}</Button>
             {isTraining && <AILoadingAnimation />}
        </Card>
    );
}

export const Admin: React.FC<AdminProps> = ({ allReports, onViewReport }) => {
    const [currentView, setCurrentView] = useState<AdminView>('platform_analytics');
    
    const tabs = [
        { key: 'platform_analytics', name: 'Platform Analytics', icon: <PresentationChartLineIcon className="w-5 h-5 mr-2"/> },
        { key: 'all_user_reports', name: 'All-User Reports', icon: <UsersIcon className="w-5 h-5 mr-2"/> },
        { key: 'dataset_management', name: 'Dataset Management', icon: <CircleStackIcon className="w-5 h-5 mr-2"/> },
        { key: 'ai_model_hub', name: 'AI Model Hub', icon: <CpuChipIcon className="w-5 h-5 mr-2"/> }
    ];

    const renderContent = () => {
        switch (currentView) {
            case 'platform_analytics':
                return <AdminDashboardView allReports={allReports} />;
            case 'all_user_reports':
                return <AllReportsListView reports={allReports} onViewReport={onViewReport} />;
            case 'dataset_management':
                return <DatasetManagementView />;
            case 'ai_model_hub':
                return <AIModelHubView />;
            default:
                return <div>Select a view</div>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Admin Panel</h1>
                <p className="text-[var(--text-secondary)] mt-1">System oversight and management dashboard.</p>
            </div>
            <div className="border-b border-[var(--color-border)]">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setCurrentView(tab.key as AdminView)}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${currentView === tab.key ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            {tab.icon} {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div>{renderContent()}</div>
        </div>
    );
};

export default Admin;
