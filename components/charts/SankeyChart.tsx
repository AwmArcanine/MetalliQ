import React, { useMemo } from 'react';
import { ResponsiveContainer, Sankey, Tooltip, Rectangle } from 'recharts';
import type { LcaReport } from '../../types';

interface SankeyChartProps {
    report: LcaReport;
}

const parseFunctionalUnit = (unitString: string): { value: number; unit: string } => {
    const match = unitString.toLowerCase().match(/([0-9.]+)\s*(ton|tonne|kg)/);
    if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2];
        if (unit === 'ton' || unit === 'tonne') {
            return { value: value * 1000, unit: 'kg' };
        }
        return { value, unit: 'kg' };
    }
    return { value: 1000, unit: 'kg' }; // Default to 1 ton if parsing fails
};

const generateSankeyData = (report: LcaReport) => {
    const { value: functionalUnitMass } = parseFunctionalUnit(report.inputs.functionalUnit);
    const secondaryContentRatio = report.inputs.secondaryMaterialContent / 100;

    // --- Inputs ---
    const recycledInputMass = functionalUnitMass * secondaryContentRatio;
    const virginInputMass = functionalUnitMass * (1 - secondaryContentRatio);

    // --- Manufacturing ---
    const productionLossMass = functionalUnitMass * 0.05; // Assumption: 5% loss not detailed in report
    const productMass = functionalUnitMass - productionLossMass;

    // --- End of Life ---
    const eolRecyclingPercentage = report.circularityDetails.recyclabilityRate / 100;
    const toRecyclingCollectionMass = productMass * eolRecyclingPercentage;
    const toWasteFromCollectionMass = productMass * (1 - eolRecyclingPercentage);

    // --- Recycling Process ---
    const recoveryEfficiency = report.circularityDetails.recoveryEfficiency / 100;
    const recoveredMass = toRecyclingCollectionMass * recoveryEfficiency;
    const recyclingLossMass = toRecyclingCollectionMass * (1 - recoveryEfficiency);
    
    const nodes = [
        { name: 'Virgin Input' },         // 0
        { name: 'Recycled Input' },        // 1
        { name: 'Manufacturing' },         // 2
        { name: 'Product in Use' },        // 3
        { name: 'End-of-Life Collection' }, // 4
        { name: 'Recycling Process' },     // 5
        { name: 'Recovered Material' },    // 6 (Good Output)
        { name: 'Waste (Landfill)' },      // 7 (Bad Output Sink)
    ];

    const links = [
        // Input Phase
        { source: 0, target: 2, value: virginInputMass },
        { source: 1, target: 2, value: recycledInputMass },
        // Manufacturing Phase
        { source: 2, target: 3, value: productMass },
        { source: 2, target: 7, value: productionLossMass, label: 'Production Loss' },
        // Use Phase
        { source: 3, target: 4, value: productMass },
        // End-of-Life Phase
        { source: 4, target: 5, value: toRecyclingCollectionMass },
        { source: 4, target: 7, value: toWasteFromCollectionMass, label: 'Collection Loss' },
        // Recycling Phase
        { source: 5, target: 6, value: recoveredMass },
        { source: 5, target: 7, value: recyclingLossMass, label: 'Recycling Loss' },
    ];
    
    // Filter out zero-value links and any nodes that become unused
    const validLinks = links.filter(link => link.value > 0.1);
    
    const usedNodeIndices = new Set<number>();
    validLinks.forEach(link => {
        usedNodeIndices.add(link.source);
        usedNodeIndices.add(link.target);
    });
    
    const validNodes = nodes.filter((_, index) => usedNodeIndices.has(index));
    
    // Re-index links to match the filtered nodes
    const reindexedLinks = validLinks.map(link => ({
        ...link,
        source: validNodes.findIndex(n => n.name === nodes[link.source].name),
        target: validNodes.findIndex(n => n.name === nodes[link.target].name),
    }));

    return {
        nodes: validNodes,
        links: reindexedLinks,
    };
};

const CustomSankeyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const linkPayload = payload[0].payload; // This contains the link object
        const sourceName = linkPayload.source.name;
        const targetName = linkPayload.target.name;
        const value = linkPayload.value;
        const label = linkPayload.payload.label; // The custom label for losses

        const flowDescription = label ? `(${label})` : '';

        return (
            <div className="p-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-md shadow-lg text-sm">
                <p className="font-bold mb-1">{`${sourceName} → ${targetName} ${flowDescription}`}</p>
                <p>{value.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg</p>
            </div>
        );
    }
    return null;
};

const SankeyNode = (props: any) => {
    const { x, y, width, height, payload, containerWidth } = props;
    const name = payload.name;
    const nodeColors: { [key: string]: string } = {
      'Virgin Input': 'var(--color-chart-warning)',
      'Recycled Input': 'var(--color-chart-positive)',
      'Manufacturing': 'var(--color-brand-primary)',
      'Product in Use': 'var(--color-brand-primary)',
      'End-of-Life Collection': 'var(--color-brand-secondary)',
      'Recycling Process': 'var(--color-brand-secondary)',
      'Recovered Material': 'var(--color-chart-positive)',
      'Waste (Landfill)': 'var(--color-chart-negative)',
    };
    const fill = nodeColors[name] || 'var(--color-brand-accent)';
    const isRightSide = x > containerWidth / 2;

    return (
        <g>
            <Rectangle {...props} fill={fill} stroke="var(--color-border)" strokeWidth="1" />
            <text
                x={isRightSide ? x - 6 : x + width + 6}
                y={y + height / 2}
                textAnchor={isRightSide ? "end" : "start"}
                dominantBaseline="middle"
                style={{ fill: 'var(--text-primary)', fontSize: '12px', fontWeight: '500' }}
            >
                {name}
            </text>
        </g>
    );
};


const SankeyChart: React.FC<SankeyChartProps> = ({ report }) => {
  const data = useMemo(() => generateSankeyData(report), [report]);

  return (
    <div className="relative">
        <div className="absolute top-0 left-4 text-sm z-10">
            <p className="font-semibold text-[var(--text-primary)]">Material Flow: {report.inputs.material}</p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
            <Sankey
                data={data}
                nodePadding={35}
                margin={{ left: 120, right: 120, top: 20, bottom: 20 }}
                link={{ stroke: 'var(--color-brand-accent)', strokeOpacity: 0.5 }}
                node={<SankeyNode />}
            >
                <Tooltip content={<CustomSankeyTooltip />} />
            </Sankey>
        </ResponsiveContainer>
    </div>
  );
};

export default SankeyChart;