import React, { useMemo } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import type { LcaReport, View, Workspace, User } from '../types';
import { RecycleIcon, PlusCircleIcon, DocumentTextIcon, ArrowTrendingUpIcon, ChartPieIcon } from '../constants';

// --- Reusable Stat Component for the main KPI card ---
const Stat: React.FC<{ title: string; value: string; unit: string; }> = ({ title, value, unit }) => (
    <div className="text-center px-4">
        <p className="text-sm text-[var(--text-secondary)]">{title}</p>
        <p className="text-4xl font-bold text-[var(--text-primary)] mt-1">
            {value}
            <span className="text-2xl font-medium text-[var(--text-secondary)] ml-1">{unit}</span>
        </p>
    </div>
);

// --- Custom Tooltip for Charts ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-[var(--color-panel-light)] border border-[var(--color-border-subtle)] rounded-md shadow-lg text-sm">
                <p className="font-bold mb-1 text-[var(--text-primary)]">{label}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color }}>
                        {pld.name}: {(pld.value || 0).toFixed(1)}{pld.unit || ''}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// --- Main Dashboard Component ---
interface DashboardProps {
    onNavigate: (view: View) => void;
    reports: LcaReport[];
    onViewReport: (report: LcaReport, source: 'dashboard') => void;
    workspace: Workspace;
    currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, reports, onViewReport, workspace, currentUser }) => {
    
    const dashboardMetrics = useMemo(() => {
        const validReports = reports.filter(r => r && r.inputs && r.circularityDetails && r.circularityDetails.reusePotential);
        
        if (validReports.length === 0) return null;
        
        const totalReports = validReports.length;
        const avgRecyclingRate = validReports.reduce((acc, r) => acc + (r.circularityDetails.recyclabilityRate || 0), 0) / totalReports;
        const avgCircularity = validReports.reduce((acc, r) => acc + (r.circularityScore || 0), 0) / totalReports;
        
        const parseQuantity = (unitString: string = '1 ton') => parseFloat(unitString.match(/^[0-9.]+/)?.[0] ?? '1') || 1;

        const totalRecycledMaterial = validReports.reduce((acc, r) => {
            const quantity = parseQuantity(r.inputs.functionalUnit);
            const recycledContent = (r.circularityDetails.secondaryMaterialContent || 0) / 100;
            return acc + (quantity * recycledContent);
        }, 0);

        const recyclingRateOverTime = [...validReports]
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map(r => ({
                date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                'Recycling Rate': r.circularityDetails.recyclabilityRate,
            }));

        const primaryCount = validReports.filter(r => r.inputs.productionProcess === 'primary').length;
        const recycledCount = totalReports - primaryCount;
        const materialShare = [
            { name: 'Primary Route', value: primaryCount, color: 'var(--color-cta)' },
            { name: 'Recycled Route', value: recycledCount, color: 'var(--color-brand-secondary)' },
        ];

        const topMaterialsByRecycledContent = Object.entries(
            validReports.reduce((acc, r) => {
                const material = r.inputs.material;
                if (!material) return acc;
                if (!acc[material]) {
                    acc[material] = { total: 0, count: 0 };
                }
                acc[material].total += r.circularityDetails.secondaryMaterialContent || 0;
                acc[material].count += 1;
                return acc;
            }, {} as Record<string, { total: number; count: number }>)
        ).map(([name, data]) => ({ name, value: data.total / data.count }))
         .sort((a, b) => b.value - a.value)
         .slice(0, 3);
        
        const projectsByReuse = [...validReports]
            .sort((a, b) => (b.circularityDetails.reusePotential.value || 0) - (a.circularityDetails.reusePotential.value || 0))
            .slice(0, 3);
        
        const totalGWP = validReports.reduce((acc, r) => acc + (r.impacts?.gwp?.value || 0), 0);
        const latestReport = validReports.length > 0 ? [...validReports].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : null;

        return {
            avgRecyclingRate,
            totalRecycledMaterial,
            avgCircularity,
            recyclingRateOverTime,
            materialShare,
            topMaterialsByRecycledContent,
            projectsByReuse,
            totalReports,
            totalGWP,
            latestReport,
        };
    }, [reports]);

    if (!dashboardMetrics) {
        return (
            <Card className="text-center p-8 sm:p-12 flex flex-col items-center justify-center rounded-xl bg-white shadow-lg shadow-black/5 relative overflow-hidden" style={{ minHeight: '60vh' }}>
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-[var(--color-brand-primary)]/10 rounded-full z-0 filter blur-2xl"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[var(--color-brand-secondary)]/10 rounded-full z-0 filter blur-2xl"></div>
                <RecycleIcon className="h-20 w-20 text-[var(--color-brand-primary)] mx-auto" />
                <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Welcome to your Workspace</h2>
                <p className="mt-2 text-[var(--text-secondary)] max-w-md">
                    Create your first Life Cycle Assessment to see sustainability insights and track circularity metrics.
                </p>
                <div className="mt-8">
                    <Button onClick={() => onNavigate('newStudy')} size="lg" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>Create First Study</Button>
                </div>
            </Card>
        );
    }
    
    const { avgRecyclingRate, totalRecycledMaterial, avgCircularity, recyclingRateOverTime, materialShare, topMaterialsByRecycledContent, projectsByReuse, totalReports, totalGWP, latestReport } = dashboardMetrics;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">{workspace.name} Dashboard</h1>
                    <p className="text-[var(--text-secondary)] mt-1">An overview of your workspace's sustainability metrics.</p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button onClick={() => onNavigate('newStudy')} variant="secondary" leftIcon={<PlusCircleIcon className="w-4 h-4" />}>Create Study</Button>
                    <Button onClick={() => onNavigate('reports')} leftIcon={<DocumentTextIcon className="w-4 h-4" />}>View All Reports</Button>
                </div>
            </div>

            <Card className="bg-white">
                <div className="flex items-center">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center"><ChartPieIcon className="w-6 h-6 mr-2 text-[var(--color-brand-secondary)]"/> Your Circular Impact</h2>
                </div>
                <div className="flex flex-col sm:flex-row justify-around items-center py-6 space-y-4 sm:space-y-0">
                    <Stat title="Average Recycling Rate" value={avgRecyclingRate.toFixed(1)} unit="%" />
                    <div className="h-px w-16 sm:h-16 sm:w-px bg-[var(--color-border-subtle)]"></div>
                    <Stat title="Total Recycled Material" value={totalRecycledMaterial.toFixed(2)} unit="tonnes" />
                    <div className="h-px w-16 sm:h-16 sm:w-px bg-[var(--color-border-subtle)]"></div>
                    <Stat title="Average Circularity Score" value={avgCircularity.toFixed(0)} unit="/ 100" />
                </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recycling Rate Over Time</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={recyclingRateOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <defs><linearGradient id="colorRecycling" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-brand-secondary)" stopOpacity={0.8}/><stop offset="95%" stopColor="var(--color-brand-secondary)" stopOpacity={0}/></linearGradient></defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
                             <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} />
                             <YAxis unit="%" tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} domain={[0, 100]} />
                             <Tooltip content={<CustomTooltip />} />
                             <Area type="monotone" name="Recycling Rate" dataKey="Recycling Rate" stroke="var(--color-brand-secondary)" fill="url(#colorRecycling)" strokeWidth={2} unit="%" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                 <Card>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recycled vs Primary Material Share</h3>
                     <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={materialShare} cx="50%" cy="50%" innerRadius={70} outerRadius={90} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name">
                                {materialShare.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{color: 'var(--text-primary)'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                     <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Sustainability Hotspots</h3>
                     <p className="text-sm text-[var(--text-secondary)] mb-4">Top 3 Materials by Recycled Content</p>
                     <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={topMaterialsByRecycledContent} layout="vertical" margin={{ left: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-chart-grid)" />
                            <XAxis type="number" unit="%" domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--color-chart-text)' }} />
                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: 'var(--text-primary)' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Avg. Recycled Content" fill="var(--color-brand-primary)" barSize={20} radius={[0, 8, 8, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                </Card>
                 <Card>
                     <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Projects with Highest Reuse Potential</h3>
                     <div className="space-y-3">
                         {projectsByReuse.map(report => (
                             <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                 <div>
                                     <p className="font-semibold text-sm text-[var(--text-primary)]">{report.inputs?.projectName}</p>
                                     <p className="text-xs text-[var(--text-secondary)]">{report.inputs?.material}</p>
                                 </div>
                                 <div className="text-lg font-bold text-[var(--color-brand-accent)]">
                                     {report.circularityDetails?.reusePotential?.value}/{report.circularityDetails?.reusePotential?.max}
                                 </div>
                             </div>
                         ))}
                     </div>
                </Card>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">General Overview</h3>
                    <div className="flex justify-around items-center h-full">
                        <div className="text-center">
                            <p className="text-sm text-[var(--text-secondary)]">Total Reports</p>
                            <p className="text-5xl font-bold text-[var(--text-primary)] mt-1">{totalReports}</p>
                             <p className="text-sm text-[var(--text-secondary)]">Analyses Generated</p>
                        </div>
                        <div className="h-16 w-px bg-[var(--color-border-subtle)]"></div>
                        <div className="text-center">
                            <p className="text-sm text-[var(--text-secondary)]">Total GWP (Sum)</p>
                            <p className="text-5xl font-bold text-[var(--text-primary)] mt-1">{totalGWP.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                            <p className="text-sm text-[var(--text-secondary)]">t CO₂-eq</p>
                        </div>
                    </div>
                </Card>
                {latestReport && (
                    <Card>
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Latest Report Analysis</h3>
                            <Button onClick={() => onViewReport(latestReport, 'dashboard')} variant='ghost'>View Full Report</Button>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            Displaying full report for: {latestReport.title}
                        </p>
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                            <strong>ISO 14044 Conformance:</strong> {latestReport.inputs.limitations}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Dashboard;