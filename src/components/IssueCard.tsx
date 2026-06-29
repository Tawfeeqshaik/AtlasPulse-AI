import React from 'react';
import { Issue } from '../types/Issue';
import { SeverityBadge } from './SeverityBadge';
import { MapPin, Calendar, Building, Sparkles, Navigation, CheckCircle2, Clock, Eye } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onSelect?: (issue: Issue) => void;
  onUpdateStatus?: (docId: string, status: 'Open' | 'In Progress' | 'Resolved') => void;
  onVerify?: (issueId: string) => void;
  currentUserId?: string;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onSelect, onUpdateStatus, onVerify, currentUserId }) => {
  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  let statusColor = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
  if (issue.status === 'In Progress') {
    statusColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
  } else if (issue.status === 'Resolved') {
    statusColor = 'bg-green-500/10 text-green-400 border border-green-500/20';
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden hover:border-emerald-500/30 transition-all duration-300 shadow-lg group flex flex-col h-full">
      {/* Upper part - thumbnail & stats */}
      <div className="relative h-44 overflow-hidden bg-slate-950 flex shadow-sm">
        <img 
          src={issue.imageUrl} 
          alt={issue.category} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/60 pointer-events-none" />
        
        {/* Float Overlays */}
        <div className="absolute top-3 left-3">
          <SeverityBadge severity={issue.severityLevel} />
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono tracking-widest uppercase ${statusColor}`}>
            {issue.status}
          </span>
          <div className="bg-slate-900/90 text-[10px] font-mono font-bold text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 tracking-wider">
            ID: {issue.issueId}
          </div>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <MapPin className="w-3.5 h-3.5 text-red-400 fill-red-400/20" />
          <span className="truncate max-w-[200px]">{issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}</span>
        </div>

        <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur px-2.5 py-[3px] rounded-md border border-slate-700/50 flex items-center gap-1 text-[10px] font-bold font-mono text-slate-300">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Priority {issue.priorityScore}</span>
        </div>
      </div>

      {/* Middle payload - details */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-lg font-display text-slate-100 line-clamp-1 group-hover:text-emerald-400 transition-colors">
              {issue.category}
            </h4>
            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 self-center">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
            {issue.aiSummary}
          </p>

          <div className="pt-3 border-t border-slate-700/50 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-300">
              <Building className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1 font-medium">{issue.responsibleDepartment}</span>
            </div>
          </div>
        </div>

        {/* Lower tools - action buttons */}
        <div className="mt-5 pt-4 border-t border-slate-700/50 flex flex-wrap gap-2 items-center justify-between">
          {/* Status updater for simulation/demo features */}
          {onUpdateStatus && issue.id && (
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-700/50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(issue.id!, 'In Progress');
                }}
                title="Mark as In Progress"
                disabled={issue.status === 'In Progress' || issue.status === 'Resolved'}
                className="p-1.5 rounded hover:bg-slate-800 text-blue-400 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Clock className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(issue.id!, 'Resolved');
                }}
                title="Mark as Resolved"
                disabled={issue.status === 'Resolved'}
                className="p-1.5 rounded hover:bg-slate-800 text-green-400 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {onVerify && currentUserId && issue.id && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onVerify(issue.id!);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-600 hover:border-emerald-500 hover:text-emerald-400 transition-all text-slate-400 text-xs font-semibold disabled:opacity-50"
              disabled={issue.verifiedBy?.includes(currentUserId) || issue.createdBy === currentUserId || issue.userId === currentUserId}
            >
              {issue.verifiedBy?.includes(currentUserId) ? (
                <span className="text-emerald-400">✓ Verified by you</span>
              ) : (issue.createdBy === currentUserId || issue.userId === currentUserId) ? (
                <span className="text-slate-500">Your report</span>
              ) : (
                <span>👥 Verify ({issue.verificationCount || 0})</span>
              )}
            </button>
          )}

          <button
            onClick={() => onSelect && onSelect(issue)}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold text-xs transition-colors active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Escalate & Letter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
