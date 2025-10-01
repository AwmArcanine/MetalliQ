import React, { useState, useRef } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import type { LcaReport, User, Workspace, Comment as CommentType } from '../types';
import { exportLcaReportToPdf } from '../services/pdfExportService';

import AIActionPlanCard from './AIActionPlanCard';
import AILoadingAnimation from './ui/AILoadingAnimation';
import CollaborationToolbar from './ui/CollaborationToolbar';
import CollaborationPanel from './ui/CollaborationPanel';
import AnimatedImpactGrid from './charts/AnimatedImpactGrid';
import DetailedImpactTable from './tables/DetailedImpactTable';
import MonteCarloChart from './charts/MonteCarloChart';
import ExtendedCircularityMetrics from './ExtendedCircularityMetrics';
import ProcessLifecycleDiagram from './charts/ProcessLifecycleDiagram';
import SankeyChart from './charts/SankeyChart';
import CircularityAnalysisChart from './charts/CircularityAnalysisChart';
import PrimaryRecycledComparisonDetailedChart from './charts/PrimaryRecycledComparisonDetailedChart';
import HotspotsAnalysis from './HotspotsAnalysis';
import OverallImpactChart from './charts/OverallImpactChart';
import EnergySourceChart from './charts/EnergySourceChart';
import WaterfallChart from './charts/WaterfallChart';

import { ArrowUturnLeftIcon, ShareIcon, DocumentArrowDownIcon, InformationCircleIcon, ExclamationTriangleIcon, BrainIcon, DocumentTextIcon, ShieldCheckIcon, RecycleIcon, ChartPieIcon } from '../constants'; 
import { getSvgFromRef } from '../utils/chartUtils';

interface AnalysisReportProps {
  report: LcaReport;
  onBack: () => void;
  onUpdateReport: (updatedReport: LcaReport) => void;
  currentUser: User;
  workspace: Workspace;
}

// --- Reusable Section Component ---
const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <div className={`fade-in-section ${className}`}>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
            {icon}
            <span className="ml-3">{title}</span>
        </h2>
        {children}
    </div>
);

// --- Individual Cards for Report Sections ---
const ExecutiveSummaryCard: React.FC<{ report: LcaReport }> = ({ report }) => {
    const kpis = [
        { title: 'Global Warming Potential', value: report.impacts.gwp.value.toLocaleString(undefined, {maximumFractionDigits: 0}), unit: report.impacts.gwp.unit },
        { title: 'Circularity Score', value: report.circularityScore.toFixed(0), unit: '%' },
        { title: 'Particulate Matter', value: report.impacts.pm_formation.value.toExponential(2), unit: report.impacts.pm_formation.unit },
        { title: 'Water Consumption', value: report.impacts.water.value.toFixed(1), unit: report.impacts.water.unit },
    ];
    return (
        <Card>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(kpi => (
                    <div key={kpi.title} className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
                        <p className="text-xs text-[var(--text-secondary)]">{kpi.title}</p>
                        <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{kpi.value} <span className="text-sm font-normal">{kpi.unit}</span></p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const GoalAndScopeCard: React.FC<{ inputs: LcaReport['inputs'] }> = ({ inputs }) => (
    <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div><h3 className="font-semibold text-[var(--text-secondary)]">Intended Application</h3><p className="text-[var(--text-primary)]">{inputs.intendedApplication}</p></div>
            <div><h3 className="font-semibold text-[var(--text-secondary)]">Intended Audience</h3><p className="text-[var(--text-primary)]">{inputs.intendedAudience}</p></div>
            <div><h3 className="font-semibold text-[var(--text-secondary)]">System Boundary</h3><p className="text-[var(--text-primary)]">{inputs.systemBoundary.join(', ')}</p></div>
            <div><h3 className="font-semibold text-[var(--text-secondary)]">Comparative Assertion for Public</h3><p className={`font-bold ${inputs.isComparativeAssertion ? 'text-red-500' : 'text-green-500'}`}>{inputs.isComparativeAssertion ? 'Yes' : 'No'}</p></div>
            <div className="md:col-span-2"><h3 className="font-semibold text-[var(--text-secondary)]">Limitations</h3><p className="text-[var(--text-primary)]">{inputs.limitations}</p></div>
        </div>
    </Card>
);

const DataQualityUncertaintyCard: React.FC<{ inputs: LcaReport['inputs'] }> = ({ inputs }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-x-6 gap-y-4 text-sm text-center">
            <div><h3 className="font-semibold text-[var(--text-secondary)]">Reliability</h3><p className="text-[var(--text-primary)] font-medium text-lg">{inputs.reliability}/5</p></div>
            <div><h3 className="font-semibold text-[var(--text-secondary)]">Completeness</h3><p className="text-[var(--text-primary)] font-medium text-lg">{inputs.completeness}/5</p></div>
            <div><h3 className="font-semibold text-[var(--text-secondary)]">Temporal</h3><p className="text-[var(--text-primary)] font-medium text-lg">{inputs.temporal}/5</p></div>
            <div><h3 className="font-semibold text-[var(--text-secondary)]">Geographical</h3><p className="text-[var(--text-primary)] font-medium text-lg">{inputs.geographical}/5</p></div>
            <div><h3 className="font-semibold text-[var(--text-secondary)]">Technological</h3><p className="text-[var(--text-primary)] font-medium text-lg">{inputs.technological}/5</p></div>
        </Card>
        <div className="grid grid-cols-2 gap-px">
            <Card className="flex flex-col items-center justify-center p-4 rounded-r-none">
                <p className="text-sm font-semibold text-[var(--text-secondary)]">Aggregated Data Quality</p>
                <p className="text-4xl font-bold text-[var(--color-brand-primary)] my-1">{inputs.adqi.toFixed(2)}</p>
                <p className="text-xs font-medium text-[var(--text-secondary)]">Score (ADQI)</p>
            </Card>
            <Card className="flex flex-col items-center justify-center p-4 rounded-l-none">
                <p className="text-sm font-semibold text-[var(--text-secondary)]">Result Uncertainty</p>
                <p className="text-4xl font-bold text-[var(--color-cta)] my-1">±{inputs.uncertaintyDeviation}%</p>
            </Card>
        </div>
    </div>
);


export const AnalysisReport: React.FC<AnalysisReportProps> = ({ report, onBack, onUpdateReport, currentUser, workspace }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isCollaborationPanelOpen, setIsCollaborationPanelOpen] = useState(false);
  const [collaborationView, setCollaborationView] = useState<'comments' | 'activity'>('comments');
  const [impactView, setImpactView] = useState<'chart' | 'table'>('chart');

  const overallImpactChartRef = useRef<HTMLDivElement>(null);
  const primaryRecycledDetailedRef = useRef<HTMLDivElement>(null);
  const processLifecycleRef = useRef<HTMLDivElement>(null);
  const monteCarloGwpRef = useRef<HTMLDivElement>(null);
  const monteCarloEnergyRef = useRef<HTMLDivElement>(null);
  const monteCarloWaterRef = useRef<HTMLDivElement>(null);
  const sankeyRef = useRef<HTMLDivElement>(null);
  const circularityAnalysisRef = useRef<HTMLDivElement>(null);
  const waterfallRef = useRef<HTMLDivElement>(null);
  const energySourceRef = useRef<HTMLDivElement>(null);


  const handleExport = async () => {
    setIsExporting(true);
    const svgs = {
        overallImpact: await getSvgFromRef(overallImpactChartRef),
        primaryRecycledDetailed: await getSvgFromRef(primaryRecycledDetailedRef),
        processLifecycle: await getSvgFromRef(processLifecycleRef),
        monteCarloGwp: await getSvgFromRef(monteCarloGwpRef),
        monteCarloEnergy: await getSvgFromRef(monteCarloEnergyRef),
        monteCarloWater: await getSvgFromRef(monteCarloWaterRef),
        sankey: await getSvgFromRef(sankeyRef),
        circularityAnalysis: await getSvgFromRef(circularityAnalysisRef),
        waterfall: await getSvgFromRef(waterfallRef),
        energySource: await getSvgFromRef(energySourceRef),
    };
    await exportLcaReportToPdf(report, svgs, { sections: { summary: true, goalAndScope: true, detailedAnalysis: true, circularity: true, interpretation: true, appendices: true }, dateRange: { start: null, end: null } });
    setIsExporting(false);
  };

  const handleAddComment = (content: string) => {
    const newComment: CommentType = {
      id: `comment_${Date.now()}`, authorId: currentUser.id, authorName: currentUser.name, authorInitials: currentUser.initials, content, createdAt: new Date().toISOString(),
    };
    onUpdateReport({ ...report, comments: [...report.comments, newComment], activityLog: [...report.activityLog, { id: `log_${Date.now()}`, actorId: currentUser.id, actorName: currentUser.name, action: 'added a comment', target: `on report "${report.title}"`, timestamp: new Date().toISOString() }] });
  };

  return (
    <div className="flex">
        <div className="flex-1 space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
              <div>
                  <Button onClick={onBack} variant="ghost" leftIcon={<ArrowUturnLeftIcon className="w-5 h-5"/>}>Back to Reports</Button>
                  <h1 className="text-3xl font-bold text-[var(--text-primary)] mt-2">{report.title}</h1>
                  <p className="text-[var(--text-secondary)] mt-1">Generated on {new Date(report.createdAt).toLocaleDateString()} by {report.author}</p>
              </div>
              <div className="flex items-center space-x-2">
                  <Button variant="secondary" leftIcon={<ShareIcon className="w-4 h-4"/>}>Share</Button>
                  <Button onClick={handleExport} disabled={isExporting} leftIcon={<DocumentArrowDownIcon className="w-4 h-4"/>}>{isExporting ? 'Exporting...' : 'Export PDF'}</Button>
              </div>
          </div>

          {isExporting && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><AILoadingAnimation/></div>}
          
          <Card>
            <p className="text-sm font-medium text-[var(--color-brand-primary)] mb-2 flex items-center">
                <InformationCircleIcon className="w-5 h-5 mr-2" />
                ISO 14044 Conformance
            </p>
            <p className="text-xs text-[var(--text-secondary)] mb-4">This is a screening-level LCA designed to be broadly consistent with ISO 14044 principles for internal decision-making. For public comparative assertions, a formal third-party critical review of this report is required.</p>
          </Card>
          
          <Section title="Executive Summary" icon={<DocumentTextIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><ExecutiveSummaryCard report={report} /></Section>
          <Section title="Goal & Scope (ISO 14044)" icon={<DocumentTextIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><GoalAndScopeCard inputs={report.inputs} /></Section>
          <Section title="Data Quality & Uncertainty" icon={<ShieldCheckIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><DataQualityUncertaintyCard inputs={report.inputs} /></Section>
          <Section title="Supply Chain Hotspots" icon={<ExclamationTriangleIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><Card><HotspotsAnalysis hotspots={report.supplyChainHotspots} /></Card></Section>
          <Section title="Interactive Process Lifecycle" icon={<ChartPieIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><Card><div ref={processLifecycleRef}><ProcessLifecycleDiagram report={report} /></div></Card></Section>
          <Section title="AI-Generated Life Cycle Interpretation" icon={<BrainIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><Card><p className="text-sm text-[var(--text-secondary)] leading-relaxed">{report.lifeCycleInterpretation}</p></Card></Section>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2"><Section title="Circularity Analysis" icon={<RecycleIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><Card><div ref={circularityAnalysisRef}><CircularityAnalysisChart score={report.circularityScore} details={report.circularityDetails} /></div></Card></Section></div>
              <div className="lg:col-span-3"><Section title="Material Flow Analysis" icon={<RecycleIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><Card><div ref={sankeyRef}><SankeyChart report={report} /></div></Card></Section></div>
          </div>
          
          <Section title="Extended Circularity Metrics" icon={<RecycleIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><ExtendedCircularityMetrics details={report.circularityDetails} /></Section>
          <Section title="Key Impact Profiles" icon={<ChartPieIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><Card><div ref={overallImpactChartRef}><OverallImpactChart impacts={report.impacts} /></div></Card></Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="GWP Contribution Analysis" icon={<ChartPieIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><Card><div ref={waterfallRef}><WaterfallChart title="" data={report.impacts.gwp.stages} unit={report.impacts.gwp.unit} /></div></Card></Section>
            <Section title="Energy Source Breakdown" icon={<ChartPieIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><Card><div ref={energySourceRef}><EnergySourceChart data={report.impacts.energy.sources || []} title="" unit={report.impacts.energy.unit} /></div></Card></Section>
          </div>
          
          <Section title="Detailed Impact Assessment" icon={<InformationCircleIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}>
              <div className="mb-4 flex justify-end"><div className="inline-flex rounded-md shadow-sm bg-white"><button onClick={() => setImpactView('chart')} className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${impactView === 'chart' ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]' : 'bg-transparent border-[var(--color-border)] text-[var(--text-secondary)] hover:bg-gray-50'}`}>Chart View</button><button onClick={() => setImpactView('table')} className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${impactView === 'table' ? 'bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]' : 'bg-transparent border-[var(--color-border)] text-[var(--text-secondary)] hover:bg-gray-50'}`}>Table View</button></div></div>
              {impactView === 'chart' ? <AnimatedImpactGrid impacts={report.impacts} /> : <Card padding="sm"><DetailedImpactTable impacts={report.impacts} /></Card>}
          </Section>
          
          <Section title="Uncertainty Dashboard" icon={<ExclamationTriangleIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}>
              <Card>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">Based on Monte Carlo simulation (1000 runs) to assess data variability.</p>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div ref={monteCarloGwpRef}><MonteCarloChart title="GWP" meanValue={report.impacts.gwp.value} confidenceInterval={report.impacts.gwp.confidenceInterval} unit={report.impacts.gwp.unit} simulationResults={report.impacts.gwp.simulationResults} /></div>
                      <div ref={monteCarloEnergyRef}><MonteCarloChart title="Energy" meanValue={report.impacts.energy.value} confidenceInterval={report.impacts.energy.confidenceInterval} unit={report.impacts.energy.unit} simulationResults={report.impacts.energy.simulationResults} /></div>
                      <div ref={monteCarloWaterRef}><MonteCarloChart title="Water" meanValue={report.impacts.water.value} confidenceInterval={report.impacts.water.confidenceInterval} unit={report.impacts.water.unit} simulationResults={report.impacts.water.simulationResults} /></div>
                  </div>
              </Card>
          </Section>

          <Section title="AI-Powered Insights & Recommendations" icon={<BrainIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}><AIActionPlanCard actionPlan={report.aiActionPlan} /></Section>
          <Section title="Primary vs. Recycled Route Comparison" icon={<RecycleIcon className="w-6 h-6 text-[var(--color-brand-primary)]"/>}>
              <Card><div ref={primaryRecycledDetailedRef}><PrimaryRecycledComparisonDetailedChart title="" data={report.primaryVsRecycled} /></div></Card>
          </Section>
        </div>
        <CollaborationPanel isOpen={isCollaborationPanelOpen} onClose={() => setIsCollaborationPanelOpen(false)} view={collaborationView} report={report} currentUser={currentUser} onAddComment={handleAddComment} />
    </div>
  );
};