import React, { useState } from 'react';
import { Issue } from '../types/Issue';
import { IssueCard } from '../components/IssueCard';
import { 
  FileText, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Inbox
} from 'lucide-react';
import { motion } from 'motion/react';

interface MyReportsProps {
  issues: Issue[];
  currentUserId: string | undefined;
  onSelectIssue: (issue: Issue) => void;
  onUpdateStatus: (docId: string, status: 'Open' | 'In Progress' | 'Resolved') => void;
  onNavigate: (page: string) => void;
  onVerify?: (issueId: string) => void;
}

export const MyReports: React.FC<MyReportsProps> = ({
  issues,
  currentUserId,
  onSelectIssue,
  onUpdateStatus,
  onNavigate,
  onVerify
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Handle unauthenticated state gracefully
  if (!currentUserId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center z-10 flex-grow flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur"
        >
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 w-fit mx-auto mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display uppercase tracking-tight text-white mb-4">
            Console Authentication Required
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm md:text-base mb-8 leading-relaxed">
            Please login or register to securely access your personal dashboard and track the real-time escalation status of your reported civic issues.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => onNavigate('login')}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition uppercase shadow-lg shadow-emerald-500/15"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="px-6 py-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/65 font-bold text-sm transition uppercase"
            >
              Create Account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Filter issues specifically submitted by the current user
  const myIssues = issues.filter(issue => 
    issue.createdBy === currentUserId || 
    issue.userId === currentUserId
  );

  // Apply search query and status filters
  const filteredIssues = myIssues.filter(issue => {
    const matchesSearch = 
      issue.issueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.responsibleDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.notes && issue.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalReports = myIssues.length;
  const inProgressReports = myIssues.filter(i => i.status === 'In Progress').length;
  const resolvedReports = myIssues.filter(i => i.status === 'Resolved').length;
  const openReports = myIssues.filter(i => i.status === 'Open' || i.status === 'Reported' || i.status === 'Verified').length;

  return (
    <div className="w-full relative overflow-hidden min-h-screen py-8">
      {/* Background Orbits */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-px w-6 bg-emerald-500"></span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Citizen Reporting Desk</span>
            </div>
            <h1 className="text-3xl font-bold font-display uppercase text-white tracking-tight">My Escalate Reports</h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time monitoring of automated legal briefs and action requests registered under your ID.
            </p>
          </div>

          <button
            onClick={() => onNavigate('report')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>File New Hazard</span>
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Filed</p>
              <h3 className="text-2xl font-black text-white font-mono mt-0.5">{totalReports}</h3>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-lg text-slate-400 border border-slate-700/30">
              <FileText className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Open / Reported</p>
              <h3 className="text-2xl font-black text-red-400 font-mono mt-0.5">{openReports}</h3>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-lg text-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">In Progress</p>
              <h3 className="text-2xl font-black text-blue-400 font-mono mt-0.5">{inProgressReports}</h3>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-lg text-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resolved</p>
              <h3 className="text-2xl font-black text-green-400 font-mono mt-0.5">{resolvedReports}</h3>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-lg text-green-500/10 text-green-400 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Filters and Search Strip */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search reports by ID, category, notes, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500/40 text-slate-100 transition placeholder-slate-600"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto self-start md:self-auto scrollbar-none">
            {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition border whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Content List */}
        {filteredIssues.length === 0 ? (
          <div className="bg-slate-900/20 border border-slate-800/60 rounded-3xl p-12 text-center">
            <div className="p-4 bg-slate-800/40 text-slate-500 rounded-full w-fit mx-auto mb-4 border border-slate-700/20">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-300 uppercase tracking-wider">No matching reports found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {myIssues.length === 0 
                ? "You haven't submitted any civic issue reports yet. File a report using the AI detecting camera to see it here."
                : "No reports fit your search query or filter selection."}
            </p>
            {myIssues.length === 0 && (
              <button
                onClick={() => onNavigate('report')}
                className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700/60 rounded-xl text-xs font-bold uppercase tracking-wider transition"
              >
                File New Report
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue, index) => (
              <motion.div
                key={issue.id || issue.issueId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <IssueCard 
                  issue={issue} 
                  onSelect={onSelectIssue}
                  onUpdateStatus={onUpdateStatus}
                  onVerify={onVerify}
                  currentUserId={currentUserId}
                />
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
