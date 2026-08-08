import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, AlertCircle, LogIn, UserPlus, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
}) => {
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
    setIsUnauthorizedDomain(false);
    setIsOperationNotAllowed(false);
  };

  const handleTabSwitch = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError(null);
    setIsUnauthorizedDomain(false);
    setIsOperationNotAllowed(false);
  };

  const handleCopyDomain = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  const mapFirebaseError = (errMessage: string) => {
    if (errMessage.includes('auth/operation-not-allowed')) {
      setIsOperationNotAllowed(true);
      return 'Authentication sign-in method is disabled in Firebase Console.';
    }
    setIsOperationNotAllowed(false);

    if (errMessage.includes('auth/unauthorized-domain')) {
      setIsUnauthorizedDomain(true);
      return 'Google Sign-In is restricted to authorized domains in Firebase Console. You can sign up/in instantly with Email & Password below, or add this domain to your Firebase Console settings.';
    }
    setIsUnauthorizedDomain(false);

    if (errMessage.includes('auth/invalid-credential') || errMessage.includes('auth/wrong-password') || errMessage.includes('auth/user-not-found')) {
      return 'Invalid email or password. Please try again.';
    }
    if (errMessage.includes('auth/email-already-in-use')) {
      return 'An account with this email address already exists. Please sign in instead.';
    }
    if (errMessage.includes('auth/weak-password')) {
      return 'Password should be at least 6 characters long.';
    }
    if (errMessage.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (errMessage.includes('auth/popup-closed-by-user')) {
      return 'Google sign-in popup was closed.';
    }
    return errMessage || 'An unexpected authentication error occurred.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name or display name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(email.trim(), password);
      } else {
        await signup(name.trim(), email.trim(), password);
      }
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(mapFirebaseError(err?.message || 'Authentication failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(mapFirebaseError(err?.message || 'Google sign-in failed.'));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-[#EBE9E4] overflow-hidden z-10 my-8">
        
        {/* Header */}
        <div className="p-6 bg-[#5A7D55] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
              Community Food Share
            </span>
            <h2 className="text-xl font-bold font-serif mt-0.5">
              {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#EBE9E4] bg-[#F9F9F7] p-1.5 gap-1">
          <button
            type="button"
            onClick={() => handleTabSwitch('signin')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'signin'
                ? 'bg-white text-[#5A7D55] shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('signup')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'signup'
                ? 'bg-white text-[#5A7D55] shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>

              {isUnauthorizedDomain && currentHostname && (
                <div className="pt-2 border-t border-rose-200/80 space-y-2 text-stone-700">
                  <div className="flex items-center justify-between bg-white/80 p-2 rounded-xl border border-rose-200 gap-2">
                    <span className="font-mono text-[11px] text-stone-800 truncate font-semibold">
                      {currentHostname}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyDomain}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {copiedDomain ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Domain</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-normal">
                    💡 <strong>Tip:</strong> You can sign in or sign up with <strong>Email & Password</strong> right now without setting up custom domains in Firebase!
                  </p>
                </div>
              )}

              {isOperationNotAllowed && (
                <div className="pt-2 border-t border-rose-200/80 space-y-1.5 text-stone-700 text-[11px] leading-relaxed">
                  <p>
                    <strong>How to fix in Firebase Console:</strong>
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-stone-600">
                    <li>Go to <strong>Firebase Console &gt; Authentication &gt; Sign-in method</strong>.</li>
                    <li>Click on <strong>Email/Password</strong> (or <strong>Google</strong>) and enable it.</li>
                    <li>Save changes and try signing in again.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Full Name Input (Sign Up Only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name or Preferred Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EBE9E4] bg-[#F9F9F7] text-sm text-[#2D3436] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A7D55]/30 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Email Address Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EBE9E4] bg-[#F9F9F7] text-sm text-[#2D3436] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A7D55]/30 focus:bg-white"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-[#EBE9E4] bg-[#F9F9F7] text-sm text-[#2D3436] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A7D55]/30 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 rounded-full text-sm font-semibold text-white bg-[#5A7D55] hover:bg-[#4A6946] shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : mode === 'signin' ? (
              <span>Sign In</span>
            ) : (
              <span>Create Account</span>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EBE9E4]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full py-2.5 px-4 rounded-full border border-[#EBE9E4] bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Account</span>
          </button>

          {/* Bottom Switcher Footer text */}
          <div className="pt-2 text-center text-xs text-stone-500">
            {mode === 'signin' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('signup')}
                  className="text-[#5A7D55] font-bold hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('signin')}
                  className="text-[#5A7D55] font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
