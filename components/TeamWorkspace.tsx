import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import type { Workspace, View, TeamMember } from '../types';
import { UsersIcon } from '../constants';

interface TeamWorkspaceProps {
  workspace: Workspace;
  onNavigate: (view: View) => void;
}

const TeamWorkspace: React.FC<TeamWorkspaceProps> = ({ workspace, onNavigate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-on-light-primary)]">{workspace.name} Settings</h1>
        <p className="text-[var(--text-on-light-secondary)] mt-1">Manage members and settings for this workspace.</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--text-on-light-primary)] mb-4 flex items-center">
          <UsersIcon className="w-5 h-5 mr-2" />
          Team Members ({workspace.members.length})
        </h2>
        <div className="space-y-3">
          {workspace.members.map(member => (
            <div key={member.userId} className="flex justify-between items-center p-3 bg-white/80 rounded-lg border border-gray-300">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold">
                  {member.initials}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-on-light-primary)]">{member.name}</p>
                  <p className="text-sm text-[var(--text-on-light-secondary)]">{member.userId}</p>
                </div>
              </div>
              <select defaultValue={member.role} className="p-1.5 border border-gray-300 rounded-md bg-white text-sm">
                <option>Owner</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
            </div>
          ))}
        </div>
      </Card>
      
      <Card>
        <h2 className="text-lg font-semibold text-[var(--text-on-light-primary)] mb-4">Invite New Members</h2>
         <div className="flex items-center space-x-2">
            <input 
                type="email" 
                placeholder="Enter email addresses..."
                className="flex-grow p-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)]"
            />
            <Button size="lg">Send Invites</Button>
        </div>
        <p className="text-xs text-[var(--text-on-light-secondary)] mt-2">Separate multiple emails with commas. This is a UI demonstration.</p>
      </Card>
      
       <Card>
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="flex justify-between items-center p-4 border border-red-300 bg-red-50 rounded-lg">
            <div>
                <p className="font-semibold text-red-800">Delete this Workspace</p>
                <p className="text-sm text-red-700">Once deleted, all reports and data will be lost forever.</p>
            </div>
            <Button variant="secondary" className="border-red-500 text-red-500 hover:bg-red-100">Delete Workspace</Button>
        </div>
      </Card>

    </div>
  );
};

export default TeamWorkspace;