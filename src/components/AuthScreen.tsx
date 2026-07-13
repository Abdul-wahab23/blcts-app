import { useState } from 'react';
import { Building2, Eye, EyeOff, LogIn } from 'lucide-react';
import type { User } from '../types';

// ─── Demo accounts ────────────────────────────────────────────────────────────
const DEMO_ACCOUNTS: (User & { password: string })[] = [
  {
    id: 'demo-admin-001',
    name: 'Admin User',
    email: 'admin@blcts.ke',
    password: 'admin123',
    role: 'Administrator',
    organization: 'BLCTS HQ',
  },
  {
    id: 'demo-owner-001',
    name: 'Building Owner',
    email: 'owner@blcts.ke',
    password: 'owner123',
    role: 'Building Owner',
    organization: 'Nairobi Properties Ltd',
  },
  {
    id: 'demo-fm-001',
    name: 'Facility Manager',
    email: 'fm@blcts.ke',
    password: 'fm123',
    role: 'Facility Manager',
    organization: 'FM Services Kenya',
  },
];

const ROLE_COLOR: Record<string, string> = {
  Administrator:
    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900/40',
  'Building Owner':
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40',
  'Facility Manager':
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40',
};

interface Props {
  onLogin: (user: User) => void;
}

export function AuthScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a brief async check
    setTimeout(() => {
      const match = DEMO_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
      );

      if (!match) {
        setError('Invalid email or password. Try one of the demo accounts below.');
        setLoading(false);
        return;
      }

      // Build User (strip password)
      const user: User = {
        id: match.id,
        name: match.name,
        email: match.email,
        role: match.role,
        organization: match.organization,
      };

      // Persist to localStorage so the app can restore session
      localStorage.setItem('blcts_user', JSON.stringify(user));
      onLogin(user);
      setLoading(false);
    }, 400);
  };

  const autofill = (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-900 p-4">
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/40">
            <Building2 className="w-8 h-8 text-white" strokeWidth={1.75} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              BLCTS
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tracking-wide">
              Building Lifecycle Cost Tracking System
            </p>
          </div>
        </div>

        {/* Login form card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/80 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 p-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
            Sign in to your account
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Use your credentials or a demo account below.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-lg px-3 py-2.5">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-900/50 disabled:cursor-not-allowed text-white font-semibold text-sm transition shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30 mt-1"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-6">
          <p className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Demo accounts — click to autofill
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => autofill(account)}
                className="flex flex-col items-start gap-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/60 transition text-left group"
              >
                {/* Role badge */}
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${ROLE_COLOR[account.role]}`}
                >
                  {account.role === 'Administrator'
                    ? 'Admin'
                    : account.role === 'Building Owner'
                    ? 'Owner'
                    : 'FM'}
                </span>

                <div className="w-full">
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                    {account.email}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 tracking-wide">
                    {account.password}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-4">
            New accounts are created by an Administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
