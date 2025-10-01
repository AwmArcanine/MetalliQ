import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import type { View, User } from '../types';
import { PlusCircleIcon, DocumentTextIcon, ScaleIcon, Cog6ToothIcon, ShieldCheckIcon, PresentationChartLineIcon } from '../constants';

interface LauncherProps {
  onNavigate: (view: View) => void;
  currentUser: User;
}

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  view: View;
  onNavigate: (view: View) => void;
  ctaText: string;
}> = ({ title, description, icon: Icon, view, onNavigate, ctaText }) => (
  <Card className="flex flex-col text-center items-center transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--color-brand-primary)]/20">
    <div className="p-4 bg-[var(--color-brand-primary)]/10 rounded-full mb-4">
      <Icon className="w-10 h-10 text-[var(--color-brand-primary)]" />
    </div>
    <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
    <p className="text-[var(--text-secondary)] mt-2 flex-grow">{description}</p>
    <Button onClick={() => onNavigate(view)} className="mt-6 w-full">
      {ctaText}
    </Button>
  </Card>
);

const Launcher: React.FC<LauncherProps> = ({ onNavigate, currentUser }) => {
  const isAdmin = currentUser.role === 'admin';

  const features = [
    { 
      title: "Create New LCA Study",
      description: "Start a new Life Cycle Assessment from scratch using our guided form.",
      icon: PlusCircleIcon,
      view: 'newStudy' as View,
      ctaText: "Start Study",
      roles: ['user', 'admin']
    },
    { 
      title: "View & Manage Reports",
      description: "Access, filter, and export all of your previously generated LCA reports.",
      icon: DocumentTextIcon,
      view: 'reports' as View,
      ctaText: "View Reports",
      roles: ['user', 'admin']
    },
    { 
      title: "Compare Scenarios",
      description: "Run side-by-side analyses for different materials or visualize existing reports.",
      icon: ScaleIcon,
      view: 'compare' as View,
      ctaText: "Open Comparator",
      roles: ['user', 'admin']
    },
     { 
      title: "Workspace Overview",
      description: "See a high-level dashboard of your workspace's key sustainability metrics.",
      icon: PresentationChartLineIcon,
      view: 'dashboard' as View,
      ctaText: "Go to Overview",
      roles: ['user', 'admin']
    },
    { 
      title: "Workspace Settings",
      description: "Manage team members, permissions, and settings for your current workspace.",
      icon: Cog6ToothIcon,
      view: 'teamWorkspace' as View,
      ctaText: "Manage Workspace",
      roles: ['user', 'admin']
    },
    { 
      title: "Admin Console",
      description: "Oversee platform analytics, manage global datasets, and monitor the AI model.",
      icon: ShieldCheckIcon,
      view: 'admin' as View,
      ctaText: "Open Console",
      roles: ['admin']
    }
  ];

  const availableFeatures = features.filter(feature => feature.roles.includes(currentUser.role));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[var(--text-primary)]">Welcome, {currentUser.name}</h1>
        <p className="text-lg text-[var(--text-secondary)] mt-1">What would you like to do today?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableFeatures.map(feature => (
          <FeatureCard 
            key={feature.view}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            view={feature.view}
            onNavigate={onNavigate}
            ctaText={feature.ctaText}
          />
        ))}
      </div>
    </div>
  );
};

export default Launcher;
