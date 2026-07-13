import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileCheck, AlertTriangle, CheckCircle2, ChevronRight, X, ArrowLeft, Loader2, Eye } from 'lucide-react';
import { analyzeBlueprint } from '../lib/gemini';
import { StepBar } from './ui/StepBar';
import type { Project, BlueprintAnalysisResult, BuildingType, ConstructionStandard } from '../types';

interface Props {
  project: Project;
  onConfirm: (result: {
    floorAreaPerFloor: number;
    floors: number;
    buildingType: string;
    constructionStandard: string;
    county: string;
    blueprintAnalysis: BlueprintAnalysisResult;
  }) => void;
  onBack: () => void;
}

type Stage = 'idle' | 'file-selected' | 'analyzing' | 'complete' | 'error' | 'manual';

const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Busia', 'Thika', 'Meru', 'Nyeri', 'Machakos',
];
const BUILDING_TYPES = [
  'Residential', 'Maisonette', 'Apartment', 'Commercial', 'Office',
  'Mixed-Use', 'Warehouse', 'School', 'Hospital', 'Industrial',
];
const STANDARDS = ['Economy', 'Standard', 'Premium', 'Luxury'];

const STEP_LABELS = [
  'Upload File', 'Validate', 'Read File', 'AI Analysis', 'Extract GFA',
  'Building Type', 'Finish Standard', 'Regional Prices', 'Labour Rates',
  'QS Calculations', 'BOQ', 'Construction Cost', 'Lifecycle Cost', 'Report', 'Complete',
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildStepStatuses(stage: Stage, analysisStep: number): Array<'completed' | 'active' | 'pending'> {
  const total = STEP_LABELS.length; // 15

  if (stage === 'idle') {
    return STEP_LABELS.map((_, i) => (i === 0 ? 'active' : 'pending'));
  }

  if (stage === 'file-selected') {
    return STEP_LABELS.map((_, i) => {
      if (i <= 1) return 'completed';
      if (i === 2) return 'active';
      return 'pending';
    });
  }

  if (stage === 'analyzing') {
    const capped = Math.min(analysisStep, 13);
    return STEP_LABELS.map((_, i) => {
      if (i < capped) return 'completed';
      if (i === capped) return 'active';
      return 'pending';
    });
  }

  if (stage === 'complete') {
    return STEP_LABELS.map(() => 'completed');
  }

  if (stage === 'error') {
    const capped = Math.min(analysisStep, 13);
    return STEP_LABELS.map((_, i) => {
      if (i < capped) return 'completed';
      if (i === capped) return 'active';
      return 'pending';
    });
  }

  if (stage === 'manual') {
    return STEP_LABELS.map((_, i) => (i === 0 ? 'completed' : 'pending'));
  }

  return STEP_LABELS.map(() => 'pending');
}

function getCurrentStepLabel(stage: Stage, analysisStep: number): string {
  if (stage === 'idle') return STEP_LABELS[0];
  if (stage === 'file-selected') return STEP_LABELS[2];
  if (stage === 'analyzing') return STEP_LABELS[Math.min(analysisStep, 13)];
  if (stage === 'complete') return STEP_LABELS[14];
  if (stage === 'error') return STEP_LABELS[Math.min(analysisStep, 13)];
  if (stage === 'manual') return STEP_LABELS[1];
  return STEP_LABELS[0];
}

export default function BlueprintUpload({ project, onConfirm, onBack }: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BlueprintAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationError, setValidationError] = useState('');
  const [analysisStep, setAnalysisStep] = useState(0);

  // Manual / confirmed form fields
  const [manualFloorArea, setManualFloorArea] = useState(String(project.floorAreaPerFloor ?? ''));
  const [manualFloors, setManualFloors] = useState(String(project.floors ?? ''));
  const [manualBuildingType, setManualBuildingType] = useState<string>(project.buildingType ?? 'Residential');
  const [manualStandard, setManualStandard] = useState<string>(project.constructionStandard ?? 'Standard');
  const [manualCounty, setManualCounty] = useState(project.county ?? 'Nairobi');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File validation & selection ──────────────────────────────────────────

  const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  const ALLOWED_EXTS = ['.pdf', '.png', '.jpg', '.jpeg'];
  const MAX_SIZE = 15 * 1024 * 1024; // 15 MB

  const validateAndSetFile = useCallback((file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTS.includes(ext)) {
      setValidationError('Invalid file type. Please upload a PDF, PNG, JPG, or JPEG.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setValidationError('File exceeds the 15 MB limit. Please upload a smaller file.');
      return;
    }
    setValidationError('');
    setSelectedFile(file);
    setStage('file-selected');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  }, [validateAndSetFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  }, [validateAndSetFile]);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setStage('idle');
    setValidationError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ── Analysis ─────────────────────────────────────────────────────────────

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setStage('analyzing');
    setAnalysisStep(0);
    setErrorMsg('');

    // Animate steps 0→3 while reading / before AI call
    let currentStep = 0;
    const preInterval = setInterval(() => {
      currentStep += 1;
      if (currentStep <= 3) {
        setAnalysisStep(currentStep);
      } else {
        clearInterval(preInterval);
      }
    }, 600);

    try {
      const base64data = await readFileAsBase64(selectedFile);

      // Ensure we've shown at least step 3 before proceeding
      clearInterval(preInterval);
      setAnalysisStep(3);

      const result = await analyzeBlueprint(base64data, selectedFile.type, selectedFile.name);

      // Animate steps 4→13 quickly
      let postStep = 4;
      await new Promise<void>((resolve) => {
        const postInterval = setInterval(() => {
          setAnalysisStep(postStep);
          postStep += 1;
          if (postStep > 13) {
            clearInterval(postInterval);
            resolve();
          }
        }, 100);
      });

      setAnalysisResult(result);
      setStage('complete');

      // Pre-fill form from analysis result
      setManualFloorArea(
        result.estimatedFloorArea != null
          ? String(result.estimatedFloorArea)
          : String(project.floorAreaPerFloor ?? '')
      );
      setManualFloors(
        result.floors != null
          ? String(result.floors)
          : String(project.floors ?? '')
      );
      setManualBuildingType(result.buildingType ?? project.buildingType ?? 'Residential');
      setManualStandard(project.constructionStandard ?? 'Standard');
      setManualCounty(project.county ?? 'Nairobi');
    } catch (err: any) {
      clearInterval(preInterval);
      setErrorMsg(err?.message ?? 'An unexpected error occurred during analysis.');
      setStage('error');
    }
  }, [selectedFile, project]);

  const handleSkipToManual = useCallback(() => {
    setManualFloorArea(String(project.floorAreaPerFloor ?? ''));
    setManualFloors(String(project.floors ?? ''));
    setManualBuildingType(project.buildingType ?? 'Residential');
    setManualStandard(project.constructionStandard ?? 'Standard');
    setManualCounty(project.county ?? 'Nairobi');
    setStage('manual');
  }, [project]);

  // ── Confirm ──────────────────────────────────────────────────────────────

  const handleConfirm = useCallback(() => {
    if (!manualFloorArea || Number(manualFloorArea) <= 0) {
      alert('Please enter a valid floor area per floor.');
      return;
    }
    if (!manualFloors || Number(manualFloors) <= 0) {
      alert('Please enter a valid number of floors.');
      return;
    }

    const fallbackResult: BlueprintAnalysisResult = {
      estimatedFloorArea: null,
      floors: null,
      buildingType: null,
      confidence: null,
      observations: [],
      isFallback: true,
    };

    onConfirm({
      floorAreaPerFloor: Number(manualFloorArea),
      floors: Number(manualFloors),
      buildingType: manualBuildingType,
      constructionStandard: manualStandard,
      county: manualCounty,
      blueprintAnalysis: analysisResult ?? fallbackResult,
    });
  }, [manualFloorArea, manualFloors, manualBuildingType, manualStandard, manualCounty, analysisResult, onConfirm]);

  // ── Derived ──────────────────────────────────────────────────────────────

  const stepStatuses = buildStepStatuses(stage, analysisStep);
  const currentStepLabel = getCurrentStepLabel(stage, analysisStep);

  const showUploadZone = stage === 'idle' || stage === 'file-selected';
  const showAnalyzeButton = stage === 'file-selected';
  const showLoading = stage === 'analyzing';
  const showResults = stage === 'complete' || stage === 'error';
  const showManualForm = stage === 'complete' || stage === 'manual' || stage === 'error';

  const isFallback = analysisResult?.isFallback ?? false;
  const confidence = analysisResult?.confidence ?? null;

  const confidenceColor =
    confidence == null ? 'bg-slate-400'
    : confidence > 0.8 ? 'bg-green-500'
    : confidence > 0.6 ? 'bg-amber-500'
    : 'bg-red-500';

  const progressPct = Math.round((analysisStep / 14) * 100);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Blueprint Analysis</h1>
            <p className="text-xs text-slate-500">{project.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* StepBar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <StepBar steps={STEP_LABELS.map((label, i) => ({ label, status: stepStatuses[i] }))} compact={true} />
          <p className="text-xs text-slate-500 mt-2 text-center font-medium tracking-wide uppercase">
            {currentStepLabel}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">

          {/* ── Upload Zone ───────────────────────────────────────────────── */}
          {showUploadZone && (
            <div className="mb-6">
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all select-none
                  ${dragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-base font-semibold text-slate-700 mb-1">
                  Drag &amp; drop your blueprint here
                </p>
                <p className="text-sm text-slate-500 mb-3">or click to browse files</p>
                <p className="text-xs text-slate-400">Supported: PDF, PNG, JPG · Max 15 MB</p>
              </div>

              {/* Selected file indicator */}
              {selectedFile && (
                <div className="mt-3 flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <FileCheck className="w-5 h-5 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-green-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleClearFile(); }}
                    className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Validation error */}
              {validationError && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
          )}

          {/* ── Analyze Button ────────────────────────────────────────────── */}
          {showAnalyzeButton && (
            <div className="mb-6 flex flex-col items-center gap-3">
              <button
                onClick={handleAnalyze}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3.5 px-6 rounded-xl text-base transition-colors shadow-sm"
              >
                <Eye className="w-5 h-5" />
                Analyze Blueprint
              </button>
              <button
                onClick={handleSkipToManual}
                className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2 transition-colors"
              >
                Skip AI / Enter Manually
              </button>
            </div>
          )}

          {/* ── Loading State ─────────────────────────────────────────────── */}
          {showLoading && (
            <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-base font-semibold text-slate-700">{currentStepLabel}</p>
              <p className="text-sm text-slate-500">Running AI analysis on your blueprint…</p>
              <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">{progressPct}% complete</p>
            </div>
          )}

          {/* ── Results Panel ─────────────────────────────────────────────── */}
          {showResults && (
            <div className="mb-6 space-y-4">
              {/* Error / Fallback banner */}
              {(stage === 'error' || isFallback) && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    {stage === 'error'
                      ? errorMsg
                      : 'AI analysis unavailable — the blueprint could not be parsed. Enter values manually below.'}
                  </p>
                </div>
              )}

              {/* Success banner */}
              {stage === 'complete' && !isFallback && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <p className="text-sm font-semibold text-green-700">
                      Blueprint analyzed successfully
                      {confidence != null && (
                        <span className="ml-2 font-normal text-slate-600">
                          — {Math.round(confidence * 100)}% confidence
                        </span>
                      )}
                    </p>
                  </div>
                  {confidence != null && (
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${confidenceColor}`}
                        style={{ width: `${Math.round(confidence * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Observations */}
              {analysisResult && analysisResult.observations.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">AI Observations</h3>
                  <ul className="space-y-1.5">
                    {analysisResult.observations.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        {obs}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Extracted values card */}
              {stage === 'complete' && !isFallback && analysisResult && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Extracted Values</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      { label: 'Floor Area', value: analysisResult.estimatedFloorArea != null ? `${analysisResult.estimatedFloorArea} m²` : null },
                      { label: 'Floors', value: analysisResult.floors != null ? String(analysisResult.floors) : null },
                      { label: 'Building Type', value: analysisResult.buildingType },
                      { label: 'Roof Type', value: analysisResult.roofType ?? null },
                      { label: 'Rooms', value: analysisResult.roomCount != null ? String(analysisResult.roomCount) : null },
                      { label: 'Bedrooms', value: analysisResult.bedrooms != null ? String(analysisResult.bedrooms) : null },
                      { label: 'Bathrooms', value: analysisResult.bathrooms != null ? String(analysisResult.bathrooms) : null },
                      { label: 'Scale', value: analysisResult.drawingScale ?? null },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
                        <p className={`text-sm ${value ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
                          {value ?? 'Unable to determine from uploaded drawing.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Manual / Confirm Form ─────────────────────────────────────── */}
          {showManualForm && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
              <h2 className="text-base font-semibold text-slate-800 mb-5">
                {stage === 'manual' ? 'Enter Parameters Manually' : 'Confirm Parameters'}
              </h2>

              <div className="space-y-4">
                {/* Floor Area */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Floor Area Per Floor (m²)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={manualFloorArea}
                    onChange={(e) => setManualFloorArea(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Number of Floors */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Number of Floors
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={manualFloors}
                    onChange={(e) => setManualFloors(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Building Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Building Type
                  </label>
                  <select
                    value={manualBuildingType}
                    onChange={(e) => setManualBuildingType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  >
                    {BUILDING_TYPES.map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>

                {/* Construction Standard */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Construction Standard
                  </label>
                  <select
                    value={manualStandard}
                    onChange={(e) => setManualStandard(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  >
                    {STANDARDS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* County */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    County
                  </label>
                  <select
                    value={manualCounty}
                    onChange={(e) => setManualCounty(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  >
                    {KENYA_COUNTIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3.5 px-6 rounded-xl text-base transition-colors shadow-sm"
              >
                Confirm &amp; Calculate Estimate
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
