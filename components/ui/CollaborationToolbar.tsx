import React from 'react';
import type { TeamMember } from '../../types';
import { ChatBubbleLeftRightIcon } from '../../constants';

interface CollaborationToolbarProps {
  members: TeamMember[];
  onToggleComments: () => void;
  onToggleActivity: () => void;
}

const CollaborationToolbar: React.FC<CollaborationToolbarProps> = ({ members, onToggleComments, onToggleActivity }) => {
  return (
    <div className="bg-[var(--color-panel)] border border-[var(--color-border-subtle)] rounded-lg p-2 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex -space-x-2">
          {members.map(member => (
            <div key={member.userId} title={member.name} className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs font-bold ring-2 ring-[var(--color-panel)]">
              {member.initials}
            </div>
          ))}
        </div>
        <span className="text-sm text-[var(--text-secondary)] font-medium">{members.length} Team Members</span>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={onToggleComments} className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[var(--text-primary)] rounded-md text-sm font-medium transition-colors">
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>Comments</span>
        </button>
         <button onClick={onToggleActivity} className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[var(--text-primary)] rounded-md text-sm font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Activity</span>
        </button>
      </div>
    </div>
  );
};

export default CollaborationToolbar;