import React, { useState } from 'react';
import type { LcaReport, DetailedActionStep } from '../types';
import { MagnifyingGlassIcon, ShareIcon, ClipboardDocumentCheckIcon, ExclamationTriangleIcon } from '../constants';

interface AIActionPlanCardProps {
  actionPlan: LcaReport['aiActionPlan'];
}

const EffortTag: React.FC<{ effort: 'Low' | 'Medium' | 'High' }> = ({ effort }) => {
    const styles = {
        Low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
        Medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
        High: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    };
    const style = styles[effort];
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${style.bg} ${style.text} ${style.border}`}>
            {effort} Effort
        </span>
    );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div>
        <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center mb-2">
            {icon}
            <span className="ml-2">{title}</span>
        </h4>
        <div className="pl-7 text-sm text-[var(--text-secondary)]">
            {children}
        </div>
    </div>
);

const ActionStep: React.FC<{ step: DetailedActionStep }> = ({ step }) => (
    <div className="p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-panel-light)]">
        <h5 className="font-semibold text-sm text-[var(--text-primary)]">{step.title}</h5>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{step.description}</p>
        <p className="text-xs text-[var(--text-secondary)] mt-2"><span className="font-semibold text-[var(--text-primary)]">Impact:</span> {step.impact}</p>
        <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-semibold text-gray-400">Confidence: {step.confidence}%</span>
            <EffortTag effort={step.effort} />
        </div>
    </div>
);

const Recommendation: React.FC<{ rec: LcaReport['aiActionPlan']['recommendations'][0] }> = ({ rec }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-md">
            <div 
                className="flex justify-between items-start cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
            >
                <h3 className="text-lg font-bold text-[var(--text-primary)] pr-2 flex items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-1 text-[var(--color-cta)]" />
                    {rec.title}
                </h3>
                <div className="flex items-center flex-shrink-0">
                    <span className={`px-3 py-1 text-xs font-bold text-white bg-[var(--color-cta)] rounded-full shadow-sm mr-4`}>{rec.priority} Priority</span>
                    <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-4 animate-fade-in-up">
                    <Section title="Evidence" icon={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}>
                        <p className="p-3 bg-[var(--color-panel-light)] rounded-md border border-[var(--color-border-subtle)] italic">{rec.evidence}</p>
                    </Section>
                    
                    <Section title="Root Cause" icon={<ShareIcon className="w-5 h-5 text-gray-400" />}>
                        <p>{rec.rootCause}</p>
                    </Section>

                    <Section title="Action Plan" icon={<ClipboardDocumentCheckIcon className="w-5 h-5 text-gray-400" />}>
                        <div className="space-y-4">
                            {rec.actionSteps.map(step => <ActionStep key={step.id} step={step} />)}
                        </div>
                    </Section>
                </div>
            )}
        </div>
    );
};

const AIActionPlanCard: React.FC<AIActionPlanCardProps> = ({ actionPlan }) => {
  return (
    <div className="space-y-6">
        <div className="bg-[var(--color-panel-light)] p-4 rounded-lg border border-[var(--color-border-subtle)]">
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">AI Summary:</h3>
            <p className="text-sm text-[var(--text-secondary)]">{actionPlan.overallSummary}</p>
        </div>
        
        <div className="space-y-4">
            {actionPlan.recommendations.map(rec => (
                <Recommendation key={rec.id} rec={rec} />
            ))}
        </div>
    </div>
  );
};

export default AIActionPlanCard;