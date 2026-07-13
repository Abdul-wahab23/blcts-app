import { useState } from 'react';
import { Building2, ArrowRight, ChevronRight, ChartBar as BarChart3, Cpu, FileText, MapPin, Wrench, Shield, Moon, Sun, CircleCheck as CheckCircle2, Users, TrendingUp, DollarSign, TriangleAlert as AlertTriangle, Clock, Layers, Star } from 'lucide-react';

interface Props {
  isDark: boolean;
  onToggleDark: () => void;
  onLogin: () => void;
  onGetStarted: () => void;
}

export default function LandingPageNew({ isDark, onToggleDark, onLogin, onGetStarted }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const features = [
    {
      icon: Cpu,
      title: 'AI Blueprint Analysis',
      desc: 'Upload architectural drawings and extract building parameters using Gemini AI — floor area, type, observations — with honest confidence scoring.',
      color: 'blue',
    },
    {
      icon: BarChart3,
      title: 'Quantity Survey Engine',
      desc: 'Transparent BOQ generation across 14 construction sections. Every line item shows quantity, unit, rate, and amount. No black boxes.',
      color: 'emerald',
    },
    {
      icon: DollarSign,
      title: 'Total Cost of Ownership',
      desc: 'Automatically calculate 30-year lifecycle costs including maintenance, utilities, inspections, and replacements with inflation modeling.',
      color: 'amber',
    },
    {
      icon: MapPin,
      title: 'Regional Price Intelligence',
      desc: 'County-specific pricing across 12 Kenyan regions. Material, labour, and service rates with real multipliers and base costs per m².',
      color: 'teal',
    },
    {
      icon: Wrench,
      title: 'Maintenance Management',
      desc: '8-stage maintenance workflow: Create → Pending → Assigned → In-Progress → Completed → Verified → Cost Recorded → Lifecycle Updated.',
      color: 'orange',
    },
    {
      icon: FileText,
      title: 'Engineering Reports',
      desc: 'Export full BOQ reports as CSV with project details, cost breakdown, BOQ summary, lifecycle costs, and AI observations.',
      color: 'violet',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      desc: 'Three distinct roles: Administrator manages pricing and users. Building Owner runs estimates. Facility Manager handles maintenance.',
      color: 'red',
    },
    {
      icon: TrendingUp,
      title: 'Lifecycle Charting',
      desc: 'Interactive charts showing 30-year cumulative cost projections, annual OPEX breakdown, and cost distribution by construction section.',
      color: 'sky',
    },
  ];

  const workflow = [
    { step: '01', title: 'Register Project', desc: 'Define building details: type, location, county, construction standard, floors.' },
    { step: '02', title: 'Upload Blueprint', desc: 'Upload PDF/PNG/JPG architectural drawings for AI-assisted parameter extraction.' },
    { step: '03', title: 'Confirm Parameters', desc: 'Review AI observations, confirm or adjust GFA, floors, and building type.' },
    { step: '04', title: 'Generate BOQ', desc: 'Run the QS engine against regional pricing to produce itemized Bill of Quantities.' },
    { step: '05', title: 'View Lifecycle Cost', desc: 'See 30-year TCO with inflation-adjusted OPEX, maintenance, and replacement costs.' },
    { step: '06', title: 'Export & Report', desc: 'Download full engineering report as CSV. Print-ready for stakeholders.' },
  ];

  const stats = [
    { value: '12', label: 'Kenyan Counties', sub: 'Regional pricing coverage' },
    { value: '44', label: 'Material Items', sub: 'Live price database' },
    { value: '14', label: 'BOQ Sections', sub: 'Per QS standard' },
    { value: '30yr', label: 'Lifecycle Projection', sub: 'With inflation modeling' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    violet: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">

        {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40">
                <Building2 className="w-5 h-5 text-white" strokeWidth={1.75} />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">BLCTS</span>
                <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 ml-2">Building Lifecycle Cost Tracking</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleDark}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={onLogin}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
              >
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 pt-20 pb-24 px-4 sm:px-6">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/6 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
              Academic Research Project — University of Nairobi
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-none mb-6">
              Building Lifecycle<br />
              <span className="text-emerald-600 dark:text-emerald-400">Cost Tracking System</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8">
              An AI-assisted enterprise platform eliminating <strong className="text-slate-800 dark:text-slate-200">first-cost bias</strong> in Kenyan construction.
              From blueprint upload to 30-year lifecycle projections — transparent, honest, and data-driven.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-base font-semibold px-8 py-3.5 rounded-xl shadow-md shadow-emerald-200 dark:shadow-emerald-900/40 transition"
              >
                Start Demo <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-base font-semibold px-8 py-3.5 rounded-xl transition"
              >
                Sign In
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map((s, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center shadow-sm">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{s.value}</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{s.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WORKFLOW ───────────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">6-Step Workflow</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">From Blueprint to TCO in Minutes</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto text-sm">The complete cost engineering workflow — visible at every step, honest about every assumption.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workflow.map((item, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className={`relative bg-white dark:bg-slate-900 border rounded-xl p-6 transition-all cursor-default ${
                    hovered === i
                      ? 'border-emerald-300 dark:border-emerald-700 shadow-md shadow-emerald-100 dark:shadow-emerald-900/20'
                      : 'border-slate-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="absolute top-4 right-5 text-3xl font-black text-slate-100 dark:text-slate-800 font-mono select-none">{item.step}</div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 text-sm font-black ${
                    hovered === i ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  } transition-colors`}>
                    {i + 1}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  {i < workflow.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Platform Capabilities</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Everything a Quantity Surveyor Needs</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto text-sm">Built to NCA/BORAQS professional standards with transparent calculations and real Kenyan market data.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[f.color]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">{f.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── ROLES ──────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">Role-Based Access</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Three Roles, One System</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  role: 'Administrator',
                  color: 'violet',
                  email: 'admin@blcts.ke',
                  password: 'admin123',
                  icon: Shield,
                  capabilities: [
                    'Manage user accounts',
                    'Configure material prices',
                    'Set regional pricing multipliers',
                    'View all projects and reports',
                    'System settings and audit logs',
                  ],
                },
                {
                  role: 'Building Owner',
                  color: 'blue',
                  email: 'owner@blcts.ke',
                  password: 'owner123',
                  icon: Building2,
                  capabilities: [
                    'Register building projects',
                    'Upload architectural blueprints',
                    'Run AI blueprint analysis',
                    'Generate BOQ estimates',
                    'View lifecycle cost reports',
                  ],
                },
                {
                  role: 'Facility Manager',
                  color: 'emerald',
                  email: 'fm@blcts.ke',
                  password: 'fm123',
                  icon: Wrench,
                  capabilities: [
                    'Create maintenance tasks',
                    'Assign and track work orders',
                    'Record actual costs',
                    'Generate maintenance reports',
                    'Update lifecycle cost data',
                  ],
                },
              ].map(r => {
                const Icon = r.icon;
                const bc: Record<string, string> = {
                  violet: 'border-violet-200 dark:border-violet-900/40',
                  blue: 'border-blue-200 dark:border-blue-900/40',
                  emerald: 'border-emerald-200 dark:border-emerald-900/40',
                };
                const ic: Record<string, string> = {
                  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
                  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                };
                const tc: Record<string, string> = {
                  violet: 'text-violet-700 dark:text-violet-400',
                  blue: 'text-blue-700 dark:text-blue-400',
                  emerald: 'text-emerald-700 dark:text-emerald-400',
                };
                return (
                  <div key={r.role} className={`bg-white dark:bg-slate-900 border ${bc[r.color]} rounded-xl p-6 shadow-sm`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${ic[r.color]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className={`text-base font-bold mb-1 ${tc[r.color]}`}>{r.role}</h3>
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2.5 mb-4 text-xs font-mono">
                      <p className="text-slate-500 dark:text-slate-400">{r.email}</p>
                      <p className="text-slate-400 dark:text-slate-500">{r.password}</p>
                    </div>
                    <ul className="space-y-1.5">
                      {r.capabilities.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${tc[r.color]}`} />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PROBLEM STATEMENT ──────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-4">The Problem BLCTS Solves</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">First-Cost Bias is Costing Kenya Billions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {[
                { icon: AlertTriangle, title: 'Short-Sighted Decisions', desc: 'Developers choose cheapest initial cost — ignoring 30× higher operational costs over the building lifetime.', color: 'text-red-600' },
                { icon: Clock, title: 'Hidden Lifecycle Costs', desc: 'A cheap corrugated roof at KSh 3.2M leads to KSh 24M in maintenance over 10 years. Nobody models this upfront.', color: 'text-amber-600' },
                { icon: Users, title: 'No Standard Tooling', desc: 'Kenyan QS professionals lack accessible, standardized tools for transparent BOQ and lifecycle cost generation.', color: 'text-blue-600' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm text-left">
                    <Icon className={`w-6 h-6 mb-3 ${item.color}`} />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-6">
              <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">
                <strong>BLCTS</strong> provides construction professionals with a transparent, AI-assisted platform to model Total Cost of Ownership from day one —
                making lifecycle economics visible before ground is broken.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-emerald-600 to-emerald-700">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black text-white mb-4">Ready to Model Your Building's True Cost?</h2>
            <p className="text-emerald-100 mb-8 leading-relaxed">
              Upload a blueprint, enter project parameters, and get a complete Bill of Quantities with 30-year lifecycle projections in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-base px-8 py-3.5 rounded-xl shadow transition"
              >
                Start Free Demo <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-emerald-400 text-white font-bold text-base px-8 py-3.5 rounded-xl hover:bg-emerald-500/20 transition"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <footer className="py-10 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">BLCTS</p>
                <p className="text-xs text-slate-400">Building Lifecycle Cost Tracking System</p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs text-slate-400">Academic Research Project · University of Nairobi · 2026</p>
              <p className="text-xs text-slate-400 mt-0.5">Eliminating first-cost bias in Kenyan construction</p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
