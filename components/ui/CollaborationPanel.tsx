import React, { useState, useEffect, useRef } from 'react';
import type { LcaReport, User, Comment } from '../../types';
import Button from './Button';

interface CollaborationPanelProps {
  isOpen: boolean;
  view: 'comments' | 'activity';
  report: LcaReport;
  currentUser: User;
  onClose: () => void;
  onAddComment: (content: string) => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ isOpen, view, report, currentUser, onClose, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [report.comments, view, isOpen]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const panelWidth = isOpen ? '400px' : '0px';

  return (
    <div 
        ref={panelRef}
        className="flex-shrink-0 bg-[var(--color-panel)] border-l border-[var(--color-border-subtle)] shadow-2xl flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
        style={{ width: panelWidth }}
    >
      <div className="flex-shrink-0 p-4 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
        <h2 className="text-lg font-bold text-[var(--text-primary)] capitalize">{view}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold" aria-label="Close panel">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {view === 'comments' && (
          <>
            {report.comments.map(comment => (
              <div key={comment.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-brand-secondary)] text-white flex items-center justify-center text-xs font-bold">
                  {comment.authorInitials}
                </div>
                <div className="flex-1">
                  <div className="bg-[var(--color-panel-light)] p-3 rounded-lg border border-[var(--color-border-subtle)]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{comment.authorName}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
        {view === 'activity' && (
          <ul className="space-y-3">
            {report.activityLog.map(log => (
              <li key={log.id} className="text-sm text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">{log.actorName}</strong> {log.action} <em>{log.target}</em>
                <span className="block text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {view === 'comments' && (
        <div className="flex-shrink-0 p-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-sidebar)]">
          <form onSubmit={handleSubmitComment} className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-2 border border-[var(--color-border-subtle)] bg-[var(--color-background)] rounded-md focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent text-white"
              rows={3}
            />
            <div className="text-right">
              <Button type="submit" size="md" disabled={!newComment.trim()}>Send</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CollaborationPanel;