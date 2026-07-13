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

type Tab =
  | 'dashboard'
  | 'projects'
  | 'blueprint'
  | 'estimation'
  | 'maintenance'
  | 'prices'
  | 'regions'
  | 'reports'
  | 'users'
  | 'system';

const TAB_TITLES: Record<Tab, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  blueprint: 'Blueprint Upload',
  estimation: 'Cost Estimation',
  maintenance: 'Maintenance',
  prices: 'Material Prices',
  regions: 'Regional Pricing',
  reports: 'Reports',
  users: 'User Management',
  system: 'System Settings',
};

// Demo users (in production these come from Supabase auth)
const DEMO_USERS: User[] = [
  { id: 'u-admin',  name: 'System Administrator', email: 'admin@blcts.ke',  role: 'Administrator' },
  { id: 'u-owner',  name: 'James Kariuki',         email: 'owner@blcts.ke',  role: 'Building Owner' },
  { id: 'u-fm',     name: 'Grace Wanjiku',         email: 'fm@blcts.ke',     role: 'Facility Manager' },
];

function App() {
  const [user, setUser]             = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('blcts_user') || 'null'); } catch { return null; }
  });
  const [isDark, setIsDark]         = useState(() => localStorage.getItem('blcts_dark') === 'true');
  const [activeTab, setActiveTab]   = useState<Tab>('dashboard');
  const [projects, setProjects]     = useState<Project[]>(() => {
    try { return JSON.parse(localStorage.getItem('blcts_projects') || '[]'); } catch { return []; }
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Persist projects to localStorage
  useEffect(() => {
    localStorage.setItem('blcts_projects', JSON.stringify(projects));
  }, [projects]);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('blcts_dark', String(isDark));
  }, [isDark]);

  function handleLogin(u: User) {
    setUser(u);
    localStorage.setItem('blcts_user', JSON.stringify(u));
    setActiveTab('dashboard');
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('blcts_user');
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

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
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
            <p>No project selected. <button className="text-emerald-500 hover:underline cursor-pointer" onClick={() => setActiveTab('projects')}>Go to Projects</button></p>
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
            <p>No project selected. <button className="text-emerald-500 hover:underline cursor-pointer" onClick={() => setActiveTab('projects')}>Go to Projects</button></p>
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
            <button onClick={() => setActiveTab('projects')} className="bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer">Go to Projects</button>
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
            <p>No project selected. <button className="text-emerald-500 hover:underline cursor-pointer" onClick={() => setActiveTab('projects')}>Go to Projects</button></p>
          </div>
        );

      case 'users':
        return (
          <div className="p-8 text-center">
            <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">User Management</h2>
              <p className="text-xs text-slate-500 mb-6">Demo accounts (production uses Supabase Auth):</p>
              {DEMO_USERS.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-2">
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.email}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    u.role === 'Administrator' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    u.role === 'Building Owner' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>{u.role}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="p-8 text-center">
            <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">System Settings</h2>
              <p className="text-xs text-slate-500">Supabase: Connected</p>
              <p className="text-xs text-slate-500 mt-1">Database: 4 tables active</p>
              <p className="text-xs text-slate-500 mt-1">regional_pricing: 10 rows</p>
              <p className="text-xs text-slate-500 mt-1">construction_materials: 44 rows</p>
            </div>
          </div>
        );

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

export default App;
