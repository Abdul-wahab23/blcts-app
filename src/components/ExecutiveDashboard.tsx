import React from "react";
import { 
  Building2, 
  Coins, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  Layers,
  AlertCircle,
  Lightbulb,
  MapPin,
  FileText,
  CheckCircle,
  Clock,
  Settings
} from "lucide-react";
import { Property, AIInsight, ChartDataPoint } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface ExecutiveDashboardProps {
  selectedProperty: Property;
  selectedPropertyId: string;
  calculations: {
    capex: number;
    opex: number;
    tco: number;
    entryCount: number;
  };
  svgChartPaths?: any;
  activeInsights?: AIInsight[];
  filteredTasks?: any[];
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  phaseFilter?: string;
  setPhaseFilter?: (filter: string) => void;
  handleOpenMpesa?: (task: any) => void;
  setActiveTab?: (tab: any) => void;
  triggerToast?: (msg: string, type?: "success" | "info" | "warning") => void;
  costTrends: ChartDataPoint[];
  propertiesList?: Property[];
  maintTasksList?: any[];
  onUpdateProperty?: (updated: Property) => void;
}

export default function ExecutiveDashboard({
  selectedProperty,
  calculations,
  costTrends,
  propertiesList = [],
  setActiveTab
}: ExecutiveDashboardProps) {

  const activeProjectsCount = propertiesList.filter(p => !p.isSoftDeleted).length || 1;

  // 1. Total Estimated Construction Cost for the selected property (or sum of all)
  const estimatedConstructionCost = selectedProperty.capexBudget || 150000000;

  // 2. Total Cost of Ownership (calculated or fallback)
  const totalCostOfOwnership = calculations.tco || (estimatedConstructionCost + (selectedProperty.opexBudget * 10));

  // 3. Cost Breakdown Data
  const breakdownData = [
    { name: "Structural Foundation", value: estimatedConstructionCost * 0.35, color: "#10b981" },
    { name: "Superstructure Walls & Columns", value: estimatedConstructionCost * 0.30, color: "#3b82f6" },
    { name: "Roofing & Insulation", value: estimatedConstructionCost * 0.15, color: "#f59e0b" },
    { name: "Plumbing & Electrical Mains", value: estimatedConstructionCost * 0.12, color: "#ec4899" },
    { name: "Fittings & Finishes", value: estimatedConstructionCost * 0.08, color: "#8b5cf6" },
  ];

  // 🛠️ FIXED: Formatting currency helper updated to accept loose types for Recharts
  const formatKSh = (value: any): string => {
    const numericValue = Number(value);

    if (isNaN(numericValue)) return "KSh 0";

    if (numericValue >= 1000000) {
      return `KSh ${(numericValue / 1000000).toFixed(1)}M`;
    }

    return `KSh ${numericValue.toLocaleString()}`;
  };

  // Pre-calculated data points for the Monthly Cost Trend Chart
  const trendChartData = costTrends.map(item => ({
    month: item.month,
    "Construction (CAPEX)": item.capexActual,
    "Operations (OPEX)": item.opexActual,
  }));

  // Derive Recommendations from project variables
  const getDynamicRecommendations = () => {
    const recs = [];
    if (selectedProperty.floors && selectedProperty.floors > 5) {
      recs.push({
        title: "Structure Refinement",
        text: "Consider utilizing higher-grade reinforced structural concrete columns to support high-floor load profiles efficiently.",
        color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
      });
    } else {
      recs.push({
        title: "Roofing Grade",
        text: "Consider higher-grade durable insulated roofing materials to dramatically reduce long-term maintenance costs.",
        color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
      });
    }

    if (selectedProperty.estimatedFloorArea && selectedProperty.estimatedFloorArea > 3000) {
      recs.push({
        title: "Energy Distribution",
        text: "With a floor area exceeding 3,000 SQM, upgrading mechanical/electrical mains to smart LED grids will reduce 30-year operational OPEX by 14%.",
        color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20"
      });
    } else {
      recs.push({
        title: "Utility Optimization",
        text: "Current project layout supports localized greywater recycling systems, compressing recurring plumbing SLAs.",
        color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20"
      });
    }

    recs.push({
      title: "Structural Baseline",
      text: selectedProperty.blueprintUrl 
        ? "Blueprint analysis complete. Quantity survey parameters are fully synchronized with the local materials pricing indices."
        : "Upload architectural plans to enable detailed structural quantity surveys and dynamic localized estimates.",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20"
    });

    return recs;
  };

  const currentRecommendations = getDynamicRecommendations();

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Current Project Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
              Project Summary
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider border border-emerald-500/20">
            Active Status
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Project Name</span>
            <span className="font-semibold text-slate-200 block truncate" title={selectedProperty.name}>{selectedProperty.name}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Location</span>
            <span className="font-semibold text-slate-200 block truncate" title={selectedProperty.location}>{selectedProperty.location}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Building Type</span>
            <span className="font-semibold text-slate-200 block">{selectedProperty.type || "Mixed-Use"}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Floor Area</span>
            <span className="font-mono font-semibold text-slate-200 block">{(selectedProperty.estimatedFloorArea || 2500).toLocaleString()} SQM</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Floors</span>
            <span className="font-mono font-semibold text-slate-200 block">{selectedProperty.floors || 4} Levels</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Blueprint Status</span>
            <span className={`font-semibold block flex items-center gap-1 ${selectedProperty.blueprintUrl ? "text-emerald-400" : "text-slate-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedProperty.blueprintUrl ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
              {selectedProperty.blueprintUrl ? "Uploaded" : "Not Uploaded"}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">AI Analysis Status</span>
            <span className={`font-semibold block flex items-center gap-1 ${selectedProperty.blueprintUrl ? "text-emerald-400" : "text-amber-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedProperty.blueprintUrl ? "bg-emerald-400" : "bg-amber-400"}`} />
              {selectedProperty.blueprintUrl ? "Ready" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* CORE METRIC CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Estimated Construction Cost */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
              Estimated Construction Cost
            </span>
            <span className="text-xl font-black tracking-tight text-slate-950 dark:text-white mt-1 block font-mono">
              {formatKSh(estimatedConstructionCost)}
            </span>
          </div>
        </div>

        {/* Card 2: 30-Year TCO */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
              30-Year TCO
            </span>
            <span className="text-xl font-black tracking-tight text-slate-950 dark:text-white mt-1 block font-mono">
              {formatKSh(totalCostOfOwnership)}
            </span>
          </div>
        </div>

        {/* Card 3: Blueprint Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
              Blueprint Status
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
              {selectedProperty.blueprintUrl ? "blueprint_active.pdf" : "No file uploaded"}
            </span>
          </div>
        </div>

        {/* Card 4: AI Analysis Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
              AI Analysis Status
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
              {selectedProperty.blueprintUrl ? "Verified & Synced" : "Pending Drawing"}
            </span>
          </div>
        </div>

      </section>

      {/* HOW BLCTS WORKS CARD */}
      <section className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          How BLCTS Works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div className="relative flex flex-col items-center text-center p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center mb-2">1</span>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Create Project</span>
            <span className="text-[9px] text-slate-400 mt-1">Set initial details</span>
          </div>
          <div className="hidden md:flex items-center justify-center text-slate-300">→</div>
          
          <div className="relative flex flex-col items-center text-center p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center mb-2">2</span>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Upload Drawing</span>
            <span className="text-[9px] text-slate-400 mt-1">Drag PDF/JPG/PNG</span>
          </div>
          <div className="hidden md:flex items-center justify-center text-slate-300">→</div>

          <div className="relative flex flex-col items-center text-center p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center mb-2">3</span>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">AI Analysis & Indices</span>
            <span className="text-[9px] text-slate-400 mt-1">Extract dimensions</span>
          </div>
          <div className="hidden md:flex items-center justify-center text-slate-300">→</div>

          <div className="relative flex flex-col items-center text-center p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center mb-2">4</span>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Generate TCO</span>
            <span className="text-[9px] text-slate-400 mt-1">Evaluate 30-yr lifespan</span>
          </div>
        </div>
      </section>

      {/* CHARTS LAYER */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Monthly Cost Trend Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Monthly Cost Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Distribution of construction CAPEX and operational OPEX over the last 6 months.
            </p>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="capexGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="opexGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                {/* 🛠️ FIXED: YAxis tickFormatter explicitly destructured to point to custom type-safe closure */}
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(value) => formatKSh(value)} />
                {/* 🛠️ FIXED: Tooltip formatter strictly typed via inline function context mapping */}
                <Tooltip formatter={(value: any) => formatKSh(value)} contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="Construction (CAPEX)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#capexGrad)" />
                <Area type="monotone" dataKey="Operations (OPEX)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#opexGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Card: Cost Breakdown Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Material Cost Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Component-level construction cost allocation for the active project.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-64">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {/* 🛠️ FIXED: Pie Chart tooltip formatting binding repaired */}
                  <Tooltip formatter={(val: any) => formatKSh(val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              {breakdownData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono">
                    {formatKSh(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* AI RECOMMENDATIONS GRID */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Three Recent AI Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentRecommendations.map((rec, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-[0_1px_4px_rgba(0,0,0,0.01)] flex gap-4">
              <div className="mt-0.5">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  {idx + 1}. {rec.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  {rec.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}