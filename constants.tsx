
import React from 'react';
import type { User, Workspace, LcaReport, NavItem, UploadHistoryEntry, ModelTrainingLog, GlobalDataSource } from './types';

// --- ICONS (as React Components for easy styling) ---
const createIcon = (path: React.ReactNode): React.FC<React.SVGProps<SVGSVGElement>> => (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {path}
  </svg>
);

import { createIcon } from 'your-icon-library'; // Replace with your actual import

export const ChevronDoubleLeftIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
  </>
);

export const UsersIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.024A5.979 5.979 0 0112 15a5.979 5.979 0 013.473-1.003m-4.473-6.235a3 3 0 10-6 0 3 3 0 006 0zM12 12.75a5.25 5.25 0 00-5.25 5.25v.228a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-.228A5.25 5.25 0 0012 12.75zM12 6a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </>
);

export const HomeIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </>
);

export const PlusCircleIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </>
);

export const DocumentTextIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </>
);

export const ScaleIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-6.866-1.785m-2.881-2.023l-5.234-2.181a1.125 1.125 0 01-.106-1.956L12 3z" />
  </>
);

export const Cog6ToothIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0l-1.48-1.48m1.48 1.48l-1.48 1.48m15-1.48l1.48-1.48m-1.48 1.48l1.48 1.48M12 6.75v-1.5m0 15v-1.5m-2.9-10.38l-1.02-1.02m1.02 1.02l-1.02 1.02m5.8 0l1.02-1.02m-1.02 1.02l1.02 1.02m0 5.8l-1.02 1.02m1.02-1.02l-1.02-1.02M12 15a3 3 0 100-6 3 3 0 000 6z" />
  </>
);

export const ShieldCheckIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
  </>
);

export const RecycleIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691V5.006h4.992a2.25 2.25 0 012.25 2.25v4.992M2.985 19.644l3.181-3.182m0 0l-3.181 3.183m3.181-3.182l4.992 4.992m-4.993-4.992l3.181 3.183" />
  </>
);

export const SparklesIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.25 21.75l-.648-1.178a3.375 3.375 0 00-2.456-2.456L12 17.25l1.178-.648a3.375 3.375 0 002.456-2.456L16.25 13.5l.648 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.648a3.375 3.375 0 00-2.456 2.456z" />
  </>
);

export const BrainIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.25 21.75l-.648-1.178a3.375 3.375 0 00-2.456-2.456L12 17.25l1.178-.648a3.375 3.375 0 002.456-2.456L16.25 13.5l.648 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.648a3.375 3.375 0 00-2.456 2.456z" />
  </>
);

export const ArrowUpTrayIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </>
);

export const ArrowUturnLeftIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </>
);

export const ExclamationTriangleIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </>
);

export const CheckCircleIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </>
);

export const CircleStackIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
  </>
);

export const CpuChipIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m1.5-4.5V21m6-18v1.5m0 15V21m3.75-18v1.5M12 21v-1.5m3.75 0V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
  </>
);

export const PresentationChartLineIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 14.25v-1.5a3.375 3.375 0 013.375-3.375h1.5a1.125 1.125 0 011.125 1.125v-1.5A3.375 3.375 0 0113.5 6h1.5a1.125 1.125 0 011.125 1.125v1.5m0 0v1.5m0-1.5a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0013.5 7.5v1.5m-3 4.5v.75A.75.75 0 019 13.5h-.75a.75.75 0 01-.75-.75v-.75m3 4.5h.75a.75.75 0 00.75-.75v-.75a.75.75 0 00-.75-.75h-.75V12m-3 4.5v-3m0 3h.75a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75h-.75m-3 4.5v-3.75m0 3.75h.75a.75.75 0 00.75-.75v-2.25a.75.75 0 00-.75-.75h-.75M3 12h18M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
  </>
);

export const ChatBubbleLeftRightIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.534a1.125 1.125 0 01-1.087-.995l-.218-1.363a1.125 1.125 0 00-.92-1.044l-1.022-.153a1.125 1.125 0 01-.894-1.455l.213-.572a1.125 1.125 0 011.087-.995l3.722-.534a1.125 1.125 0 00.92-1.044l.218-1.363a1.125 1.125 0 011.087-.995l1.022.153a1.125 1.125 0 01.894 1.455l-.213.572a1.125 1.125 0 00-.92 1.044l-3.722.534a1.125 1.125 0 01-1.087-.995l-.218-1.363a1.125 1.125 0 00-.92-1.044l-1.022-.153a1.125 1.125 0 01-.894-1.455l.213-.572A1.125 1.125 0 016.928 4.5l3.722-.534a1.125 1.125 0 00.92-1.044l.218-1.363a1.125 1.125 0 011.087-.995l1.022.153a1.125 1.125 0 01.894 1.455l-.213.572a1.125 1.125 0 00-.92 1.044l-3.722.534a1.125 1.125 0 01-1.087-.995l-.218-1.363a1.125 1.125 0 00-.92-1.044l-1.022-.153a1.125 1.125 0 01-.894-1.455l.213-.572A1.125 1.125 0 016.928 4.5l3.722-.534a1.125 1.125 0 00.92-1.044l.218-1.363zM12.028 15.652l.218 1.363a1.125 1.125 0 01-1.087.995l-3.722.534a1.125 1.125 0 01-1.087-.995l-.218-1.363a1.125 1.125 0 00-.92-1.044l-1.022-.153a1.125 1.125 0 01-.894-1.455l.213-.572A1.125 1.125 0 013.928 9.5l3.722-.534a1.125 1.125 0 00.92-1.044l.218-1.363a1.125 1.125 0 011.087-.995l1.022.153a1.125 1.125 0 01.894 1.455l-.213.572a1.125 1.125 0 00-.92 1.044l-3.722.534a1.125 1.125 0 01-1.087.995l-.218 1.363z" />
  </>
);

export const ArrowTrendingUpIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-3.94.886M21 3l.886-3.94" />
  </>
);

export const GlobeAltIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z" />
  </>
);

export const ChartPieIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5z" />
  </>
);

export const ShareIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 1 0 0-2.186m0 2.186c-.18.324-.283.696-.283 1.093s.103.77.283 1.093m0-2.186V10.907" />
  </>
);

export const DocumentArrowDownIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </>
);

export const InformationCircleIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
  </>
);

export const MagnifyingGlassIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
  </>
);

export const ClipboardDocumentCheckIcon = createIcon(
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" />
  </>
);

// --- EXPANDED METALS LIST ---
export const ALL_METALS = [
    "Aluminum (Al)", "Antimony (Sb)", "Barium (Ba)", "Beryllium (Be)", "Bismuth (Bi)", "Boron (B)", 
    "Cadmium (Cd)", "Calcium (Ca)", "Chromium (Cr)", "Cobalt (Co)", "Copper (Cu)", "Dysprosium (Dy)", 
    "Erbium (Er)", "Europium (Eu)", "Gallium (Ga)", "Germanium (Ge)", "Gold (Au)", "Hafnium (Hf)", 
    "Holmium (Ho)", "Indium (In)", "Iridium (Ir)", "Iron (Fe)", "Lanthanum (La)", "Lead (Pb)", 
    "Lithium (Li)", "Lutetium (Lu)", "Magnesium (Mg)", "Manganese (Mn)", "Mercury (Hg)", "Molybdenum (Mo)", 
    "Neodymium (Nd)", "Nickel (Ni)", "Niobium (Nb)", "Osmium (Os)", "Palladium (Pd)", "Platinum (Pt)", 
    "Potassium (K)", "Praseodymium (Pr)", "Rhenium (Re)", "Rhodium (Rh)", "Rubidium (Rb)", "Ruthenium (Ru)", 
    "Samarium (Sm)", "Scandium (Sc)", "Selenium (Se)", "Silver (Ag)", "Sodium (Na)", "Strontium (Sr)", 
    "Sulfur (S)", "Tantalum (Ta)", "Terbium (Tb)", "Thallium (Tl)", "Thorium (Th)", "Thulium (Tm)", 
    "Tin (Sn)", "Titanium (Ti)", "Tungsten (W)", "Uranium (U)", "Vanadium (V)", "Ytterbium (Yb)", 
    "Yttrium (Y)", "Zinc (Zn)", "Zirconium (Zr)", 
    "Steel", "Cement", "Polymers (PET)", "Composites (CFRP)", "Solar PV Panel", "Wind Turbine Blade"
].sort();


// --- MOCK DATA ---
export const MOCK_USER_JOHN: User = {
  id: 'user_1',
  name: 'John Doe',
  initials: 'JD',
  role: 'user',
  workspaceIds: ['ws_personal_1', 'ws_team_1'],
};

export const MOCK_ADMIN_SARAH: User = {
  id: 'admin_1',
  name: 'Sarah Singh',
  initials: 'SS',
  role: 'admin',
  workspaceIds: ['ws_personal_2', 'ws_team_1', 'ws_team_2'],
};

export const MOCK_WORKSPACES: Workspace[] = [
  { id: 'ws_personal_1', name: "John's Workspace", isPersonal: true, members: [{userId: 'user_1', name: 'John Doe', initials: 'JD', role: 'Owner'}] },
  { id: 'ws_personal_2', name: "Sarah's Workspace", isPersonal: true, members: [{userId: 'admin_1', name: 'Sarah Singh', initials: 'SS', role: 'Owner'}] },
  { 
    id: 'ws_team_1', 
    name: 'Project Phoenix', 
    isPersonal: false, 
    members: [
      {userId: 'user_1', name: 'John Doe', initials: 'JD', role: 'Editor'},
      {userId: 'admin_1', name: 'Sarah Singh', initials: 'SS', role: 'Owner'},
      {userId: 'user_2', name: 'Emily White', initials: 'EW', role: 'Viewer'}
    ]
  },
  { id: 'ws_team_2', name: 'Project Cerberus', isPersonal: false, members: [{userId: 'admin_1', name: 'Sarah Singh', initials: 'SS', role: 'Owner'}] }
];

// Simplified mock report generator
const createMockReport = (id: number, workspaceId: string, author: User, overrides: Partial<LcaReport['inputs']>): LcaReport => {
  const secondaryContent = overrides.secondaryMaterialContent ?? (overrides.productionProcess === 'primary' ? 10 : 90);
  const primaryRatio = 1 - (secondaryContent / 100);
  const secondaryRatio = secondaryContent / 100;
  
  const gwp = (2008 * primaryRatio) + (642 * secondaryRatio);
  const energy = (28.6 * primaryRatio) + (6.0 * secondaryRatio); // GJ
  const water = (5 * primaryRatio) + (2 * secondaryRatio); // m3
  
  const recyclability = parseFloat(overrides.endOfLife?.match(/\d+/)?.[0] ?? '85');
  
  const createMockImpact = (name: string, value: number, unit: string) => ({
      name, value, unit,
      confidenceInterval: [value * 0.85, value * 1.15] as [number, number],
      stages: [{name:'Production', value: value * 0.9}, {name:'Transport', value: value * 0.1}],
      simulationResults: Array.from({length: 1000}, () => value * (Math.random() * 0.2 + 0.9))
  });

  let oreGradeWarning: string | null = null;
  let oreGradeUsed: number | null = null;
  let oreGradeSource: LcaReport['oreGradeSource'] = null;

  if (overrides.productionProcess === 'primary' && ['Copper (Cu)', 'Steel', 'Aluminum (Al)'].includes(overrides.material || '')) {
      if (overrides.oreConcentration) {
          oreGradeUsed = overrides.oreConcentration;
          oreGradeSource = 'user_provided';
          if (overrides.material === 'Copper (Cu)' && overrides.oreConcentration < 1.0) {
               oreGradeWarning = `Low ore concentration (${overrides.oreConcentration}%) has been used, leading to higher calculated impacts for extraction and processing stages.`;
          }
      } else {
          oreGradeUsed = overrides.material === 'Copper (Cu)' ? 0.8 : (overrides.material === 'Steel' ? 45 : 30);
          oreGradeSource = 'ai_estimated';
      }
  } else {
      oreGradeSource = 'not_applicable';
  }

  const primaryGwp = 2008;
  const recycledGwp = 642;
  const primaryEnergy = 28.6; // GJ
  const recycledEnergy = 6.0; // GJ
  const primaryWater = 5; // m3
  const recycledWater = 2; // m3

  const createComparisonImpacts = (baseGwp: number) => ({
      Acidification: baseGwp / 500,
      Eutrophication: baseGwp / 2000,
      Odp: baseGwp / 1e6,
  });

  const primaryOtherImpacts = createComparisonImpacts(primaryGwp);
  const recycledOtherImpacts = createComparisonImpacts(recycledGwp);

  const calculateSavings = (primary: number, recycled: number) => {
      if (primary === 0) return 0;
      return ((primary - recycled) / primary) * 100;
  };

  const primaryVsRecycled = {
      primaryGwp,
      recycledGwp,
      gwpSavings: calculateSavings(primaryGwp, recycledGwp),
      primaryEnergy,
      recycledEnergy,
      energySavings: calculateSavings(primaryEnergy, recycledEnergy),
      primaryWater,
      recycledWater,
      waterSavings: calculateSavings(primaryWater, recycledWater),
      primaryAcidification: primaryOtherImpacts.Acidification,
      recycledAcidification: recycledOtherImpacts.Acidification,
      acidificationSavings: calculateSavings(primaryOtherImpacts.Acidification, recycledOtherImpacts.Acidification),
      primaryEutrophication: primaryOtherImpacts.Eutrophication,
      recycledEutrophication: recycledOtherImpacts.Eutrophication,
      eutrophicationSavings: calculateSavings(primaryOtherImpacts.Eutrophication, recycledOtherImpacts.Eutrophication),
      primaryOdp: primaryOtherImpacts.Odp,
      recycledOdp: recycledOtherImpacts.Odp,
      odpSavings: calculateSavings(primaryOtherImpacts.Odp, recycledOtherImpacts.Odp),
      aiComparisonConclusion: {
          bestRoute: recycledGwp < primaryGwp ? 'Recycled' as const : 'Primary' as const,
          confidenceScore: 95,
          rationale: 'The recycled route demonstrates significantly lower impacts across key categories, primarily due to avoiding energy-intensive virgin material extraction.'
      }
  };


  return {
    id: `rep_${id}`,
    title: `${overrides.material} for ${overrides.projectName}`,
    author: author.name,
    authorId: author.id,
    workspaceId: workspaceId,
    createdAt: new Date().toISOString(),
    inputs: {
      projectName: 'Skyscraper Frame',
      material: 'Steel',
      category: 'Structural',
      productionProcess: 'primary',
      secondaryMaterialContent: 10,
      alloyComplexity: 'simple',
      coatingsAndAdditives: 'none',
      transportationStages: [
        { id: 1, name: 'Raw Material Transport', mode: 'Truck', distance: 500, fuelType: 'Diesel' },
        { id: 2, name: 'Product Distribution', mode: 'Train', distance: 750, fuelType: 'Diesel' }
      ],
      functionalUnit: '1 ton of product',
      usePhase: '75 years',
      endOfLife: '90% Recycled',
      region: 'India - Eastern Region (Jha, Cht)',
      gridElectricityMix: 'National Average',
      processEnergyEfficiency: 85,
      waterSourceType: 'Surface',
      wasteTreatmentMethod: 'Controlled Landfill',
      productLifetimeExtensionPotential: 10,
      intendedApplication: 'Screening-level analysis for internal decision making.',
      intendedAudience: 'Internal R&D and sustainability teams.',
      isComparativeAssertion: false,
      systemBoundary: ['Cradle-to-Grave'],
      limitations: 'This is a screening-level LCA based on industry-average data and should not be used for external marketing claims without a critical review.',
      reliability: 5, completeness: 5, temporal: 5, geographical: 5, technological: 5,
      adqi: 5.0, uncertaintyDeviation: 10,
      ...overrides,
    },
    impacts: {
      gwp: { name: 'Global Warming Potential', value: gwp, unit: 'kg CO₂-eq', confidenceInterval: [gwp * 0.9, gwp * 1.1], stages: [{name:'Production', value: gwp * 0.9}, {name:'Transport', value: gwp * 0.1}], simulationResults: Array.from({length: 1000}, () => gwp * (Math.random() * 0.2 + 0.9)) },
      energy: { name: 'Energy Demand', value: energy * 1000, unit: 'MJ', confidenceInterval: [energy*1000 * 0.85, energy*1000 * 1.15], stages: [{name:'Extraction', value: energy*1000 * 0.5}, {name: 'Processing', value: energy*1000 * 0.4}, {name:'Transport', value: energy*1000 * 0.1}], sources: [{name: 'Coal', value: energy*1000*0.6}, {name:'Grid', value: energy*1000*0.4}] },
      water: { name: 'Water Consumption', value: water, unit: 'm³', confidenceInterval: [water * 0.8, water * 1.2], stages: [{name:'Extraction', value: water * 0.7}, {name: 'Processing', value: water * 0.3}] },
      acidification: createMockImpact('Acidification Potential', gwp / 500, 'kg SO₂-eq'),
      eutrophication: createMockImpact('Eutrophication Potential', gwp / 2000, 'kg PO₄-eq'),
      odp: createMockImpact('Ozone Depletion Potential', gwp / 1e6, 'kg CFC-11 eq'),
      pocp: createMockImpact('Photochemical Ozone Creation', gwp / 1000, 'kg NMVOC-eq'),
      adp_elements: createMockImpact('Abiotic Depletion (Elements)', gwp / 2e5, 'kg Sb-eq'),
      adp_fossil: createMockImpact('Abiotic Depletion (Fossil)', energy * 1.1, 'MJ'),
      human_toxicity_cancer: createMockImpact('Human Toxicity (Cancer)', gwp / 1e4, 'CTUh'),
      human_toxicity_non_cancer: createMockImpact('Human Toxicity (Non-Cancer)', gwp / 1e3, 'CTUh'),
      ecotoxicity_freshwater: createMockImpact('Freshwater Ecotoxicity', gwp / 1e2, 'CTUe'),
      pm_formation: createMockImpact('Particulate Matter Formation', gwp / 3000, 'kg PM2.5-eq'),
      ionizing_radiation: createMockImpact('Ionizing Radiation', gwp / 5e5, 'kBq U235-eq'),
      land_use: createMockImpact('Land Use', gwp / 10, 'm²·year'),
    },
    circularityScore: Math.round((recyclability + secondaryContent) / 2),
    circularityDetails: {
      recyclabilityRate: recyclability,
      recoveryEfficiency: 95,
      secondaryMaterialContent: secondaryContent,
      reusePotential: { value: 45, max: 50 },
      closedLoopRecyclingRate: 80,
      materialRecoveryRate: 95,
      extendedProductLife: 120,
      landfillRate: 5,
      energyRecoveryRate: 0,
      endOfLifeFlows: { cru: 45, mfr: 85, mer: 80 },
    },
    supplyChainHotspots: [
      { name: 'Raw Material Extraction', percentage: 60 + Math.random() * 10, risk: 'High' },
      { name: 'Smelting Process', percentage: 30 - Math.random() * 5, risk: 'Medium' }
    ],
    aiActionPlan: {
      overallSummary: 'The use of virgin materials is the largest contributor to this product\'s carbon footprint.',
      recommendations: [{
        id: 'rec_1',
        title: 'High GWP from Primary Production Route',
        priority: 'High',
        evidence: `The 'Production' stage contributes ${(gwp*0.9).toFixed(0)} kg CO₂-eq, representing the vast majority of the total GWP.`,
        rootCause: 'Reliance on energy-intensive extraction and processing of virgin raw materials.',
        actionSteps: [
          {
            id: 'step_1',
            title: 'Step 1: Conduct a Scrap Supplier Audit',
            description: 'Partner with procurement to evaluate and qualify new scrap suppliers who can provide certified, high-purity scrap and offer transparent material traceability.',
            impact: 'Prerequisite for GWP reduction. Reduces risk of production defects.',
            effort: 'Medium',
            confidence: 95
          }
        ]
      }]
    },
    primaryVsRecycled,
    lifeCycleInterpretation: 'The analysis clearly identifies GWP from the primary production of ' + overrides.material + ' as the most significant environmental impact...',
    qualityWarnings: [],
    oreGradeWarning,
    oreGradeUsed,
    oreGradeSource,
    comments: [],
    activityLog: [{id:'act_1', actorId: author.id, actorName: author.name, action: 'created the report', target: 'Initial analysis', timestamp: new Date().toISOString() }],
  };
};

const INITIAL_MOCK_REPORTS: LcaReport[] = [
  createMockReport(1, 'ws_personal_1', MOCK_USER_JOHN, { projectName: 'Residential Building', material: 'Steel', productionProcess: 'primary', category: 'Structural', secondaryMaterialContent: 10 }),
  createMockReport(2, 'ws_team_1', MOCK_USER_JOHN, { projectName: 'Automotive Chassis', material: 'Aluminum (Al)', productionProcess: 'primary', category: 'Automotive', secondaryMaterialContent: 15 }),
  createMockReport(3, 'ws_team_1', MOCK_ADMIN_SARAH, { projectName: 'Automotive Chassis (Recycled)', material: 'Aluminum (Al)', productionProcess: 'recycled', category: 'Automotive', secondaryMaterialContent: 95 }),
  createMockReport(4, 'ws_personal_2', MOCK_ADMIN_SARAH, { projectName: 'Copper Wiring', material: 'Copper (Cu)', productionProcess: 'primary', category: 'General Purpose', oreConcentration: 0.5, secondaryMaterialContent: 5 }),
  createMockReport(5, 'ws_team_1', MOCK_USER_JOHN, { projectName: 'Packaging Film', material: 'Polymers (PET)', productionProcess: 'primary', category: 'Packaging', secondaryMaterialContent: 25 }),
  createMockReport(6, 'ws_team_1', MOCK_USER_JOHN, { projectName: 'EcoBuild 2.0', material: 'Steel', productionProcess: 'recycled', category: 'Structural', secondaryMaterialContent: 85 }),
  createMockReport(7, 'ws_team_1', MOCK_ADMIN_SARAH, { projectName: 'GreenTech Pilot', material: 'Copper (Cu)', productionProcess: 'recycled', category: 'Electronics', secondaryMaterialContent: 98 })
];

const generateLargeMockData = (count: number): LcaReport[] => {
    const additionalReports: LcaReport[] = [];
    const materials = ALL_METALS;
    const projects = ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta', 'Project Epsilon'];
    const users = [MOCK_USER_JOHN, MOCK_ADMIN_SARAH];
    const workspaces = ['ws_team_1', 'ws_team_2', 'ws_personal_1', 'ws_personal_2'];

    for (let i = 0; i < count; i++) {
        const material = materials[i % materials.length];
        const project = projects[i % projects.length];
        const user = users[i % users.length];
        const workspace = workspaces[i % workspaces.length];
        const process = Math.random() > 0.5 ? 'primary' : 'recycled';
        const id = INITIAL_MOCK_REPORTS.length + i + 1;
        
        const date = new Date();
        date.setDate(date.getDate() - (i % 365));

        const report = createMockReport(id, workspace, user, {
            projectName: project,
            material: material,
            productionProcess: process as 'primary' | 'recycled',
            secondaryMaterialContent: process === 'primary' ? 10 + Math.random() * 15 : 80 + Math.random() * 15,
            category: 'General Purpose'
        });
        report.createdAt = date.toISOString();
        additionalReports.push(report);
    }
    return additionalReports;
};

export const MOCK_REPORTS: LcaReport[] = [
    ...INITIAL_MOCK_REPORTS,
    ...generateLargeMockData(500)
];

// --- FACTORS for CALCULATIONS ---
export const ALLOY_FACTORS = {
  simple: { recyclability_penalty: 0 },
  complex: { recyclability_penalty: 10 },
};

export const COATING_FACTORS = {
  none: { recyclability_penalty: 0 },
  galvanized: { recyclability_penalty: 5 },
  polymer: { recyclability_penalty: 15 },
};

// --- ADMIN MOCK DATA ---
export const MOCK_UPLOAD_HISTORY: UploadHistoryEntry[] = [
    { id: 'uh_1', fileName: 'ecoinvent_v3.8.json', uploadDate: '2023-10-15', status: 'Success', version: 2, isActive: true, message: 'Database updated successfully.' },
    { id: 'uh_2', fileName: 'internal_steel_data.csv', uploadDate: '2023-09-20', status: 'Success', version: 1, isActive: false, message: 'Initial dataset.' }
];

export const MOCK_MODEL_HISTORY: ModelTrainingLog[] = [
    { id: 'mh_1', timestamp: '2023-10-15 10:00 UTC', event: 'Retraining Cycle', status: 'Success', details: 'Accuracy improved to 96.5%. New data from ecoinvent_v3.8 incorporated.' },
    { id: 'mh_2', timestamp: '2023-09-01 14:30 UTC', event: 'Initial Model Training', status: 'Success', details: 'Baseline model trained with 94.2% accuracy.' }
];

export const MOCK_GLOBAL_DATA_SOURCES: GlobalDataSource[] = [
    { id: 'ds_1', name: 'Ecoinvent API', type: 'LCI Database', status: 'Connected', lastSync: '2023-10-15' },
    { id: 'ds_2', name: 'World Steel Association', type: 'Industry Data', status: 'Connected', lastSync: '2023-10-14' },
    { id: 'ds_3', name: 'IEA Energy Stats', type: 'Energy Grid Mix', status: 'Syncing', lastSync: '2023-10-13' }
];
