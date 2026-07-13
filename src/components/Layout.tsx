import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  Map,
  Settings,
  Calculator,
  FileText,
  Wrench,
  Layers,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
} from 'lucide-react';
import type { User, UserRole } from '../types';
import { Badge } from './ui/Badge';

// ─── Nav item definition ───────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[] | 'all';
  separator?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  // All roles
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: 'all' },
  { id: 'projects', label: 'Projects', icon: Building2, roles: 'all' },

  // Admin only
  { id: 'users', label: 'Users', icon: Users, roles: ['Administrator'] },
  { id: 'material-prices', label: 'Material Prices', icon: Package, roles: ['Administrator'] },
  { id: 'regional-pricing', label: 'Regional Pricing', icon: Map, roles: ['Administrator'] },
  { id: 'system', label: 'System', icon: Settings, roles: ['Administrator'] },

  // Building Owner only
  { id: 'cost-estimation', label: 'Cost Estimation', icon: Calculator, roles: ['Building Owner'] },

  // Facility Manager only
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, roles: ['Facility Manager'] },
  { id: 'assets', label: 'Assets', icon: Layers, roles: ['Facility Manager'] },

  // All roles — separator before
  { id: 'reports', label: 'Reports', icon: FileText, roles: 'all', separator: true },
];

// ─── Role → Badge color ────────────────────────────────────────────────────────
const ROLE_BADGE_COLOR: Record<UserRole, 'purple' | 'blue' | 'green'> = {
  Administrator: 'purple',
  'Building Owner': 'blue',
  'Facility Manager': 'green',
};

// ─── Page title map ────────────────────────────────────────────────────────────
const PAGE_TITLE: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  users: 'Users',
  'material-prices': 'Material Prices',
  'regional-pricing': 'Regional Pricing',
  system: 'System Settings',
  'cost-estimation': 'Cost Estimation',
  reports: 'Reports',
  maintenance: 'Maintenance',
  assets: 'Assets',
};

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  children: ReactNode;
  isDark: boolean;
  onToggleDark: () => void;
  pageTitle?: string;
}

export function Layout({
  user,
  activeTab,
  onTabChange,
  onLogout,
  children,
  isDark,
  onToggleDark,
  pageTitle,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter nav items for this user's role
  const visibleItems = NAV_ITEMS.filter(
    (item) => item.roles === 'all' || item.roles.includes(user.role)
  );

  const currentTitle = pageTitle ?? PAGE_TITLE[activeTab] ?? activeTab;

  // Derive first visible non-separator for fallback breadcrumb root
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm shadow-emerald-200/60 dark:shadow-emerald-900/40 flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
            BLCTS
          </span>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none tracking-wide truncate">
            Lifecycle Cost Tracking
          </p>
        </div>
      </div>

      {/* User info */}
      <div className="flex items-start gap-3 px-4 py-4 mx-3 mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-sm flex-shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
            {user.name}
          </p>
          {user.organization && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
              {user.organization}
            </p>
          )}
          <div className="mt-1.5">
            <Badge label={user.role} color={ROLE_BADGE_COLOR[user.role]} />
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id}>
              {/* Optional separator */}
              {item.separator && (
                <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
              )}
              <button
                onClick={() => {
                  onTabChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0 opacity-70" />
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-sm z-20">
        {sidebarContent}
      </aside>

      {/* ── Mobile sidebar overlay ───────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col
          bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-xl
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm z-10 flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
              BLCTS
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:block flex-shrink-0" />
            <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {currentTitle}
            </h1>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Dark mode toggle */}
            <button
              onClick={onToggleDark}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User avatar (desktop) */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-xs flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 max-w-[120px] truncate">
                {user.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
