import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Cpu, FileSpreadsheet, Compass, ArrowRight, Activity, Building, Globe, Zap } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  onNavigate: (page: string) => void;
  totalIssues: number;
}

export const Landing: React.FC<LandingProps> = ({ onStart, onNavigate, totalIssues }) => {
  return (
    <div className="w-full relative overflow-hidden min-h-screen flex flex-col justify-between">
      {/* Dynamic Background Grid and Orbits */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center z-10 flex-grow flex flex-col justify-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold font-display tracking-tight text-slate-100 uppercase"
        >
          AtlasPulse <span className="text-emerald-500">AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl font-medium text-slate-400 mt-2 font-display uppercase tracking-widest"
        >
          Report. Analyze. Escalate.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-slate-400 max-w-2xl mx-auto mt-6 text-sm md:text-base leading-relaxed"
        >
          AtlasPulse AI bridges the massive gap in municipal responsibility. Go beyond simple logs — generate formal, legally-structured municipal action requests automatically using Gemini 2.5 Pro Vision routing models.
        </motion.p>

        {/* Start CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-wrap gap-4 justify-center"
        >
          <button
            onClick={onStart}
            id="cta-start-reporting"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm tracking-uppercase hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all duration-300"
          >
            <span>Start Reporting</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('map')}
            className="px-8 py-4 rounded-2xl bg-slate-800 text-slate-200 border border-slate-700/50 font-bold text-sm hover:bg-slate-750 transition-all"
          >
            View Live Map
          </button>
        </motion.div>

        {/* 3 Core SaaS Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          {/* Feature 1 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/20 hover:bg-slate-900/80 transition-all duration-300 group shadow-md">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 w-fit mb-3 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider mb-1 px-1">AI Issue Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed px-1">
              Upload any image of a street hazard. Gemini 2.5 Pro Classifiers automatically verify pavement fatigue, illegal garbage dumping, toxic safety risks, and streetlight structural failures.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/20 hover:bg-slate-900/80 transition-all duration-300 group shadow-md">
            <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20 w-fit mb-3 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider mb-1 px-1">Automated Routing</h3>
            <p className="text-xs text-slate-400 leading-relaxed px-1">
              Priority Engine scores coordinates instantaneously by combining distance matrices with notes to assign responsibility of Greater Chennai Corporation or water boards.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/20 hover:bg-slate-900/80 transition-all duration-300 group shadow-md">
            <div className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-lg border border-emerald-600/20 w-fit mb-3 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider mb-1 px-1">Official Requests</h3>
            <p className="text-xs text-slate-400 leading-relaxed px-1">
              Instantly compile visual damage audits into highly formal, printable government letters with dynamic priority headers. Share directly as automated WhatsApp templates.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-slate-950/80 border-t border-slate-800/60 py-12 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex justify-center items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-emerald-500" />
                <span className="text-3xl md:text-4xl font-extrabold text-slate-100 font-display">{totalIssues || 25}</span>
              </div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold font-display">Issues Reported</p>
              <p className="text-[10px] text-slate-500 mt-1">Realtime Firestore Sync</p>
            </div>

            <div>
              <div className="flex justify-center items-center gap-2 mb-2">
                <Building className="w-5 h-5 text-emerald-500" />
                <span className="text-3xl md:text-4xl font-extrabold text-slate-100 font-display">5 Wards</span>
              </div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold font-display">Departments Covered</p>
              <p className="text-[10px] text-slate-500 mt-1">Greater Chennai Region</p>
            </div>

            <div>
              <div className="flex justify-center items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                <span className="text-3xl md:text-4xl font-extrabold text-slate-100 font-display">100% Impact</span>
              </div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold font-display">Community Security</p>
              <p className="text-[10px] text-slate-500 mt-1">SaaS escalation standard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
