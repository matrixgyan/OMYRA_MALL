import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OmyraAuthViewProps {
  onAuthSuccess: (user: any) => void;
  initialMode?: 'login' | 'register' | 'forgot' | 'reset' | 'verify' | 'recovery';
}

export default function OmyraAuthView({ onAuthSuccess, initialMode = 'login' }: OmyraAuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset' | 'verify' | 'recovery'>(initialMode);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Clear messages on transition
  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        onAuthSuccess(data.session.user);
      } else {
        setError(data.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err) {
      setError('A secure communication error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide an email address and set a secure password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg('Your account has been registered! Logging you in...');
        // Auto-login on registration
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (loginData.success) {
          setTimeout(() => {
            onAuthSuccess(loginData.session.user);
          }, 1500);
        } else {
          setMode('login');
        }
      } else {
        setError(data.error || 'Registration failed. This email may already be in use.');
      }
    } catch (err) {
      setError('A secure communication error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please specify the email address registered to your account.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message || 'If that email is registered, we have sent a reset code.');
        setMode('reset');
      } else {
        setError(data.error || 'Failed to initiate password reset.');
      }
    } catch (err) {
      setError('Could not connect to OMYRA Auth. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !password) {
      setError('Both the verification token and your new password are required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Password successfully updated.');
        setTimeout(() => {
          handleModeChange('login');
        }, 2000);
      } else {
        setError(data.error || 'Invalid or expired password reset token.');
      }
    } catch (err) {
      setError('Could not connect to OMYRA Auth. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please provide a valid verification token.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Your email address has been successfully verified.');
        setTimeout(() => {
          handleModeChange('login');
        }, 2000);
      } else {
        setError(data.error || 'Verification failed. Token may be invalid or expired.');
      }
    } catch (err) {
      setError('Could not connect to OMYRA Auth. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="omyra-auth-viewport" className="w-full max-w-md mx-auto my-8">
      
      {/* Auth Card Container */}
      <div className="rounded-[40px] border border-white/10 bg-[#161618] overflow-hidden p-8 md:p-10 relative">
        {/* Ambient glow accent behind container */}
        <div className="absolute top-[-20%] left-[-20%] h-60 w-60 rounded-full bg-[#D4FF5E]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] h-60 w-60 rounded-full bg-[#D4FF5E]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Header Segment */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#D4FF5E]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#D4FF5E] border border-[#D4FF5E]/20">
              <Sparkles className="h-3 w-3" />
              OMYRA Identity Server
            </span>
            <h2 className="text-2xl font-black uppercase tracking-widest text-white mt-2">
              {mode === 'login' && 'Sign In'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Reset Request'}
              {mode === 'reset' && 'Set Password'}
              {mode === 'verify' && 'Verify Email'}
              {mode === 'recovery' && 'Account Recovery'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {mode === 'login' && 'Access OMYRA MALL with your secure cloud credentials.'}
              {mode === 'register' && 'Register your decentralized shopping identity.'}
              {mode === 'forgot' && 'We will send a validation code to recover your vault.'}
              {mode === 'reset' && 'Provide your reset token and enter your new password.'}
              {mode === 'verify' && 'Verify your email address to complete secure activation.'}
              {mode === 'recovery' && 'Restore access using your secure multi-factor backup parameters.'}
            </p>
          </div>

          {/* Feedback boxes */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15 text-xs text-rose-400 font-semibold"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-start gap-2.5 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-400 font-semibold"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORMS LAYER */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full rounded-2xl border border-white/10 bg-[#0A0A0B] py-3 pl-11 pr-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none focus:ring-1 focus:ring-[#D4FF5E] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                  <button 
                    type="button"
                    onClick={() => handleModeChange('forgot')}
                    className="text-[10px] font-black uppercase tracking-widest text-[#D4FF5E] hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-[#0A0A0B] py-3 pl-11 pr-11 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none focus:ring-1 focus:ring-[#D4FF5E] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#D4FF5E] hover:bg-[#c3ec4e] disabled:bg-slate-850 disabled:text-slate-500 py-3.5 text-xs font-black uppercase tracking-widest text-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? 'Authenticating...' : 'Sign In Now'}
                {!loading && <ArrowRight className="h-3.5 w-3.5" />}
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('register')}
                  className="font-black text-[#D4FF5E] hover:underline cursor-pointer"
                >
                  Create one here
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Full Name / Nickname</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-2xl border border-white/10 bg-[#0A0A0B] py-3 pl-11 pr-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full rounded-2xl border border-white/10 bg-[#0A0A0B] py-3 pl-11 pr-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Set Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-[#0A0A0B] py-3 pl-11 pr-11 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#D4FF5E] hover:bg-[#c3ec4e] disabled:bg-slate-850 disabled:text-slate-500 py-3.5 text-xs font-black uppercase tracking-widest text-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? 'Creating Vault...' : 'Create Account'}
                {!loading && <ArrowRight className="h-3.5 w-3.5" />}
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="font-black text-[#D4FF5E] hover:underline cursor-pointer"
                >
                  Log in here
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full rounded-2xl border border-white/10 bg-[#0A0A0B] py-3 pl-11 pr-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#D4FF5E] hover:bg-[#c3ec4e] disabled:bg-slate-850 disabled:text-slate-500 py-3.5 text-xs font-black uppercase tracking-widest text-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? 'Processing...' : 'Send Recovery Token'}
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex justify-between px-1">
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="font-black text-[#D4FF5E] hover:underline cursor-pointer"
                >
                  Back to Log In
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('recovery')}
                  className="font-black text-slate-400 hover:text-[#D4FF5E] cursor-pointer"
                >
                  MFA recovery?
                </button>
              </div>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Recovery Token</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full rounded-2xl border border-white/10 bg-[#0A0A0B] py-3 pl-11 pr-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">New Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-[#0A0A0B] py-3 pl-11 pr-11 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#D4FF5E] hover:bg-[#c3ec4e] disabled:bg-slate-850 disabled:text-slate-500 py-3.5 text-xs font-black uppercase tracking-widest text-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? 'Updating Password...' : 'Save Password'}
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="font-black text-[#D4FF5E] hover:underline cursor-pointer"
                >
                  Back to Log In
                </button>
              </div>
            </form>
          )}

          {mode === 'verify' && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Activation Token</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter email verification token"
                    className="w-full rounded-2xl border border-white/10 bg-[#0A0A0B] py-3 pl-11 pr-4 text-xs text-white placeholder-slate-700 focus:border-[#D4FF5E] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#D4FF5E] hover:bg-[#c3ec4e] disabled:bg-slate-850 disabled:text-slate-500 py-3.5 text-xs font-black uppercase tracking-widest text-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? 'Activating...' : 'Verify Email Address'}
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="font-black text-[#D4FF5E] hover:underline cursor-pointer"
                >
                  Back to Log In
                </button>
              </div>
            </form>
          )}

          {mode === 'recovery' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 rounded-3xl bg-[#0A0A0B] border border-white/5">
                <ShieldAlert className="h-8 w-8 text-[#D4FF5E]" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Cryptographic Recovery</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">
                    OMYRA Auth enforces absolute decentralized ownership. If credentials are lost and backup codes are missing, contact the security group directly.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-300">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Multi-Factor Backup Options:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Retrieve emergency recovery seed</li>
                  <li>Scan security passkey or hardware key</li>
                  <li>Verify external authentication app (TOTP)</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleModeChange('login')}
                  className="flex-1 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 py-3 text-xs font-black uppercase tracking-widest text-white transition-all cursor-pointer text-center"
                >
                  Back
                </button>
                <a
                  href="mailto:security@mall.omyra.org"
                  className="flex-1 rounded-2xl bg-[#D4FF5E] hover:bg-[#c3ec4e] py-3 text-xs font-black uppercase tracking-widest text-black transition-all text-center"
                >
                  Contact Security
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
