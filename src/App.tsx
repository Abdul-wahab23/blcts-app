import { useState, useEffect } from 'react';
import type { User, Project, BlueprintAnalysisResult } from './types';
import { AuthScreen } from './components/AuthScreen';
import { Layout } from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjectsPage from './components/ProjectsPage';
import BlueprintUpload from './components/BlueprintUpload';
import CostEstimationPage from './components/CostEstimationPage';
import MaintenancePage from './components/MaintenancePage';
import PricingAdminPage from './components/PricingAdminPage';
import ReportsPage from './components/ReportsPage';
import LandingPageNew from './components/LandingPageNew';

type Tab =
  | 'dashboard' | 'projects' | 'blueprint' | 'estimation'
  | 'maintenance' | 'prices' | 'regions' | 'reports'
  | 'users' | 'system';

const TAB_TITLES: Record<Tab, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  blueprint: 'Blueprint Analysis',
  estimation: 'Cost Estimation',
  maintenance: 'Maintenance',
  prices: 'Material Prices',
  regions: 'Regional Pricing',
  reports: 'Reports',
  users: 'User Management',
  system: 'System Settings',
};

function App() {
  const [showLanding, setShowLanding] = useState(() => {
    return !localStorage.getItem('blcts_user');
  });
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('blcts_user') || 'null'); } catch { return null; }
  });
  const [isDark, setIsDark] = useState(() => localStorage.getItem('blcts_dark') === 'true');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [projects, setProjects] = useState<Project[]>(() => {
    try { return JSON.parse(localStorage.getItem('blcts_projects') || '[]'); } catch { return []; }
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('blcts_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('blcts_dark', String(isDark));
  }, [isDark]);

  function handleLogin(u: User) {
    setUser(u);
    setShowLanding(false);
    localStorage.setItem('blcts_user', JSON.stringify(u));
    setActiveTab('dashboard');
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('blcts_user');
    setShowLanding(true);
    setActiveTab('dashboard');
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab as Tab);
  }

  function handleSelectProject(projectId: string) {
    setSelectedProjectId(projectId);
  }

  function handleUploadBlueprint(projectId: string) {
    setSelectedProjectId(projectId);
    setActiveTab('blueprint');
  }

  function handleViewEstimate(projectId: string) {
    setSelectedProjectId(projectId);
    setActiveTab('estimation');
  }

  function handleBlueprintConfirm(result: {
    floorAreaPerFloor: number;
    floors: number;
    buildingType: string;
    constructionStandard: string;
    county: string;
    blueprintAnalysis: BlueprintAnalysisResult;
  }) {
    if (!selectedProjectId) return;
    setProjects(prev => prev.map(p => p.id === selectedProjectId ? {
      ...p,
      floorAreaPerFloor: result.floorAreaPerFloor,
      floors: result.floors,
      buildingType: result.buildingType as Project['buildingType'],
      constructionStandard: result.constructionStandard as Project['constructionStandard'],
      county: result.county,
      blueprintAnalysis: result.blueprintAnalysis,
      updatedAt: new Date().toISOString(),
    } : p));
    setActiveTab('estimation');
  }

  function handleProjectUpdate(updated: Project) {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId) ?? projects[0] ?? null;

  if (showLanding) {
    return (
      <LandingPageNew
        isDark={isDark}
        onToggleDark={() => setIsDark(d => !d)}
        onLogin={() => setShowLanding(false)}
        onGetStarted={() => setShowLanding(false)}
      />
    );
  }

  if (!user) {
    return (
      <AuthScreen onLogin={handleLogin} />
    );
  }

  function renderContent() {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={user!}
            projects={projects}
            onNavigate={handleTabChange}
          />
        );

      case 'projects':
        return (
          <ProjectsPage
            projects={projects}
            currentUser={user!}
            onProjectsChange={setProjects}
            onSelectProject={handleSelectProject}
            onUploadBlueprint={handleUploadBlueprint}
            onViewEstimate={handleViewEstimate}
          />
        );

      case 'blueprint':
        return selectedProject ? (
          <BlueprintUpload
            project={selectedProject}
            onConfirm={handleBlueprintConfirm}
            onBack={() => setActiveTab('projects')}
          />
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>No project selected. <button className="text-emerald-600 hover:underline cursor-pointer font-medium" onClick={() => setActiveTab('projects')}>Go to Projects</button></p>
          </div>
        );

      case 'estimation':
        return selectedProject ? (
          <CostEstimationPage
            project={selectedProject}
            onGoToBlueprint={() => setActiveTab('blueprint')}
            onProjectUpdate={handleProjectUpdate}
          />
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>No project selected. <button className="text-emerald-600 hover:underline cursor-pointer font-medium" onClick={() => setActiveTab('projects')}>Go to Projects</button></p>
          </div>
        );

      case 'maintenance':
        return selectedProject ? (
          <MaintenancePage
            projectId={selectedProject.id}
            projectName={selectedProject.name}
            currentUser={user!}
          />
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-500 mb-4">Select a project to manage maintenance.</p>
            <button onClick={() => setActiveTab('projects')} className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer">Go to Projects</button>
          </div>
        );

      case 'prices':
        return <PricingAdminPage onBack={() => setActiveTab('dashboard')} />;

      case 'reports':
        return selectedProject ? (
          <ReportsPage
            project={selectedProject}
            onGoToEstimation={() => setActiveTab('estimation')}
          />
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>No project selected. <button className="text-emerald-600 hover:underline cursor-pointer font-medium" onClick={() => setActiveTab('projects')}>Go to Projects</button></p>
          </div>
        );

      case 'users':
        return <UserManagementSimple />;

      case 'system':
        return <SystemSettingsSimple />;

      default:
        return null;
    }
  }

  return (
    <Layout
      user={user}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      isDark={isDark}
      onToggleDark={() => setIsDark(d => !d)}
      pageTitle={TAB_TITLES[activeTab] || activeTab}
    >
      <div className="animate-fade-in">
        {renderContent()}
      </div>
    </Layout>
  );
}

// Simple inline User Management for Administrator
function UserManagementSimple() {
  const DEMO_USERS = [
    { id: 'demo-admin-001', name: 'Admin User', email: 'admin@blcts.ke', role: 'Administrator', organization: 'BLCTS HQ' },
    { id: 'demo-owner-001', name: 'James Kariuki', email: 'owner@blcts.ke', role: 'Building Owner', organization: 'Nairobi Properties Ltd' },
    { id: 'demo-fm-001', name: 'Grace Wanjiku', email: 'fm@blcts.ke', role: 'Facility Manager', organization: 'FM Services Kenya' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage system users and their role-based access permissions.</p>
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">System Accounts</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {DEMO_USERS.map(u => (
            <div key={u.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                {u.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{u.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{u.email} · {u.organization}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                u.role === 'Administrator' ? 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900/40' :
                u.role === 'Building Owner' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40' :
                'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40'
              }`}>{u.role}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Demo Mode: Use the login screen to switch between Administrator, Building Owner, and Facility Manager roles. Each role has different dashboard views and capabilities.</p>
      </div>
    </div>
  );
}

function SystemSettingsSimple() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform configuration and system information.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Database', value: 'Supabase PostgreSQL', status: 'Connected', color: 'green' },
          { label: 'AI Engine', value: 'Gemini 2.5 Flash', status: 'Active', color: 'blue' },
          { label: 'Pricing Data', value: '12 Counties', status: 'Loaded', color: 'green' },
          { label: 'Materials DB', value: '44 Items', status: 'Synced', color: 'green' },
          { label: 'BOQ Engine', value: 'v2.0 QS Standard', status: 'Ready', color: 'green' },
          { label: 'Safety Margin', value: 'KSh 20 per unit', status: 'Configured', color: 'amber' },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{item.label}</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-0.5">{item.value}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              item.color === 'green' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
              item.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
              'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
            }`}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
