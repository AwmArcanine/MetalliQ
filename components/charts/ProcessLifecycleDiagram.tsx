import React, { useState } from 'react';
import type { LcaReport } from '../../types';

// --- ICONS ---
const RawMaterialIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);
const ProcessingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.212l2.29.916a1.125 1.125 0 01.922 1.372l-.995 2.786c.345.13.69.283 1.02.46l2.786-.995a1.125 1.125 0 011.372.922l.916 2.29c.205.55.033 1.16-.386 1.503l-2.29.916a1.125 1.125 0 01-1.372-.922l-.995-2.786a2.25 2.25 0 00-1.631-1.631l-2.786-.995a1.125 1.125 0 01-.922-1.372l.916-2.29z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.657 14.343a2.25 2.25 0 01-3.182 0l-2.29-.916a1.125 1.125 0 01-.922-1.372l.995-2.786a2.25 2.25 0 00-1.631-1.631l-2.786-.995a1.125 1.125 0 01-.922-1.372l.916-2.29c.205-.55.77-.94 1.332-1.028a2.25 2.25 0 012.332 2.332l.437 1.222a2.25 2.25 0 001.631 1.631l2.786.995c.542.192 1.007.66 1.212 1.212l.916 2.29a1.125 1.125 0 01-.922 1.372l-2.29.916c-.55.205-1.16.033-1.503-.386l-1.222-.437z" />
    </svg>
);
const ManufacturingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.625a2.25 2.25 0 01-2.36 0l-7.5-4.625A2.25 2.25 0 013.25 6.993V6.75" />
    </svg>
);
const TransportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.375c-.621 0-1.125.504-1.125 1.125v10.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);
const UsePhaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
);
const EndOfLifeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const stages = [
    { name: 'Raw Material', Icon: RawMaterialIcon },
    { name: 'Processing', Icon: ProcessingIcon },
    { name: 'Manufacturing', Icon: ManufacturingIcon },
    { name: 'Transport', Icon: TransportIcon },
    { name: 'Use Phase', Icon: UsePhaseIcon },
    { name: 'End of Life', Icon: EndOfLifeIcon },
];

const ImpactRow: React.FC<{ label: string, value: number, unit: string }> = ({ label, value, unit }) => (
    <div className="flex justify-between items-baseline">
        <span className="font-medium text-[var(--text-secondary)]">{label}:</span>
        <span className="font-semibold text-right">
            {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            <span className="font-normal text-[var(--text-secondary)] ml-1">{unit}</span>
        </span>
    </div>
);

const StageNode: React.FC<{ stage: { name: string; Icon: React.FC<any> }, impacts: any, report: LcaReport }> = ({ stage, impacts, report }) => {
    const hasImpacts = impacts && (impacts.gwp > 0 || impacts.energy > 0 || impacts.water > 0);
    return (
        <div className="relative group flex flex-col items-center w-24">
            <div className="w-20 h-20 rounded-full bg-[var(--color-panel-light)] border-2 border-[var(--color-border-subtle)] flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-[var(--color-brand-accent)]">
                <stage.Icon className="w-10 h-10 text-[var(--color-brand-primary)]" />
            </div>
            <span className="mt-2 text-xs font-semibold h-8 flex items-center text-[var(--text-primary)]">{stage.name}</span>
            {hasImpacts && (
                <div className="absolute top-0 left-full ml-4 w-56 bg-[var(--color-panel)] rounded-lg shadow-xl border border-[var(--color-border)] z-20 text-left overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <h4 className="font-bold text-sm text-white bg-[var(--color-sidebar)] px-3 py-1.5">{stage.name} Impacts</h4>
                    <div className="text-xs text-[var(--text-primary)] space-y-1.5 p-3">
                        <ImpactRow label="GWP" value={impacts.gwp} unit={report.impacts.gwp?.unit || ''} />
                        <ImpactRow label="Energy" value={impacts.energy} unit={report.impacts.energy?.unit || ''} />
                        <ImpactRow label="Water" value={impacts.water} unit={report.impacts.water?.unit || ''} />
                    </div>
                </div>
            )}
        </div>
    );
};

const Arrow: React.FC = () => (
    <div className="flex-1 flex items-center justify-center h-20 -mx-4">
        <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
        </svg>
    </div>
);

const ProcessLifecycleDiagram: React.FC<{ report: LcaReport }> = ({ report }) => {
    const stageImpacts = {
        'Raw Material': { gwp: (report.impacts.gwp?.value || 0) * 0.3, energy: (report.impacts.energy?.value || 0) * 0.4, water: (report.impacts.water?.value || 0) * 0.5 },
        'Processing': { gwp: (report.impacts.gwp?.value || 0) * 0.2, energy: (report.impacts.energy?.value || 0) * 0.3, water: (report.impacts.water?.value || 0) * 0.3 },
        'Manufacturing': { gwp: (report.impacts.gwp?.value || 0) * 0.25, energy: (report.impacts.energy?.value || 0) * 0.2, water: (report.impacts.water?.value || 0) * 0.1 },
        'Transport': { gwp: report.impacts.gwp?.stages?.find(s=>s.name.includes("Transport"))?.value || 0, energy: (report.impacts.energy?.value || 0) * 0.1, water: (report.impacts.water?.value || 0) * 0.1 },
        'Use Phase': { gwp: 0, energy: 0, water: 0 },
        'End of Life': { gwp: (report.impacts.gwp?.value || 0) * 0.05, energy: (report.impacts.energy?.value || 0) * 0.0, water: (report.impacts.water?.value || 0) * 0.0 },
    };

    return (
        <div className="w-full">
            <div className="text-center mb-6">
                <p className="text-sm text-[var(--text-secondary)]">Hover for details.</p>
            </div>
            <div className="overflow-x-auto pb-4">
                <div className="flex items-start justify-start min-w-[900px] px-4">
                    {stages.map((stage, index) => (
                        <React.Fragment key={stage.name}>
                            <StageNode stage={stage} impacts={stageImpacts[stage.name as keyof typeof stageImpacts]} report={report} />
                            {index < stages.length - 1 && <Arrow />}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProcessLifecycleDiagram;