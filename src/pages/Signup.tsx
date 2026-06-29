import React, { useState } from 'react';
import { auth, db, loginWithGoogle } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ShieldAlert, User, Mail, Lock, Sparkles, Chrome } from 'lucide-react';

interface SignupProps {
  onSuccess: (user: any) => void;
  onNavigateToLogin: () => void;
  onBypass: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSuccess, onNavigateToLogin, onBypass }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !password) {
      setError('Please fill in all requested fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Profile displayName
      await updateProfile(user, { displayName });

      // Save user profile profile details in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName,
        email,
        createdAt: new Date().toISOString(),
        role: "citizen",
        reportsSubmitted: 0
      });

      onSuccess(user);
    } catch (err: any) {
      console.error('Firebase registration error:', err);
      let msg = 'Failed to register account due to a network or connection issue. Please check your connection and try again.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Email already exists. This email is already registered on AtlasPulse.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Weak password. The password must contain at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email. The email format entered is invalid.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is disabled. Please go to your Firebase Console > Authentication > Sign-in method, and enable "Email/Password".';
      } else if (err.code === 'auth/configuration-not-found') {
        msg = 'Firebase Authentication is not enabled for this project. Please go to your Firebase Console, click on "Authentication" in the left-hand menu, and click "Get Started" to activate it.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network failure. A connection error occurred while communicating with Firebase services.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      if (user) {
        // Since they signed in with Google, they already have a display name and email.
        // Let's make sure they have a profile doc in Firestore if they don't already have one!
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName || "Google Citizen",
          email: user.email || "",
          createdAt: new Date().toISOString(),
          role: "citizen",
          reportsSubmitted: 0
        }, { merge: true });

        onSuccess(user);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      let readableMsg = 'Google registration failed.';
      if (err.code === 'auth/popup-blocked') {
        readableMsg = 'Popup blocked by browser. Please enable popups for this site.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        readableMsg = 'Authentication was cancelled.';
      } else if (err.code === 'auth/configuration-not-found') {
        readableMsg = 'Google Sign-In is not enabled for this project. Please go to your Firebase Console, click on "Authentication" in the left-hand menu, and click "Get Started" to activate it.';
      } else if (err.message) {
        readableMsg = err.message;
      }
      setError(readableMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-16 flex flex-col justify-center min-h-[calc(100vh-200px)] relative z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 shadow-2xl relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-2xl" />

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 mb-3">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-100 uppercase tracking-wide">Register Account</h2>
          <p className="text-xs text-slate-400 mt-1">SaaS Portal • Chennai Regional Grid</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/15 border border-red-500/20 text-red-400 text-xs text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-display">Your Display Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-5050 text-slate-500" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Adyar Resident"
                id="signup-name"
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-display">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-550 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@localhost.com"
                id="signup-email"
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-display">Password Secret Code</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                id="signup-password"
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="signup-submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs tracking-widest uppercase rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.01] transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Creating Credentials...' : 'Register In Grid'}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700/40"></div></div>
            <div className="relative text-[10px] uppercase text-slate-500 font-bold bg-[#1e293b] px-2.5 inline-block z-10">Or Connected Provider</div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            id="signup-google"
            className="w-full py-3 bg-slate-900 text-slate-200 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-slate-950 font-semibold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Chrome className="w-4 h-4 text-emerald-400" />
            <span>Register with Google</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700/50 text-center space-y-4">
          <p className="text-xs text-slate-400">
            Already registered?{' '}
            <button
              onClick={onNavigateToLogin}
              className="text-emerald-400 font-bold hover:underline"
            >
              Sign In Here
            </button>
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700/40"></div></div>
            <div className="relative text-[10px] uppercase text-slate-500 font-bold bg-[#1e293b] px-2.5 inline-block z-10">Bypass Portal</div>
          </div>

          <button
            onClick={onBypass}
            id="btn-bypass-auth-signup"
            className="w-full py-2.5 bg-slate-900 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700/60 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
          >
            <span className="flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Continue as Hackathon Guest (Simulate Auth)</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
