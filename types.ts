// A centralised file for all TypeScript types used across the application.

import type * as React from 'react';

// --- USER & WORKSPACE TYPES ---
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  workspaceIds: string[];
}

export interface TeamMember {
  userId: string;
  name: string;
  initials: string;
  role: 'Owner' | 'Editor' | 'Viewer';
}

export interface Workspace {
  id:string;
  name: string;
  isPersonal: boolean;
  members: TeamMember[];
}

export type View = 'dashboard' | 'newStudy' | 'reports' | 'analysisReport' | 'compare' | 'admin' | 'teamWorkspace' | 'launcher';

export interface NavItem {
  key: string;
  name: string;
  view: View;
  icon: React.ElementType;
  roles: UserRole[];
}

// --- LCA REPORT & ANALYSIS TYPES ---
export type FuelType = 'Diesel' | 'Petrol' | 'Electric' | 'Marine Fuel' | 'Jet Fuel';
export type PowerSource = 'Grid' | 'Solar' | 'Wind' | 'Mixed Renewables';

export interface TransportationStage {
    id: number;
    name: string;
    mode: string;
    distance: number;
    fuelType: FuelType;
    powerSource?: PowerSource;
}

export interface LcaInputData {
  projectName: string;
  material: string;
  category: string;
  productionProcess: 'primary' | 'recycled';
  secondaryMaterialContent: number; // Percentage of recycled content
  alloyComplexity: 'simple' | 'complex';
  coatingsAndAdditives: 'none' | 'galvanized' | 'polymer';
  transportationStages: TransportationStage[];
  functionalUnit: string;
  usePhase: string;
  endOfLife: string;
  region: string;
  oreConcentration?: number;
  oreType?: string;
  // New extended inputs
  gridElectricityMix: string; // e.g., 'Coal-dominated', 'Renewable-heavy', 'National Average'
  processEnergyEfficiency: number; // in percentage
  waterSourceType: string; // 'Surface', 'Groundwater', 'Desalinated'
  wasteTreatmentMethod: string; // 'Incineration', 'Controlled Landfill', 'Open Dump'
  productLifetimeExtensionPotential: number; // in years
  // ISO 14044 Goal & Scope Fields
  intendedApplication: string;
  intendedAudience: string;
  isComparativeAssertion: boolean;
  systemBoundary: string[];
  limitations: string;
  // Data Quality Assessment (DQA) - ISO 14044 / Pedigree Matrix
  reliability: number; // Scale 1-5
  completeness: number; // Scale 1-5
  temporal: number; // Scale 1-5
  geographical: number; // Scale 1-5
  technological: number; // Scale 1-5
  // Calculated from DQA
  adqi: number; // Aggregated Data Quality Indicator
  uncertaintyDeviation: number; // in percentage, e.g., 10 for ±10%
}

export interface ImpactStage {
  name: string;
  value: number;
}

export interface EnergySource {
  name: string;
  value: number;
}

export interface ImpactResult {
  name: string;
  value: number;
  unit: string;
  confidenceInterval: [number, number];
  stages: ImpactStage[];
  sources?: EnergySource[];
  simulationResults?: number[];
}

export interface DetailedActionStep {
    id: string;
    title: string;
    description: string;
    impact: string;
    effort: 'Low' | 'Medium' | 'High';
    confidence: number;
}

export interface RecommendationItem {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  evidence: string;
  rootCause: string;
  actionSteps: DetailedActionStep[];
}

export interface AiActionPlan {
  overallSummary: string;
  recommendations: RecommendationItem[];
}

export interface AiComparisonConclusion {
    bestRoute: 'Primary' | 'Recycled';
    confidenceScore: number;
    rationale: string;
}

export interface PrimaryVsRecycled {
    primaryGwp: number;
    recycledGwp: number;
    gwpSavings: number;
    primaryEnergy: number;
    recycledEnergy: number;
    energySavings: number;
    primaryWater: number;
    recycledWater: number;
    waterSavings: number;
    primaryAcidification: number;
    recycledAcidification: number;
    acidificationSavings: number;
    primaryEutrophication: number;
    recycledEutrophication: number;
    eutrophicationSavings: number;
    primaryOdp: number;
    recycledOdp: number;
    odpSavings: number;
    aiComparisonConclusion: AiComparisonConclusion;
}

export interface LcaReport {
  id: string;
  title: string;
  author: string;
  authorId: string;
  workspaceId: string;
  createdAt: string;
  inputs: LcaInputData;
  impacts: {
    gwp: ImpactResult;
    energy: ImpactResult;
    water: ImpactResult;
    pm_formation: ImpactResult;
    acidification: ImpactResult;
    eutrophication: ImpactResult;
    odp: ImpactResult;
    // New detailed impacts
    pocp: ImpactResult;
    adp_elements: ImpactResult;
    adp_fossil: ImpactResult;
    human_toxicity_cancer: ImpactResult;
    human_toxicity_non_cancer: ImpactResult;
    ecotoxicity_freshwater: ImpactResult;
    ionizing_radiation: ImpactResult;
    land_use: ImpactResult;
  };
  circularityScore: number;
  circularityDetails: {
    recyclabilityRate: number;
    secondaryMaterialContent: number;
    recoveryEfficiency: number;
    // New circularity metrics
    reusePotential: { value: number; max: number };
    closedLoopRecyclingRate: number;
    materialRecoveryRate: number;
    endOfLifeFlows: {
        cru: number; // circular material use rate
        mfr: number; // material-specific recycling rate
        mer: number; // material recycling rate for EoL products
    };
    // From user image
    extendedProductLife: number; // As a percentage increase over baseline
    landfillRate: number; // Percentage
    energyRecoveryRate: number; // Percentage
  };
  supplyChainHotspots: {
    name: string;
    percentage: number;
    risk: 'High' | 'Medium' | 'Low';
  }[];
  aiActionPlan: AiActionPlan;
  primaryVsRecycled: PrimaryVsRecycled;
  lifeCycleInterpretation: string;
  qualityWarnings: string[];
  oreGradeWarning: string | null;
  oreGradeUsed: number | null;
  oreGradeSource: 'user_provided' | 'ai_estimated' | 'not_applicable' | null;
  comments: Comment[];
  activityLog: ActivityLogEntry[];
}

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorInitials: string;
    content: string;
    createdAt: string;
}

export interface ActivityLogEntry {
    id: string;
    actorId: string;
    actorName: string;
    action: string;
    target: string;
    timestamp: string;
}

export interface AiOptimizedProcess {
  gwp: { original: number; optimized: number };
  energy: { original: number; optimized: number };
  circularity: { original: number; optimized: number };
  recommendations: string[];
}

// --- FORM & UI STATE TYPES ---
export type DqaState = Pick<LcaInputData, 'reliability' | 'completeness' | 'temporal' | 'geographical' | 'technological'>;

export type FormTransportationStage = {
    id: number;
    name: string;
    mode: string;
    distance: string;
    fuelType: FuelType;
    powerSource?: PowerSource;
};

export type NewStudyFormState = Omit<LcaInputData, 'transportationStages' | 'processEnergyEfficiency' | 'productLifetimeExtensionPotential' | 'oreConcentration' | 'isComparativeAssertion' | 'systemBoundary' | keyof DqaState | 'adqi' | 'uncertaintyDeviation' | 'secondaryMaterialContent'> & {
    transportationStages: FormTransportationStage[];
    processEnergyEfficiency: string;
    productLifetimeExtensionPotential: string;
    oreConcentration: string;
    secondaryMaterialContent: string;
    oreType: string;
    isComparativeAssertion: boolean;
    systemBoundary: string;
};


// --- CHARTING & UI TYPES ---

export interface Metric {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  details: string[];
}

export interface ScenarioComparisonData {
  name: string;
  value: number;
}

export interface CircularityScoreData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// --- ADMIN & PLATFORM TYPES ---

export interface UploadHistoryEntry {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'Success' | 'Failed' | 'Warning';
  version: number;
  isActive: boolean;
  message: string;
}

export interface ModelTrainingLog {
  id: string;
  timestamp: string;
  event: string;
  status: 'Success' | 'Failed' | 'In Progress';
  details: string;
}

export interface GlobalDataSource {
  id: string;
  name: string;
  type: string;
  status: 'Connected' | 'Syncing' | 'Error';
  lastSync: string;
}

export interface PlatformAnalytics {
    // KPIs
    totalAnalyses: number;
    activeProjects: number;
    avgGwpSavings: number; // percentage
    topHotspot: { name: string; count: number };

    // Charts
    impactTrends: { month: string; reportsCount: number; avgGwp: number; avgCircularity: number }[];
    materialPerformance: { name: string; gwp: number; circularity: number, studyCount: number }[];
    crossUserHotspots: { name: string; value: number }[];
    productionProcessDistribution: { name: string; value: number }[];
    
    // New property
    isPreview?: boolean;
}


// --- PDF EXPORT TYPES ---

export interface ExportOptions {
    sections: {
        summary: boolean;
        goalAndScope: boolean;
        detailedAnalysis: boolean;
        circularity: boolean;
        interpretation: boolean;
        appendices: boolean;
    };
    dateRange: {
        start: string | null;
        end: string | null;
    };
}