
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import NewStudy from './components/NewStudy';
import Reports from './components/Reports';
import { AnalysisReport } from './components/AnalysisReport';
import { Compare } from './components/Compare';
import { Admin } from './components/Admin';
import TeamWorkspace from './components/TeamWorkspace';
import AIAssistant from './components/ui/AIAssistant';
import ConfirmationModal from './components/ui/ConfirmationModal';
import Launcher from './components/Launcher';
import type { LcaReport, User, View, Workspace, NewStudyFormState } from './types';
import { MOCK_REPORTS, MOCK_WORKSPACES } from './constants';

const initialNewStudyFormData: NewStudyFormState = {
    // Corrected sequence based on video
    intendedApplication: 'Screening assessment for internal R&D purposes to compare material choices.',
    intendedAudience: 'Internal engineering and sustainability departments.',
    systemBoundary: 'Cradle-to-Grave',
    isComparativeAssertion: false,
    limitations: 'This analysis relies on industry-average data and does not include site-specific emissions. Results are for directional guidance only.',
    
    projectName: 'New Building Frame',
    material: 'Steel',
    category: 'Structural',
    region: 'India - Jharkhand (Singhbhum)',
    oreConcentration: '60',
    oreType: 'Hematite',
    alloyComplexity: 'simple',
    coatingsAndAdditives: 'none',

    functionalUnit: '1 ton of product',
    productionProcess: 'primary',
    secondaryMaterialContent: '10',
    usePhase: '75 years',
    endOfLife: '90% Recycled',

    transportationStages: [
        { id: 1, name: 'Mine to Concentrator', mode: 'Truck', distance: '50', fuelType: 'Diesel' },
        { id: 2, name: 'Concentrator to Plant', mode: 'Train', distance: '200', fuelType: 'Diesel' },
    ],
    
    gridElectricityMix: 'India - Eastern Region (Coal Heavy)',
    waterSourceType: 'Surface',
    processEnergyEfficiency: '85',
    wasteTreatmentMethod: 'Controlled Landfill',
    productLifetimeExtensionPotential: '10'
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('launcher');
  const [currentReport, setCurrentReport] = useState<LcaReport | null>(null);
  const [allReports, setAllReports] = useState<LcaReport[]>(MOCK_REPORTS);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [reportViewSource, setReportViewSource] = useState<View>('dashboard');
  const [reportToDelete, setReportToDelete] = useState<LcaReport | null>(null);
  const [newStudyFormData, setNewStudyFormData] = useState<NewStudyFormState>(initialNewStudyFormData);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpenOnMobile, setIsSidebarOpenOnMobile] = useState(false);
  
  useEffect(() => {
    if ((window as any).pdfMake) {
        (window as any).pdfMake.fonts = {
            Roboto: {
              normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
              bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
              italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
              bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
            }
        };
    }
    
    const handleResize = () => {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        if (!mobile) {
            setIsSidebarOpenOnMobile(false); // Close mobile overlay when resizing to desktop
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const userWorkspaces = MOCK_WORKSPACES.filter(w => user.workspaceIds.includes(w.id));
    const personalWorkspace = userWorkspaces.find(w => w.isPersonal);
    setSelectedWorkspaceId(personalWorkspace?.id || user.workspaceIds[0]);
    setCurrentView('launcher');
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentReport(null);
    setSelectedWorkspaceId(null);
  }

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };
  
  const handleSelectWorkspace = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setCurrentView('dashboard');
  };
  
  const handleRunAnalysis = (report: LcaReport) => {
    setAllReports(prev => [report, ...prev]);
    setCurrentReport(report);
    setReportViewSource('reports');
    setCurrentView('analysisReport');
    // Reset form after successful analysis
    setNewStudyFormData(initialNewStudyFormData);
  };

  const handleViewReport = (report: LcaReport, source: View = 'reports') => {
    setCurrentReport(report);
    setReportViewSource(source);
    setCurrentView('analysisReport');
  };
  
  const handleBackToPreviousView = () => {
      setCurrentView(reportViewSource);
  }

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpenOnMobile(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  };
  
  const handleNavigateAndCloseMobileSidebar = (view: View) => {
    handleNavigate(view);
    if(isMobile) setIsSidebarOpenOnMobile(false);
  }

  const handleSelectWorkspaceAndCloseMobileSidebar = (workspaceId: string) => {
      handleSelectWorkspace(workspaceId);
      if(isMobile) setIsSidebarOpenOnMobile(false);
  }
  
  const { userWorkspaces, selectedWorkspace, displayedReports } = useMemo(() => {
    if (!currentUser) return { userWorkspaces: [], selectedWorkspace: null, displayedReports: [] };
    const userWorkspaces = workspaces.filter(w => currentUser.workspaceIds.includes(w.id));
    const selectedWorkspace = userWorkspaces.find(w => w.id === selectedWorkspaceId) || null;
    const displayedReports = allReports.filter(report => report.workspaceId === selectedWorkspaceId);
    return { userWorkspaces, selectedWorkspace, displayedReports };
  }, [currentUser, workspaces, selectedWorkspaceId, allReports]);
  
  const handleUpdateReport = (updatedReport: LcaReport) => {
      setAllReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
      if (currentReport?.id === updatedReport.id) {
          setCurrentReport(updatedReport);
      }
  };
  
  const handleOpenDeleteModal = (report: LcaReport) => {
    setReportToDelete(report);
  };

  const handleConfirmDelete = () => {
      if (reportToDelete) {
          setAllReports(prev => prev.filter(r => r.id !== reportToDelete.id));
          if (currentReport?.id === reportToDelete.id) {
              setCurrentReport(null);
              setCurrentView('reports');
          }
          setReportToDelete(null);
      }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }
  
  if (!selectedWorkspace) {
      return (
          <div className="flex items-center justify-center h-screen bg-[var(--color-background)]">
              <p>Loading workspace...</p>
          </div>
      );
  }

  const renderView = () => {
    switch(currentView) {
      case 'launcher':
        return <Launcher onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} reports={displayedReports} onViewReport={handleViewReport} workspace={selectedWorkspace} currentUser={currentUser} />;
      case 'newStudy':
        return <NewStudy onAnalysisComplete={handleRunAnalysis} currentUser={currentUser} workspaceId={selectedWorkspace.id} formData={newStudyFormData} setFormData={setNewStudyFormData} />;
      case 'reports':
        return <Reports reports={displayedReports} onViewReport={handleViewReport} onNavigate={handleNavigate} currentUser={currentUser} onDeleteReport={handleOpenDeleteModal} />;
      case 'analysisReport':
        return currentReport ? <AnalysisReport report={currentReport} onBack={handleBackToPreviousView} onUpdateReport={handleUpdateReport} currentUser={currentUser} workspace={selectedWorkspace} /> : <div>No report selected.</div>;
      case 'compare':
        return <Compare currentUser={currentUser} workspaceId={selectedWorkspace.id} reports={displayedReports} />;
      case 'admin':
        return <Admin allReports={allReports} onViewReport={handleViewReport} />;
      case 'teamWorkspace':
        return <TeamWorkspace workspace={selectedWorkspace} onNavigate={handleNavigate} />;
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-background)]">
        <Sidebar 
            currentView={currentView} 
            onNavigate={handleNavigateAndCloseMobileSidebar} 
            user={currentUser}
            workspaces={userWorkspaces}
            selectedWorkspaceId={selectedWorkspaceId}
            onSelectWorkspace={handleSelectWorkspaceAndCloseMobileSidebar}
            isCollapsed={!isMobile && isSidebarCollapsed}
            onToggle={handleToggleSidebar}
            isMobile={isMobile}
            isOpenOnMobile={isSidebarOpenOnMobile}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              onLogout={handleLogout} 
              user={currentUser} 
              onToggleSidebar={handleToggleSidebar}
              isMobile={isMobile}
            />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                {renderView()}
            </main>
        </div>
        <AIAssistant 
            currentUser={currentUser} 
            allReports={displayedReports} 
            currentReport={currentReport} 
            currentView={currentView}
            newStudyFormData={newStudyFormData}
        />
         <ConfirmationModal
            isOpen={!!reportToDelete}
            onClose={() => setReportToDelete(null)}
            onConfirm={handleConfirmDelete}
            title="Delete Report"
            confirmText="Confirm Delete"
            message={<>Are you sure you want to permanently delete the report <strong>"{reportToDelete?.title}"</strong>? This action cannot be undone.</>}
        />
    </div>
  );
};

export default App;
