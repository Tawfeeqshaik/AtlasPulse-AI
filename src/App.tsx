import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, storage } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useFirestore } from './hooks/useFirestore';
import { useGemini } from './hooks/useGemini';
import { useUserProfile } from './hooks/useUserProfile';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Issue } from './types/Issue';
import { FullGeminiAnalysis } from './types/GeminiAnalysis';
import { seedDemoData } from './lib/seedData';

// Pages import
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ReportIssue } from './pages/ReportIssue';
import { AIAnalysis } from './pages/AIAnalysis';
import { MunicipalActionRequest } from './pages/MunicipalActionRequest';
import { MapDashboard } from './pages/MapDashboard';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { MyReports } from './pages/MyReports';
import { Profile } from './pages/Profile';

// Icons import
import { 
  Building, 
  MapPin, 
  BarChart, 
  Sparkles, 
  LogOut, 
  User, 
  Compass, 
  Activity, 
  PlusSquare, 
  Cpu, 
  FileText 
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('landing');
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Firestore & Gemini hook channels
  const { issues, addIssue, updateIssueStatus, verifyIssue, refresh } = useFirestore();
  const { analyzeCivicIssue, analyzing, analysisError } = useGemini();
  const { userProfile, loading: userProfileLoading } = useUserProfile();

  // Active uploads vectors
  const [currentAnalysis, setCurrentAnalysis] = useState<FullGeminiAnalysis | null>(null);
  const [citizenNotes, setCitizenNotes] = useState('');
  const [selectedCoordinates, setSelectedCoordinates] = useState({ lat: 13.0405, lng: 80.2337 });
  const [selectedAddress, setSelectedAddress] = useState('');
  const [reportedCitizenName, setReportedCitizenName] = useState('Chennai Resident');

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        setIsGuestMode(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Periodic Firestore fetch refresh (every 30 seconds) to auto-update the map and dashboard views
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Triggering periodic 30-second Firestore issues refresh...');
      refresh().catch((err) => {
        console.error('Periodic refresh failed:', err);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [refresh]);

  // Run automated Firebase Self-Test on startup
  useEffect(() => {
    import('./lib/selfTest').then(({ runAutomatedSelfTest }) => {
      setTimeout(() => {
        runAutomatedSelfTest();
      }, 1500);
    });
  }, []);

  // Auto seed demo data on startup if empty
  useEffect(() => {
    const runSeed = async () => {
      try {
        await seedDemoData();
        console.log('Seed check complete');
      } catch (err) {
        console.error('Seed failed:', err);
      }
    };
    runSeed();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsGuestMode(false);
      setCurrentPage('landing');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleStartReporting = () => {
    // If not authenticated and not guest, redirect to login
    if (!user && !isGuestMode) {
      setCurrentPage('login');
    } else {
      setCurrentPage('report');
    }
  };

  // Triggers Gemini backend pipeline
  const [isSeeding, setIsSeeding] = useState(false); // Can be used for status tracking if needed

  const handleLaunchAnalysis = async (params: {
    imageBase64: string;
    notes: string;
    latitude: number;
    longitude: number;
    citizenName: string;
    address?: string;
    preAnalyzedResult?: FullGeminiAnalysis;
  }) => {
    (window as any).__last_reported_issue = params;
    setCitizenNotes(params.notes);
    setSelectedCoordinates({ lat: params.latitude, lng: params.longitude });
    setSelectedAddress(params.address || '');
    setReportedCitizenName(params.citizenName || 'Chennai Resident');
    setCurrentPage('ai-analysis');

    try {
      if (params.preAnalyzedResult) {
        params.preAnalyzedResult.localImageUrl = params.imageBase64;
        setCurrentAnalysis(params.preAnalyzedResult);
        return;
      }

      const result = await analyzeCivicIssue({
        imageBase64: params.imageBase64,
        notes: params.notes,
        latitude: params.latitude,
        longitude: params.longitude,
        citizenName: params.citizenName
      });

      // Inject base64 into analysis for local rendering inside card preview
      result.localImageUrl = params.imageBase64;
      setCurrentAnalysis(result);
    } catch (err) {
      console.error('Gemini vision analysis session failed.', err);
    }
  };

  // Registers finalized analyzed issue into firestore db
  const handleRegisterIssueInDb = async (finalIssue: Omit<Issue, 'id'>) => {
    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80';
      
      if (currentAnalysis?.localImageUrl) {
        if (currentAnalysis.localImageUrl.startsWith('data:')) {
          const userId = user?.uid || 'guest_id';
          const fileName = `${finalIssue.issueId}.png`;
          const uploadPath = `issues/${userId}/${fileName}`;
          console.log(`Uploading incident image to Firebase Storage: ${uploadPath}`);
          try {
            const uploadPromise = (async () => {
              const imageRef = ref(storage, uploadPath);
              await uploadString(imageRef, currentAnalysis.localImageUrl, 'data_url');
              return await getDownloadURL(imageRef);
            })();
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('TIMEOUT')), 2500);
            });
            finalImageUrl = await Promise.race([uploadPromise, timeoutPromise]);
            console.log('Firebase Storage upload successful. Public URL:', finalImageUrl);
          } catch (storageErr) {
            console.warn('Firebase Storage upload timed out, failed or unconfigured. Falling back to base64 storage.', storageErr);
            finalImageUrl = currentAnalysis.localImageUrl; // Fallback: host directly as base64 string
          }
        } else {
          finalImageUrl = currentAnalysis.localImageUrl;
        }
      }

      const fullIssueData = {
        ...finalIssue,
        imageUrl: finalImageUrl,
        userId: user?.uid || 'guest_id',
        createdBy: auth.currentUser?.uid || 'anonymous',
        createdByName: auth.currentUser?.displayName || 'Chennai Resident'
      };

      await addIssue(fullIssueData);
      
      // Clean up states and route to Live Map
      setCurrentAnalysis(null);
      setCitizenNotes('');
      setCurrentPage('map');
    } catch (err) {
      console.error('Firestore save failed', err);
      throw err;
    }
  };

  const handleVerifyIssue = async (issueId: string) => {
    if (!user) {
      setCurrentPage('login');
      return;
    }
    try {
      await verifyIssue(issueId, user.uid);
    } catch (err) {
      console.error('Verification failed', err);
    }
  };

  // Fast bypass for testing/evaluation
  const handleGuestBypass = () => {
    setIsGuestMode(true);
    setUser({
      uid: 'guest_101',
      displayName: 'Hackathon Evaluator',
      email: 'evaluator@hackathon.org'
    });
    setCurrentPage('landing');
  };

  return (
    <ErrorBoundary>
      <div className="font-sans antialiased text-slate-100 bg-slate-950 min-h-screen flex flex-col justify-between">
      
      {/* SaaS Application Header bar Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo brand */}
          <div 
            onClick={() => setCurrentPage('landing')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
            </div>
            <div className="text-left font-display">
              <h1 className="text-lg font-bold tracking-tight text-white uppercase leading-none">AtlasPulse <span className="text-emerald-500">AI</span></h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">Civic Escalation Protocol</p>
            </div>
          </div>

          {/* Page Routing Indicators */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest">
            <button
              onClick={() => setCurrentPage('landing')}
              className={`px-3 py-2 rounded-xl transition ${currentPage === 'landing' ? 'bg-slate-800 text-emerald-400 border border-slate-700/50' : 'hover:text-slate-100 text-slate-400'}`}
            >
              Start
            </button>
            <button
              onClick={() => setCurrentPage('map')}
              className={`px-3 py-2 rounded-xl transition ${currentPage === 'map' ? 'bg-slate-800 text-emerald-400 border border-slate-700/50' : 'hover:text-slate-100 text-slate-400'}`}
            >
              Live Grid
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={`px-3 py-2 rounded-xl transition ${currentPage === 'analytics' ? 'bg-slate-800 text-emerald-400 border border-slate-700/50' : 'hover:text-slate-100 text-slate-400'}`}
            >
              Executive Board
            </button>
            {user && (
              <>
                <button
                  onClick={() => setCurrentPage('my-reports')}
                  className={`px-3 py-2 rounded-xl transition ${currentPage === 'my-reports' ? 'bg-slate-800 text-emerald-400 border border-slate-700/50' : 'hover:text-slate-100 text-slate-400'}`}
                >
                  My Reports
                </button>
                <button
                  onClick={() => setCurrentPage('profile')}
                  className={`px-3 py-2 rounded-xl transition ${currentPage === 'profile' ? 'bg-slate-800 text-emerald-400 border border-slate-700/50' : 'hover:text-slate-100 text-slate-400'}`}
                >
                  Profile
                </button>
              </>
            )}
            <button
              onClick={handleStartReporting}
              className={`px-3.5 py-2 rounded-xl text-slate-950 font-bold bg-emerald-500 hover:bg-emerald-400 transition flex items-center gap-1 hover:shadow-md hover:shadow-emerald-500/10`}
            >
              <PlusSquare className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
          </nav>

          {/* Authenticated Account Details & Sys Live Indicator */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">System Live: Chennai</span>
            </div>

            {authLoading ? (
              <div className="w-6 h-6 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setCurrentPage('profile')}
                  className="text-emerald-400 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full text-xs cursor-pointer transition border border-emerald-500/10 flex items-center gap-1 hover:scale-105 active:scale-95"
                >
                  ⭐ {userProfile?.totalPoints || 0} Points
                </div>
                <div className="flex items-center gap-3 bg-slate-950 p-1.5 pr-3 rounded-2xl border border-slate-800">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left text-[11px] leading-tight max-w-[100px] truncate">
                  <div className="font-bold text-slate-200">{user.displayName || 'Authorized User'}</div>
                  <div className="text-slate-500 font-medium">GCC Grid Account</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Disconnect Console"
                  id="btn-logout"
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('login')}
                  id="btn-login-navigation"
                  className="text-xs font-bold uppercase tracking-widest px-4 py-2 text-slate-300 hover:text-white transition"
                >
                  Login
                </button>
                <button
                  onClick={() => setCurrentPage('signup')}
                  className="text-xs font-bold uppercase tracking-widest px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 rounded-xl border border-slate-700/60 transition"
                >
                  Register
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Small screen mobile ribbon */}
        <div className="md:hidden flex justify-around items-center h-11 bg-slate-950 border-t border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">
          <button onClick={() => setCurrentPage('landing')} className={`flex-1 h-full flex items-center justify-center border-r border-slate-900 ${currentPage === 'landing' ? 'text-emerald-400 bg-slate-900/40' : ''}`}>
            Home
          </button>
          <button onClick={() => setCurrentPage('map')} className={`flex-1 h-full flex items-center justify-center border-r border-slate-900 ${currentPage === 'map' ? 'text-emerald-400 bg-slate-900/40' : ''}`}>
            Map
          </button>
          {user && (
            <>
              <button onClick={() => setCurrentPage('my-reports')} className={`flex-1 h-full flex items-center justify-center border-r border-slate-900 ${currentPage === 'my-reports' ? 'text-emerald-400 bg-slate-900/40' : ''}`}>
                My Reports
              </button>
              <button onClick={() => setCurrentPage('profile')} className={`flex-1 h-full flex items-center justify-center border-r border-slate-900 ${currentPage === 'profile' ? 'text-emerald-400 bg-slate-900/40' : ''}`}>
                Profile
              </button>
            </>
          )}
          <button onClick={() => setCurrentPage('analytics')} className={`flex-1 h-full flex items-center justify-center border-r border-slate-900 ${currentPage === 'analytics' ? 'text-emerald-400 bg-slate-900/40' : ''}`}>
            Briefs
          </button>
          <button onClick={handleStartReporting} className={`flex-1 h-full flex items-center justify-center text-emerald-400 ${currentPage === 'report' ? 'bg-slate-900/40 font-extrabold' : ''}`}>
            + Report
          </button>
        </div>
      </header>

      {/* Main Coordination Frame containing views and templates */}
      <main className="flex-grow flex flex-col justify-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="w-full flex-grow flex flex-col justify-start"
          >
            {currentPage === 'landing' && (
              <Landing 
                onStart={handleStartReporting} 
                onNavigate={setCurrentPage} 
                totalIssues={issues.length} 
              />
            )}

            {currentPage === 'login' && (
              <Login 
                onSuccess={(usr) => {
                  setUser(usr);
                  setCurrentPage('report');
                }} 
                onNavigateToSignup={() => setCurrentPage('signup')}
                onBypass={handleGuestBypass}
              />
            )}

            {currentPage === 'signup' && (
              <Signup 
                onSuccess={(usr) => {
                  setUser(usr);
                  setCurrentPage('report');
                }} 
                onNavigateToLogin={() => setCurrentPage('login')}
                onBypass={handleGuestBypass}
              />
            )}

            {currentPage === 'report' && (
              <ReportIssue 
                userId={user?.uid}
                citizenName={user?.displayName}
                onAnalysisTriggered={handleLaunchAnalysis} 
              />
            )}

            {currentPage === 'ai-analysis' && (
              <AIAnalysis 
                analyzing={analyzing}
                error={analysisError}
                analysisResult={currentAnalysis}
                onContinue={() => setCurrentPage('action-letter')}
                onBack={() => setCurrentPage('report')}
              />
            )}

            {currentPage === 'action-letter' && currentAnalysis && (
              <MunicipalActionRequest 
                analysis={currentAnalysis}
                citizenNotes={citizenNotes}
                citizenName={reportedCitizenName}
                latitude={selectedCoordinates.lat}
                longitude={selectedCoordinates.lng}
                address={selectedAddress}
                onSave={handleRegisterIssueInDb}
                onCancel={() => {
                  setCurrentAnalysis(null);
                  setCitizenNotes('');
                  setCurrentPage('report');
                }}
              />
            )}

            {currentPage === 'map' && (
              <MapDashboard 
                issues={issues} 
                onSelectIssue={(issue) => {
                  // Reconstruct temporary analysis from issues data to render letter review
                  const mockAnalysis: FullGeminiAnalysis = {
                    issueId: issue.issueId,
                    vision: {
                      issueCategory: issue.category,
                      severityLevel: issue.severityLevel,
                      confidenceScore: issue.confidenceScore,
                      aiSummary: issue.aiSummary
                    },
                    priority: {
                      priorityScore: issue.priorityScore,
                      urgencyTier: issue.urgencyTier,
                      responsibleDepartment: issue.responsibleDepartment,
                      estimatedResolutionDays: issue.estimatedResolutionDays,
                      impactReason: issue.routingReason,
                      routingReason: issue.routingReason
                    },
                    officialLetter: '' // Will use fallback template inside component
                  };
                  setReportedCitizenName(issue.citizenName || 'Chennai Resident');
                  setCurrentAnalysis(mockAnalysis);
                  setCitizenNotes(issue.notes || '');
                  setSelectedCoordinates({ lat: issue.latitude, lng: issue.longitude });
                  setCurrentPage('action-letter');
                }}
                onVerify={handleVerifyIssue}
                currentUserId={user?.uid}
              />
            )}

            {currentPage === 'analytics' && (
              <AnalyticsDashboard issues={issues} />
            )}

            {currentPage === 'my-reports' && (
              <MyReports 
                issues={issues}
                currentUserId={user?.uid}
                onSelectIssue={(issue) => {
                  const mockAnalysis: FullGeminiAnalysis = {
                    issueId: issue.issueId,
                    vision: {
                      issueCategory: issue.category,
                      severityLevel: issue.severityLevel,
                      confidenceScore: issue.confidenceScore,
                      aiSummary: issue.aiSummary
                    },
                    priority: {
                      priorityScore: issue.priorityScore,
                      urgencyTier: issue.urgencyTier,
                      responsibleDepartment: issue.responsibleDepartment,
                      estimatedResolutionDays: issue.estimatedResolutionDays,
                      impactReason: issue.routingReason,
                      routingReason: issue.routingReason
                    },
                    officialLetter: ''
                  };
                  setReportedCitizenName(issue.citizenName || 'Chennai Resident');
                  setCurrentAnalysis(mockAnalysis);
                  setCitizenNotes(issue.notes || '');
                  setSelectedCoordinates({ lat: issue.latitude, lng: issue.longitude });
                  setCurrentPage('action-letter');
                }}
                onUpdateStatus={updateIssueStatus}
                onNavigate={setCurrentPage}
                onVerify={handleVerifyIssue}
              />
            )}

            {currentPage === 'profile' && (
              <Profile 
                userProfile={userProfile}
                issues={issues}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modern Developer footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 text-center text-xs text-slate-5050 text-slate-500 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wide uppercase text-slate-400">AtlasPulse AI</span>
            <span className="text-slate-600">|</span>
            <span>Civic automated routing matrix</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Chennai Grid Coordination Port (3000)</span>
            <span>Engineered with Gemini 2.5 Pro Vision & Firestore</span>
          </div>
        </div>
      </footer>

    </div>
    </ErrorBoundary>
  );
}
