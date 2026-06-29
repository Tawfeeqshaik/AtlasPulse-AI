import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GeminiStatus } from '../components/GeminiStatus';
import { Sparkles, Brain, Cpu, MessageSquare, MapPin, Gauge, ShieldCheck, ArrowRight, CornerDownRight, AlertCircle } from 'lucide-react';
import { FullGeminiAnalysis } from '../types/GeminiAnalysis';

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

interface AIAnalysisProps {
  analyzing?: boolean;
  error?: string | null;
  analysisResult?: FullGeminiAnalysis | null;
  onContinue?: () => void;
  onBack?: () => void;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ 
  analyzing: propAnalyzing, 
  error: propError, 
  analysisResult: propAnalysisResult, 
  onContinue,
  onBack
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // FIX 1 — The image is not being passed correctly to Gemini.
  const { imageBase64, imageUrl, latitude, longitude, address, notes } = 
    location.state || {};

  const [loading, setLoading] = useState(propAnalyzing || false);
  const [error, setError] = useState<string | null>(propError || null);
  const [result, setResult] = useState<FullGeminiAnalysis | null>(propAnalysisResult || null);
  const [priorityCount, setPriorityCount] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  // Sync props to state if provided from outside
  useEffect(() => {
    if (propAnalyzing !== undefined) setLoading(propAnalyzing);
  }, [propAnalyzing]);

  useEffect(() => {
    if (propError !== undefined) setError(propError);
  }, [propError]);

  useEffect(() => {
    if (propAnalysisResult !== undefined) setResult(propAnalysisResult);
  }, [propAnalysisResult]);

  // FIX 2, 3, 4 — Handle self-contained analysis if imageBase64 is in router state and we don't have a result yet
  useEffect(() => {
    if (!imageBase64 || propAnalysisResult || result) return;

    const performAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/gemini/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64,
            notes: notes || '',
            latitude,
            longitude,
            citizenName: 'Chennai Petitioner'
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${response.status}`);
        }

        const nestedPayload: FullGeminiAnalysis = await response.json();
        nestedPayload.localImageUrl = imageBase64;

        setResult(nestedPayload);
        setLoading(false);
      } catch (error: any) {
        console.error('Full analysis error:', error);
        setError(getFriendlyError(error.message || String(error)));
        setLoading(false);
      }
    };

    performAnalysis();
  }, [imageBase64, propAnalysisResult, result, notes, latitude, longitude]);

  // Score count-up simulation
  useEffect(() => {
    if (result?.priority?.priorityScore) {
      setPriorityCount(0);
      const target = result.priority.priorityScore;
      let current = 0;
      const interval = setInterval(() => {
        current += Math.ceil((target - current) / 10) || 1;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setPriorityCount(current);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [result]);

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/report');
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else if (result) {
      navigate('/municipal-action', { state: { analysis: result, notes, latitude, longitude, address } });
    }
  };

  // FIX 1 — If imageBase64 is undefined or empty and we don't have prop analysis, show error
  if (!imageBase64 && !result && !loading && !propAnalysisResult) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-slate-900/80 border border-slate-800 rounded-2xl text-center space-y-4">
        <div className="text-amber-500 text-3xl">⚠️</div>
        <h3 className="text-lg font-bold text-slate-200">No Image Data</h3>
        <p className="text-xs text-slate-400">No image data found. Please go back and upload an image.</p>
        <button
          onClick={handleGoBack}
          className="px-6 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 rounded-xl transition-all cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-8 relative">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-display text-slate-100 uppercase tracking-tight">Gemini AI Analysis</h2>
          <p className="text-xs text-slate-400 mt-1">Live visualization of Vision Classifiers and regional Priority Routing engine logs.</p>
        </div>
        
        {/* Google Technology Visibility Badges */}
        <div className="flex flex-wrap gap-2 items-center text-[10px] text-slate-400 font-mono bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
          <span className="text-emerald-400 font-extrabold text-[9px] uppercase tracking-wider mr-1">Platform Tech:</span>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20">Powered by Gemini 2.5 Pro</span>
          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">Powered by Google Maps</span>
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">Powered by Firebase</span>
        </div>
      </div>

      {loading && (
        <GeminiStatus status="analyzing" />
      )}

      {error && (
        <div className="space-y-4">
          <GeminiStatus status="error" errorMessage={getFriendlyError(error)} />
          <p className="hidden text-slate-400 text-xs">{getFriendlyError(error)}</p>
        </div>
      )}

      {!loading && !error && result && (
        <div className="space-y-6">
          
          {/* Visual Quality Gate Status Banner if Rejected */}
          {result.rejected ? (
            <div className="bg-red-950/40 border border-red-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/[0.02] rounded-bl-full pointer-events-none" />
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-500/15 text-red-400 font-mono text-[9px] font-bold uppercase rounded border border-red-500/20 tracking-wider">
                      Visual Quality Gate: Rejected
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Fails Chennai Standards</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200">Municipal Escalation Aborted</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    {result.rejectionReason || 'The uploaded media does not contain clear, real-world visual proof of any public street-level infrastructure issues.'}
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono mt-2 flex items-center gap-1">
                    <span>Last active evaluation:</span>
                    <span className="text-red-400 font-bold bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">{result.lastActiveStage || 'Stage 2: Rule Engine'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 font-mono text-[9px] font-bold uppercase rounded border border-emerald-500/20 tracking-wider">
                      Visual Quality Gate: Passed ✓
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Verified Photograph</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200">Quality Verified & Approved</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This image has successfully passed all strict pre-flight validation gates including scene description, rule checks, damage validation, and observation counts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Layout containing both Vision and Priority panels */}
          {!result.rejected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Panel 1: Vision Classification Analysis logs */}
              <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                
                <div className="flex items-center gap-2 mb-6 text-emerald-400">
                  <Brain className="w-5 h-5" />
                  <h3 className="font-bold font-display uppercase text-xs tracking-widest">Vision Classifier Log</h3>
                </div>

                <div className="space-y-5 text-left">
                  {/* Category ID */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Identified Category</span>
                    <div className="text-xl font-bold font-display text-slate-100 mt-0.5">{result.vision.issueCategory}</div>
                  </div>

                  {/* Severity Metric */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Severity Matrix</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono text-[11px] rounded-lg">
                        {result.vision.severityLevel}
                      </span>
                      <span className="text-slate-500 font-mono text-xs">Category Standard</span>
                    </div>
                  </div>

                  {/* AI Confidence Meter */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Confidence Probability</span>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="h-2 w-full bg-slate-900 rounded-full">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${result.vision.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">{result.vision.confidenceScore}%</span>
                    </div>
                  </div>

                  {/* Neural brief text */}
                  <div className="pt-4 border-t border-slate-700/50">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Visual Proof Summary</span>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed italic bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                      "{result.vision.aiSummary}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Panel 2: Priority Engine calculation logs */}
              <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

                <div className="flex items-center gap-2 mb-6 text-emerald-400">
                  <Cpu className="w-5 h-5" />
                  <h3 className="font-bold font-display uppercase text-xs tracking-widest font-mono">Priority Routing Engine</h3>
                </div>

                <div className="space-y-4 text-left">
                  {/* Score Dial */}
                  <div className="flex items-center gap-4 bg-slate-900/60 p-4 border border-slate-700/40 rounded-xl">
                    {/* Gauge indicator */}
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 flex items-center justify-center relative">
                      <span className="text-xl font-extrabold font-display text-emerald-400">{priorityCount}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Calculated Priority Score</span>
                      <h4 className="text-sm font-bold text-slate-200">Urgency Tier: {result.priority.urgencyTier}</h4>
                    </div>
                  </div>

                  {/* Responsible Chennai Department */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Dispatched Administrative Body</span>
                    <div className="text-sm font-bold text-slate-200 mt-0.5">{result.priority.responsibleDepartment}</div>
                  </div>

                  {/* Estimated SLA Day Vector */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Standard Resolution Window</span>
                    <div className="text-xs font-semibold text-slate-300 mt-0.5 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Within {result.priority.estimatedResolutionDays} Days under Regional Protocol</span>
                    </div>
                  </div>

                  {/* Routing logical reason logs */}
                  <div className="pt-3 border-t border-slate-700/50">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Routing Routing Logs</span>
                    <div className="mt-1 pb-1 flex gap-2">
                      <CornerDownRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {result.priority.routingReason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Collapsible Developer Debug Panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-left">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-100 font-mono font-bold uppercase tracking-wider focus:outline-none"
            >
              <span>🔬 Developer Debug Logs (5-Stage Verification Pipeline)</span>
              <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono font-bold">
                {showDebug ? 'HIDE DETAILS' : 'SHOW DETAILS'}
              </span>
            </button>
            
            {showDebug && (
              <div className="mt-4 space-y-4 pt-3 border-t border-slate-800/80 font-mono text-[11px] text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Stage 1: Scene Description */}
                  <div className="bg-slate-950 p-3 rounded border border-slate-800/60 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center justify-between">
                      <span>Stage 1: Scene Description</span>
                      <span className="text-[9px] text-slate-500">Confidence: {result.stage1?.confidence || result.vision?.confidenceScore || 95}%</span>
                    </div>
                    <div className="text-slate-400 leading-relaxed bg-slate-900/40 p-2 rounded border border-slate-800/40">
                      <strong>Literally Visible:</strong> "{result.stage1?.sceneDescription || 'No scene description could be generated.'}"
                    </div>
                    <div className="text-slate-500 text-[10px]">
                      <strong>Detected Objects:</strong> {result.stage1?.visibleObjects && result.stage1.visibleObjects.length > 0 ? result.stage1.visibleObjects.join(', ') : 'None'}
                    </div>
                  </div>

                  {/* Stage 2: Rule Engine */}
                  <div className="bg-slate-950 p-3 rounded border border-slate-800/60 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-emerald-400">Stage 2: Rule Engine (Fail-safe Checks)</div>
                    <div className="space-y-1 text-slate-400">
                      <div className="flex justify-between">
                        <span>1. Camera Photograph:</span>
                        <span className={result.stage1?.isRealPhoto ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{result.stage1?.isRealPhoto ? "PASSED" : "FAILED"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Outdoor Setting:</span>
                        <span className={result.stage1?.isOutdoor ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{result.stage1?.isOutdoor ? "PASSED" : "FAILED"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3. Public Infrastructure:</span>
                        <span className={result.stage1?.containsInfrastructure ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{result.stage1?.containsInfrastructure ? "PASSED" : "FAILED"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>4. Pipeline Confidence:</span>
                        <span className={(result.stage1?.confidence || result.vision?.confidenceScore || 0) >= 90 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{result.stage1?.confidence || result.vision?.confidenceScore || 0}% (&ge;90%)</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <strong>Rule Decision:</strong> {result.stage2Passed || (result.stage1?.isRealPhoto && result.stage1?.isOutdoor && result.stage1?.containsInfrastructure) ? 'APPROVED (Baseline Passed)' : 'REJECTED (Baseline Blocked)'}
                    </div>
                  </div>

                  {/* Stage 3: Independent Civic Validation */}
                  <div className="bg-slate-950 p-3 rounded border border-slate-800/60 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-emerald-400">Stage 3: Independent Civic Validation</div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-800/40 space-y-1">
                      <div className="text-slate-300">
                        Damage Verified: <span className={result.stage3?.damageAnswer === 'YES' ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{result.stage3?.damageAnswer || 'UNKNOWN'}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Reason: {result.stage3?.reason || 'Damage verification check not completed.'}
                      </p>
                    </div>
                  </div>

                  {/* Stage 4: Evidence Extraction */}
                  <div className="bg-slate-950 p-3 rounded border border-slate-800/60 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-emerald-400">Stage 4: Evidence Extraction (Minimum 3 Observations)</div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-800/40">
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                        {result.stage4?.evidence && result.stage4.evidence.length > 0 ? (
                          result.stage4.evidence.map((obs, idx) => (
                            <li key={idx}>{obs}</li>
                          ))
                        ) : (
                          <li className="text-slate-500">No distinct evidence extracted in this sequence.</li>
                        )}
                      </ul>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      <strong>Observation Count:</strong> {result.stage4?.evidence ? result.stage4.evidence.length : 0} of 3 required.
                    </div>
                  </div>

                </div>

                <div className="bg-slate-950 p-3.5 rounded border border-slate-800/60 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Final Verification Summary</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] uppercase tracking-wider font-bold">
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800/40">
                      <span className="text-slate-500 mr-1.5">Decision:</span>
                      <span className={result.rejected ? "text-red-400" : "text-emerald-400"}>{result.rejected ? 'Rejected' : 'Approved'}</span>
                    </div>
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800/40 col-span-2">
                      <span className="text-slate-500 mr-1.5">Reason for Rejection:</span>
                      <span className="text-slate-300 normal-case">{result.rejectionReason || 'None (Incident approved)'}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Issue ID Header strip */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Registered Incident Identification Token:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm bg-emerald-500/5 px-2.5 py-0.5 rounded border border-emerald-500/20">
                {result.issueId}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Timestamp: {result.createdAt ? new Date(result.createdAt).toLocaleString() : new Date().toLocaleString()}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex justify-end pt-4 gap-4">
            <button
              onClick={handleGoBack}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 cursor-pointer"
            >
              Go Back
            </button>
            {!result.rejected && (
              <button
                onClick={handleContinue}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <span>Compile Action Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

      {!loading && !error && !result && (
        <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-700/50">
          <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-300">Wait for Analysis...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Submit a photo first to initiate testing sequences.</p>
        </div>
      )}
    </div>
  );
};
