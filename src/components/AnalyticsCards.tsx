import React from 'react';
import { Issue } from '../types/Issue';
import { BarChart, AlertTriangle, CheckCircle, Clock, Shield, Sparkles, Building2, ListOrdered } from 'lucide-react';

interface AnalyticsCardsProps {
  issues: Issue[];
}

export const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ issues }) => {
  // Compute Key Statistics
  const totalIssues = issues.length;
  const openIssues = issues.filter(i => i.status === 'Open').length;
  const progressIssues = issues.filter(i => i.status === 'In Progress').length;
  const resolvedIssues = issues.filter(i => i.status === 'Resolved').length;

  // Compute Categories Metrics
  const categoriesMap: Record<string, number> = {};
  const severityMap: Record<string, number> = { Emergency: 0, Urgent: 0, Important: 0, Routine: 0 };
  const departmentMap: Record<string, number> = {};

  issues.forEach(issue => {
    // Categories
    categoriesMap[issue.category] = (categoriesMap[issue.category] || 0) + 1;
    // Severity
    if (issue.severityLevel in severityMap) {
      severityMap[issue.severityLevel] += 1;
    } else {
      severityMap[issue.severityLevel] = 1;
    }
    // Departments
    departmentMap[issue.responsibleDepartment] = (departmentMap[issue.responsibleDepartment] || 0) + 1;
  });

  const categoriesSorted = Object.entries(categoriesMap).sort((a, b) => b[1] - a[1]);
  const severityArray = Object.entries(severityMap);
  const departmentsSorted = Object.entries(departmentMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-full space-y-8">
      {/* 4 Core KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Reported */}
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/40 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-display">Total Reported</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <BarChart className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold font-display text-slate-100 tracking-tight">{totalIssues}</div>
          <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>Civic issues integrated</span>
          </p>
        </div>

        {/* Resolved Vector */}
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/40 relative overflow-hidden group hover:border-green-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-display">Resolved Cases</span>
            <span className="p-2 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold font-display text-green-400 tracking-tight">{resolvedIssues}</div>
          <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
            <span>{totalIssues ? Math.round((resolvedIssues / totalIssues) * 100) : 0}% compliance rate</span>
          </p>
        </div>

        {/* In Progress */}
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/40 relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-display">In Mitigation</span>
            <span className="p-2 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold font-display text-orange-400 tracking-tight">{progressIssues}</div>
          <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
            <span>Crews dispatched in wards</span>
          </p>
        </div>

        {/* Active Open */}
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/40 relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-display">Pending Triage</span>
            <span className="p-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold font-display text-red-400 tracking-tight">{openIssues}</div>
          <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
            <span>Awaiting dispatch metrics</span>
          </p>
        </div>
      </div>

      {/* Visual Analytics Sections - Bento style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Categories Distribution Bar Chart Component */}
        <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-200">Issues by Category</h3>
            </div>
            <span className="text-[10px] bg-slate-700/40 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest font-mono">Real-time counts</span>
          </div>

          <div className="space-y-4">
            {categoriesSorted.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-6">No data registered. Please report an issue to track stats.</div>
            ) : (
              categoriesSorted.map(([cat, count]) => {
                const percentage = totalIssues ? (count / totalIssues) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-emerald-400">{count} reports <span className="text-slate-500">({Math.round(percentage)}%)</span></span>
                    </div>
                    {/* Beautiful custom responsive progress track */}
                    <div className="h-2.5 w-full bg-slate-900 rounded-full" id={`progress-container-${cat}`}>
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Severity Metrics Circular Radial Display */}
        <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#f59e0b]" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-200">Severity Distribution</h3>
            </div>
            <span className="text-[10px] bg-slate-700/40 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest font-mono">Triage Levels</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Visual SVG Ring */}
            <div className="relative flex justify-center py-2">
              <svg className="w-40 h-40 transform -rotate-90">
                {/* Background Ring */}
                <circle cx="80" cy="80" r="65" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                {/* Emergency Segment (Red) */}
                <circle 
                  cx="80" cy="80" r="65" 
                  stroke="#ef4444" strokeWidth="12" fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 65}`}
                  strokeDashoffset={`${2 * Math.PI * 65 * (1 - (severityMap.Emergency / (totalIssues || 1)))}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <span className="text-2xl font-bold font-display text-slate-100">{totalIssues}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Triage Units</span>
              </div>
            </div>

            {/* Severity Legends details */}
            <div className="space-y-3">
              {severityArray.map(([level, count]) => {
                let badgeColor = 'bg-green-500';
                let textColor = 'text-green-400';
                if (level === 'Emergency') { badgeColor = 'bg-red-500'; textColor = 'text-red-400'; }
                else if (level === 'Urgent') { badgeColor = 'bg-orange-500'; textColor = 'text-orange-400'; }
                else if (level === 'Important') { badgeColor = 'bg-yellow-500'; textColor = 'text-yellow-500'; }

                return (
                  <div key={level} className="flex items-center justify-between text-xs border-b border-slate-700/30 pb-2 last:border-none">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${badgeColor}`} />
                      <span className="text-slate-300 font-semibold">{level}</span>
                    </div>
                    <span className={`font-mono font-bold ${textColor}`}>
                      {count} ({totalIssues ? Math.round((count / totalIssues) * 100) : 0}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Department Dispatch Distribution */}
        <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#3b82f6]" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-200">Department Routing Activity</h3>
            </div>
            <span className="text-[10px] bg-slate-700/40 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest font-mono">Dispatched Units</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {departmentsSorted.slice(0, 3).map(([dept, count], idx) => {
              const bgFaded = idx === 0 ? 'bg-emerald-500/5 border-emerald-500/20'
                            : idx === 1 ? 'bg-blue-500/5 border-blue-500/20'
                            : 'bg-indigo-500/5 border-indigo-500/20';
              const textBadgeColor = idx === 0 ? 'text-emerald-400 bg-emerald-500/10'
                                  : idx === 1 ? 'text-blue-400 bg-blue-500/10'
                                  : 'text-indigo-400 bg-indigo-500/10';

              return (
                <div key={dept} className={`p-4 rounded-xl border ${bgFaded} flex flex-col justify-between`}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded font-bold ${textBadgeColor}`}>
                        Rank #{idx + 1}
                      </span>
                      <span className="text-2xl font-bold font-display text-slate-200">{count}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-300 line-clamp-2 leading-relaxed">
                      {dept}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/30 text-[10px] text-slate-500">
                    Routing active under Chennai Region Protocol
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
