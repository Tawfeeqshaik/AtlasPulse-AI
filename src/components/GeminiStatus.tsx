import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Cpu, ShieldAlert, Sparkles, Wand2, CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface GeminiStatusProps {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  errorMessage?: string | null;
  isRetrying?: boolean;
}

export const GeminiStatus: React.FC<GeminiStatusProps> = ({ status, errorMessage, isRetrying }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [localIsRetrying, setLocalIsRetrying] = useState(false);

  const steps = [
    { title: 'Connecting to Gemini Vision...', desc: 'Extracting visual and semantic noise from the uploaded imagery.' },
    { title: 'Analyzing image for civic issues...', desc: 'Standardizing damage category via Gemini multilabel classifiers.' },
    { title: 'Calculating priority score...', desc: 'Weighing geographical densities, safety zone modifiers and severity levels.' },
    { title: 'Routing to municipal department...', desc: 'Executing administrative routing matrices for optimal municipal dispatch.' },
    { title: 'Preparing action request...', desc: 'Compiling structural visual feedback into formal serif government letters.' },
  ];

  useEffect(() => {
    if (status !== 'analyzing') {
      setActiveStep(0);
      setLocalIsRetrying(false);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1300); // Progress through steps gracefully

    const retryTimer = setTimeout(() => {
      setLocalIsRetrying(true);
    }, 10000); // Trigger retrying label if the step takes longer than 10 seconds

    return () => {
      clearInterval(interval);
      clearTimeout(retryTimer);
    };
  }, [status]);

  if (status === 'idle') return null;

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 my-6 shadow-xl relative overflow-hidden text-left" id="gemini-status-container">
      {/* Background glow effects */}
      <div className="absolute -right-32 -top-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-32 -bottom-32 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {status === 'analyzing' && (
        <div className="py-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-400"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 font-display">AtlasPulse Pipeline</h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold font-mono">Running Real-Time Multi-Variant Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[9px] rounded-lg tracking-widest font-mono font-bold text-emerald-400 uppercase">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>Gemini 2.5 Pro Engined</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xl mb-6">
            Our multivar routing checks are processing coordinates and imagery through administrative boundary layers to establish immediate public-action requests.
          </p>

          {/* Stepper Pipeline */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isCompleted = idx < activeStep;
              const isActive = idx === activeStep;
              
              return (
                <div 
                  key={idx}
                  className={`flex gap-4 p-3 rounded-xl border transition-all duration-300 ${
                    isActive 
                      ? 'bg-slate-900 border-emerald-500/30' 
                      : isCompleted 
                        ? 'bg-slate-950/20 border-slate-800/40 opacity-80' 
                        : 'bg-slate-950/10 border-transparent opacity-40'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10 animate-scale" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-700" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold leading-none ${isActive ? 'text-emerald-400' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                      Step {idx + 1}: {isActive && (isRetrying || localIsRetrying) ? 'Retrying connection to Gemini...' : step.title}
                    </h4>
                    {isActive && (
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                        {step.desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {status === 'complete' && (
        <div className="flex items-center gap-4 py-2">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm uppercase tracking-wider font-display">Analysis Completed</h4>
            <p className="text-xs text-slate-400">The priorities and formal municipal letters are compiled below.</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-4 py-4 text-left border-l-4 border-red-500 pl-4 bg-red-950/10 rounded-r-xl">
          <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-red-400 font-display text-xs uppercase tracking-wider">Analysis Engine Suspended</h4>
            <p className="text-xs text-slate-300 mt-1">{errorMessage || 'An unknown network error stopped the municipal translation. Please try again.'}</p>
          </div>
        </div>
      )}
    </div>
  );
};
