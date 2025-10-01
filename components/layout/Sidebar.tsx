
import React, { useMemo } from 'react';
import { HomeIcon, PlusCircleIcon, DocumentTextIcon, ScaleIcon, Cog6ToothIcon, ShieldCheckIcon, ChevronDoubleLeftIcon, PresentationChartLineIcon } from '../../constants';
import { MetalliQIcon } from '../ui/Logo';
import type { View, User, Workspace, NavItem } from '../../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  user: User | null;
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
  onSelectWorkspace: (workspaceId: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  isOpenOnMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, user, workspaces, selectedWorkspaceId, onSelectWorkspace, isCollapsed, onToggle, isMobile, isOpenOnMobile }) => {
  const NAV_ITEMS: NavItem[] = useMemo(() => [
      { key: 'launcher', name: 'Home', view: 'launcher', icon: HomeIcon, roles: ['user', 'admin'] },
      { key: 'dashboard', name: 'Overview', view: 'dashboard', icon: PresentationChartLineIcon, roles: ['user', 'admin'] },
      { key: 'newStudy', name: 'Create Study', view: 'newStudy', icon: PlusCircleIcon, roles: ['user', 'admin'] },
      { key: 'reports', name: 'View Reports', view: 'reports', icon: DocumentTextIcon, roles: ['user', 'admin'] },
      { key: 'compare', name: 'Compare Scenarios', view: 'compare', icon: ScaleIcon, roles: ['user', 'admin'] },
      { key: 'teamWorkspace', name: 'Workspace Settings', view: 'teamWorkspace', icon: Cog6ToothIcon, roles: ['user', 'admin'] },
      { key: 'adminPanel', name: 'Admin Console', view: 'admin', icon: ShieldCheckIcon, roles: ['admin'] }
  ], []);
    
  if (!user) return null;

  const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

  const availableNavItems = NAV_ITEMS.filter(item => {
    if (!item.roles.includes(user.role)) return false;
    // Hide 'Workspace Settings' for personal workspaces
    if (item.view === 'teamWorkspace' && selectedWorkspace?.isPersonal) return false;
    // Show 'Admin Panel' only for admins
    if (item.view === 'admin' && user.role !== 'admin') return false;
    return true;
  });

  const sidebarIsCollapsed = !isMobile && isCollapsed;

  const sidebarBaseClasses = "bg-[var(--color-sidebar)] text-[var(--text-on-dark-primary)] flex flex-col transition-all duration-300 ease-in-out";
  const desktopClasses = `relative ${sidebarIsCollapsed ? 'w-20' : 'w-64'}`;
  const mobileClasses = `fixed inset-y-0 left-0 z-50 w-64 transform ${isOpenOnMobile ? 'translate-x-0' : '-translate-x-full'}`;

  return (
    <>
      {isMobile && isOpenOnMobile && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onToggle} aria-hidden="true"></div>
      )}
      <aside className={`${sidebarBaseClasses} ${isMobile ? mobileClasses : desktopClasses}`}>
        {/* Header */}
        <div className={`h-20 flex items-center border-b border-white/10 ${sidebarIsCollapsed ? 'justify-center' : 'px-4'}`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <MetalliQIcon className="h-10 w-10 text-white flex-shrink-0" />
            {!sidebarIsCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold whitespace-nowrap text-[var(--text-on-dark-primary)]">MetalliQ</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Workspace Switcher */}
        <div className="px-2 py-4 border-b border-white/10">
          {!sidebarIsCollapsed && <span className="px-3 text-xs font-semibold text-[var(--text-on-dark-secondary)] uppercase">Workspaces</span>}
          <div className="mt-2 space-y-1">
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className={`w-full flex items-center py-2.5 rounded-lg transition-colors duration-200 text-left relative group ${sidebarIsCollapsed ? 'justify-center' : 'px-3'} ${selectedWorkspaceId === ws.id ? 'bg-[var(--color-brand-accent)]/20' : 'hover:bg-white/10'}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm bg-gray-600`}>
                  {ws.name.charAt(0)}
                </div>
                {!sidebarIsCollapsed && <span className="ml-3 text-sm font-medium whitespace-nowrap">{ws.name}</span>}
                 {sidebarIsCollapsed && (
                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-gray-800 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 whitespace-nowrap">
                    {ws.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {availableNavItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.view as View)}
              className={`w-full flex items-center py-2.5 rounded-lg transition-colors duration-200 text-left relative group ${sidebarIsCollapsed ? 'justify-center' : 'px-3'} ${currentView === item.view ? 'bg-[var(--color-brand-accent)]/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
              aria-label={item.name}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarIsCollapsed && (
                <span className="ml-3 whitespace-nowrap">{item.name}</span>
              )}
              {sidebarIsCollapsed && (
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-gray-800 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Toggle Button & User Info */}
         <div className={`p-2 border-t border-white/10 ${isMobile ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between">
               <div className={`flex items-center space-x-3 overflow-hidden ${sidebarIsCollapsed ? 'w-0' : 'w-auto'}`}>
                    <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[var(--color-brand-secondary)]">
                            <span className="text-sm font-medium leading-none text-white">{user.initials}</span>
                        </span>
                    </div>
                    {!sidebarIsCollapsed && (
                        <div>
                            <p className="text-sm font-semibold text-white whitespace-nowrap">{user.name}</p>
                        </div>
                    )}
                </div>
                <button 
                  onClick={onToggle} 
                  className="flex-shrink-0 p-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Toggle sidebar"
                >
                    <ChevronDoubleLeftIcon className={`h-6 w-6 transition-transform duration-300 ${sidebarIsCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>
         </div>
      </aside>
    </>
  );
};

export default Sidebar;
