import React, { useEffect, useState } from 'react';
import { AnalyticsCards } from '../components/AnalyticsCards';
import { useGemini, ExecutiveBrief } from '../hooks/useGemini';
import { Issue } from '../types/Issue';
import { Sparkles, Brain, Cpu, TrendingUp, HelpCircle, Activity, LayoutGrid, AlertTriangle, RefreshCw } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const getTopBadge = (user: any): string => {
  const reports = user.issuesReported || 0;
  const verified = user.issuesVerified || 0;
  const points = user.totalPoints || 0;

  if (points >= 500) return '🏆 Chennai Champion';
  if (points >= 100) return '⭐ Civic Hero';
  if (verified >= 20) return '🔍 Lead Inspector';
  if (verified >= 5) return '✅ Truth Verifier';
  if (reports >= 10) return '🛡️ City Guardian';
  if (reports >= 5) return '📡 Field Agent';
  if (reports >= 1) return '🏁 First Responder';
  return 'Citizen';
};

const getFriendlyError = (error: string): string => {
  if (error.includes('503') || 
      error.includes('UNAVAILABLE') || 
      error.includes('high demand') ||
      error.includes('overloaded')) {
    return 'AI systems are busy — retrying automatically. Please wait a moment.';
  }
  if (error.includes('API_KEY') || error.includes('403')) {
    return 'Authentication error. Please refresh the page.';
  }
  if (error.includes('network') || error.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  return 'Something went wrong. Please try again.';
};

interface AnalyticsDashboardProps {
  issues: Issue[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ issues }) => {
  const { getExecutiveBrief, briefLoading } = useGemini();
  const [brief, setBrief] = useState<ExecutiveBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastIssuesLength, setLastIssuesLength] = useState<number>(-1);
  const [topCitizens, setTopCitizens] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('totalPoints', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: any[] = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setTopCitizens(users);
    }, (err) => {
      console.error('Leaderboard fetch failed:', err);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Only auto-fetch if we haven't loaded a brief yet, or if the number of issues has changed.
    // This avoids redundant Gemini calls during periodic 30-second Firestore polling.
    if (brief && issues.length === lastIssuesLength) {
      return;
    }

    const fetchBrief = async () => {
      try {
        setError(null);
        const result = await getExecutiveBrief(issues);
        setBrief(result);
        setLastIssuesLength(issues.length);
      } catch (err: any) {
        console.warn('Failed to fetch Gemini insights:', err);
        setError(err.message || String(err));
      }
    };

    fetchBrief();
  }, [issues, brief, lastIssuesLength, getExecutiveBrief]);

  const handleForceRefresh = async () => {
    try {
      setError(null);
      const result = await getExecutiveBrief(issues, true); // Pass true to bypass server-side cache
      setBrief(result);
      setLastIssuesLength(issues.length);
    } catch (err: any) {
      console.warn('Failed to force refresh Gemini insights:', err);
      setError(err.message || String(err));
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-8 space-y-6 z-10 relative">
      
      {/* Header section */}
      <div className="flex justify-between items-start">
        <div className="text-left">
          <h2 className="text-3xl font-extrabold font-display text-slate-100 uppercase tracking-tight">Analytics Command</h2>
          <p className="text-xs text-slate-400 mt-1">Intelligent summaries and regional diagnostics of all active municipal failures in Chennai.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[10px] rounded-lg tracking-wider font-mono font-bold text-emerald-400 uppercase">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Syncing Live Firestore Grid</span>
        </div>
      </div>

      {/* Flagship Feature: Glassmorphism AI Executive Brief Card */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 relative overflow-hidden shadow-xl" id="div-ai-executive-brief">
        {/* Futuristic neon glowing circle backing */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />

        <div className="flex justify-between items-center gap-4 mb-4 border-b border-slate-700/30 pb-4">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h3 className="font-extrabold font-display uppercase tracking-wider text-sm">Gemini AI Executive Brief</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleForceRefresh}
              disabled={briefLoading}
              title="Regenerate Executive Brief with Gemini"
              className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-emerald-400 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 hover:border-emerald-500/30 rounded transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${briefLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Regenerate</span>
            </button>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-emerald-400 px-2 py-1 rounded">
              Pro Model Matrix Active
            </span>
          </div>
        </div>

        {briefLoading ? (
          /* Shimmer Loading animation block */
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-slate-800/80 rounded w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="h-4 bg-slate-800/60 rounded w-1/3" />
                <div className="h-4 bg-slate-800/40 rounded w-full" />
                <div className="h-4 bg-slate-800/40 rounded w-5/6" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-800/60 rounded w-1/3" />
                <div className="h-4 bg-slate-800/40 rounded w-full" />
                <div className="h-4 bg-slate-800/40 rounded w-5/6" />
              </div>
            </div>
          </div>
        ) : brief ? (
          <div className="space-y-5 text-left">
            {/* Critical Alert */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-mono">Critical Security Alert</span>
                <p className="text-xs font-semibold text-slate-200 mt-1">{brief.criticalAlert}</p>
              </div>
            </div>

            {/* Bento Split for Key Trends & Recommended Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Key Trends */}
              <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-850/40 border-slate-700/30">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Key Analytical Trends</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {brief.keyTrends.map((trend, idx) => (
                    <li key={idx} className="flex gap-2 items-start leading-relaxed border-b border-slate-800/55 pb-2 last:border-none">
                      <span className="text-[10px] font-mono font-bold text-emerald-500 mt-0.5">#{idx + 1}</span>
                      <span>{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-700/30">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 font-mono">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Recommended Dispatch Actions</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {brief.recommendedActions.map((action, idx) => (
                    <li key={idx} className="flex gap-2 items-start leading-relaxed border-b border-slate-800/55 pb-2 last:border-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 py-4 text-center animate-fade-in">
            {error ? (
              <p className="text-red-400 font-semibold">{getFriendlyError(error)}</p>
            ) : (
              <span>Failed to load live AI summary. Verify Gemini pipeline is active.</span>
            )}
          </div>
        )}
      </div>

      {/* Main statistics visualization grids */}
      <div className="pt-2">
        <AnalyticsCards issues={issues} />
      </div>

      {/* Top Citizens Leaderboard */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 shadow-xl text-left relative overflow-hidden" id="div-leaderboard">
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <h3 className="text-lg font-extrabold font-display uppercase tracking-wider text-slate-100 mb-2 flex items-center gap-2">
          <span>🏆 Top Citizens Leaderboard</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">Honoring our most active civic guardians keeping Chennai clean and safe.</p>

        <div className="space-y-3">
          {topCitizens.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-600">No civic points recorded yet. Report issues or verify others to rise!</div>
          ) : (
            topCitizens.map((citizen, index) => {
              const medals = ['🥇', '🥈', '🥉', '🏅', '🎖️'];
              const badge = getTopBadge(citizen);
              const isCurrentUser = citizen.uid === auth.currentUser?.uid;
              return (
                <div key={citizen.id} className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                  isCurrentUser 
                    ? 'bg-emerald-500/5 border-emerald-500/30 shadow-md shadow-emerald-500/5' 
                    : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono font-bold w-6 text-center text-slate-500">
                      #{index + 1}
                    </span>
                    <span className="text-xl">
                      {medals[index] || '👤'}
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                        {citizen.displayName || 'Anonymous Citizen'}
                        {isCurrentUser && (
                          <span className="text-[9px] uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold font-mono">You</span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{badge}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      {citizen.totalPoints || 0} pts
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {citizen.issuesReported || 0} reports • {citizen.issuesVerified || 0} verifications
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
