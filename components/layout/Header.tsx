import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../../types';

interface HeaderProps {
    onLogout: () => void;
    user: User | null;
    onToggleSidebar: () => void;
    isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLogout, user, onToggleSidebar, isMobile }) => {
  if (!user) return null; // Or a loading state

  return (
    <header className="flex-shrink-0 bg-[var(--color-header)] border-b border-[var(--color-border)] p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
           {isMobile && (
            <button onClick={onToggleSidebar} className="mr-2 p-2 text-gray-500 rounded-md hover:bg-gray-100" aria-label="Open menu">
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          )}
          <div>
            <h1 className="text-base sm:text-xl font-bold text-[var(--color-brand-primary)] tracking-wide">
              MetalliQ: AI-Powered Metals Sustainability
            </h1>
            <p className="hidden sm:block text-sm text-[var(--text-on-light-secondary)]">{`Welcome, ${user.name}`}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
           <button onClick={onLogout} className="text-sm font-medium text-[var(--text-primary)] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;