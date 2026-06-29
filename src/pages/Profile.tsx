import React from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types/User';
import { Issue } from '../types/Issue';
import { Award, Shield, Activity, CheckCircle2, MapPin, User, Mail, Calendar } from 'lucide-react';

interface ProfileProps {
  userProfile: UserProfile | null;
  issues: Issue[];
}

export const getBadges = (user: UserProfile): string[] => {
  const badges = [];
  const reports = user.issuesReported || 0;
  const verified = user.issuesVerified || 0;
  const points = user.totalPoints || 0;

  if (reports >= 1) badges.push('🏁 First Responder');
  if (reports >= 5) badges.push('📡 Field Agent');
  if (reports >= 10) badges.push('🛡️ City Guardian');
  if (verified >= 5) badges.push('✅ Truth Verifier');
  if (verified >= 20) badges.push('🔍 Lead Inspector');
  if (points >= 100) badges.push('⭐ Civic Hero');
  if (points >= 500) badges.push('🏆 Chennai Champion');
  return badges;
};

export const Profile: React.FC<ProfileProps> = ({ userProfile, issues }) => {
  if (!userProfile) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading citizen profile...</p>
        </div>
      </div>
    );
  }

  // Get dynamic recent activity based on real issues
  const userReports = issues.filter(issue => issue.createdBy === userProfile.uid);
  const userVerifications = issues.filter(issue => issue.verifiedBy?.includes(userProfile.uid));

  const activities = [
    ...userReports.map(issue => ({
      id: `report-${issue.id || issue.issueId}`,
      type: 'report',
      title: `Reported: ${issue.category}`,
      desc: `Status: ${issue.status} • Priority Score: ${issue.priorityScore}`,
      date: issue.createdAt,
      points: '+25 pts'
    })),
    ...userVerifications.map(issue => ({
      id: `verify-${issue.id || issue.issueId}`,
      type: 'verify',
      title: `Verified: ${issue.category}`,
      desc: `Reported by ${issue.createdByName || 'Chennai Resident'}`,
      date: issue.createdAt, // approximation or verification time if stored, createdAt is fine
      points: '+10 pts'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const earnedBadges = getBadges(userProfile);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 z-10 flex-grow w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <User className="w-8 h-8 text-emerald-500" />
              Citizen Profile
            </h1>
            <p className="text-slate-400 text-sm mt-1">Track your civic contributions and badges earned</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Total Power</div>
              <div className="text-xl font-bold text-emerald-400 font-mono">{userProfile.totalPoints || 0} PTS</div>
            </div>
          </div>
        </div>

        {/* Profile Card design requested by user */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 pb-8 border-b border-slate-700/50">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-3xl font-bold text-emerald-400 shadow-lg">
              {userProfile.displayName?.[0]?.toUpperCase()}
            </div>
            <div className="space-y-1">
              <h2 className="text-white text-2xl font-bold font-display tracking-tight flex items-center gap-2">
                {userProfile.displayName}
              </h2>
              <p className="text-slate-400 text-sm flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {userProfile.email}
              </p>
              <p className="text-emerald-400 font-extrabold text-lg flex items-center gap-1.5 font-mono">
                ⭐ {userProfile.totalPoints || 0} Points
              </p>
            </div>
          </div>
          
          {/* Badges section */}
          <div className="mb-8">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider font-extrabold mb-4 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" /> Earned Badges
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {earnedBadges.map(badge => (
                <span key={badge} 
                  className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm hover:scale-105 transition duration-200 cursor-default flex items-center gap-1"
                >
                  {badge}
                </span>
              ))}
              {earnedBadges.length === 0 && (
                <span className="text-slate-500 text-sm">
                  Report your first issue to earn badges
                </span>
              )}
            </div>
          </div>
          
          {/* Stats grid */}
          <div>
            <h3 className="text-slate-400 text-xs uppercase tracking-wider font-extrabold mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-500" /> Civic Footprint
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 rounded-xl p-4 text-center border border-slate-800 hover:border-slate-700 transition">
                <div className="text-3xl font-black text-white font-mono">
                  {userProfile.issuesReported || 0}
                </div>
                <div className="text-slate-400 text-xs mt-1.5 font-semibold">Issues Reported</div>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 text-center border border-slate-800 hover:border-slate-700 transition">
                <div className="text-3xl font-black text-white font-mono">
                  {userProfile.issuesVerified || 0}
                </div>
                <div className="text-slate-400 text-xs mt-1.5 font-semibold">Issues Verified</div>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 text-center border border-slate-800 hover:border-slate-700 transition">
                <div className="text-3xl font-black text-white font-mono">
                  {userProfile.totalPoints || 0}
                </div>
                <div className="text-slate-400 text-xs mt-1.5 font-semibold">Total Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity list */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-8 shadow-lg">
          <h3 className="text-slate-300 text-sm uppercase tracking-wider font-extrabold mb-6 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-4 h-4 text-emerald-400" /> Recent Civic Contributions
          </h3>

          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No recent activity recorded. Submit reports or verify other incidents to get listed!
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 hover:bg-slate-800/70 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      act.type === 'report' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {act.type === 'report' ? <MapPin className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{act.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{act.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold font-mono px-2 py-1 rounded ${
                      act.type === 'report' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {act.points}
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      {new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
};
