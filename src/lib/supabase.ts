import { createClient } from '@supabase/supabase-js';
import type { RegionalPricingRow, MaterialRow, BOQEstimate, MaintenanceTask, BOQLineItem } from '../types';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

// ─── Cache ────────────────────────────────────────────────────────────────────
let _pricing: RegionalPricingRow[] | null = null;
let _materials: MaterialRow[] | null = null;

export async function fetchRegionalPricing(): Promise<RegionalPricingRow[]> {
  if (_pricing) return _pricing;
  const { data } = await supabase.from('regional_pricing').select('*').order('county');
  _pricing = (data ?? []) as RegionalPricingRow[];
  return _pricing;
}

export async function fetchMaterials(): Promise<MaterialRow[]> {
  if (_materials) return _materials;
  const { data } = await supabase.from('construction_materials').select('*').order('category').order('name');
  _materials = (data ?? []) as MaterialRow[];
  return _materials;
}

export function invalidateCache() {
  _pricing = null;
  _materials = null;
}

export async function updateMaterialPrice(id: string, unitPrice: number): Promise<boolean> {
  invalidateCache();
  const { error } = await supabase
    .from('construction_materials')
    .update({ unit_price: unitPrice, updated_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

// ─── BOQ Estimates ────────────────────────────────────────────────────────────
export async function saveBOQ(estimate: Omit<BOQEstimate, 'id' | 'createdAt'>): Promise<string | null> {
  const { data, error } = await supabase.from('boq_estimates').insert({
    property_id: estimate.projectId,
    property_name: estimate.projectName,
    county: estimate.county,
    building_type: estimate.buildingType,
    construction_standard: estimate.constructionStandard,
    gfa: estimate.gfa,
    floors: estimate.floors,
    cost_per_sqm: estimate.costPerSqm,
    construction_cost: estimate.constructionCost,
    external_works: estimate.externalWorks,
    preliminaries: estimate.preliminaries,
    professional_fees: estimate.professionalFees,
    statutory_costs: estimate.statutoryCosts,
    subtotal: estimate.subtotal,
    contingency: estimate.contingency,
    vat_amount: estimate.vatAmount,
    total_project_cost: estimate.totalProjectCost,
    lifecycle_years: estimate.lifecycleYears,
    annual_opex: estimate.annualOpex,
    total_lifecycle_cost: estimate.totalLifecycleCost,
    tco: estimate.tco,
    boq_line_items: estimate.lineItems,
    blueprint_observations: estimate.blueprintObservations,
    ai_confidence: estimate.aiConfidence,
    config: {},
  }).select('id').maybeSingle();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

export async function fetchBOQHistory(projectId: string): Promise<BOQEstimate[]> {
  const { data } = await supabase
    .from('boq_estimates')
    .select('*')
    .eq('property_id', projectId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (!data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    projectId: r.property_id as string,
    projectName: r.property_name as string,
    county: r.county as string,
    buildingType: r.building_type as string,
    constructionStandard: r.construction_standard as string,
    gfa: Number(r.gfa),
    floors: Number(r.floors),
    costPerSqm: Number(r.cost_per_sqm),
    constructionCost: Number(r.construction_cost),
    externalWorks: Number(r.external_works),
    preliminaries: Number(r.preliminaries),
    professionalFees: (r.professional_fees as { name: string; rate: number; amount: number }[]) ?? [],
    statutoryCosts: Number(r.statutory_costs),
    subtotal: Number(r.subtotal),
    contingency: Number(r.contingency),
    vatAmount: Number(r.vat_amount),
    totalProjectCost: Number(r.total_project_cost),
    lifecycleYears: Number(r.lifecycle_years),
    annualOpex: Number(r.annual_opex),
    totalLifecycleCost: Number(r.total_lifecycle_cost),
    tco: Number(r.tco),
    lineItems: (r.boq_line_items as BOQLineItem[]) ?? [],
    yearlyProjection: [],
    blueprintObservations: (r.blueprint_observations as string[]) ?? [],
    aiConfidence: r.ai_confidence != null ? Number(r.ai_confidence) : null,
    createdAt: r.created_at as string,
  }));
}

// ─── Maintenance Tasks ────────────────────────────────────────────────────────
export async function fetchTasks(projectId?: string): Promise<MaintenanceTask[]> {
  let q = supabase.from('maintenance_tasks').select('*').order('created_at', { ascending: false });
  if (projectId) q = q.eq('property_id', projectId);
  const { data } = await q;
  if (!data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    projectId: r.property_id as string,
    title: r.title as string,
    description: r.description as string,
    component: r.component as string,
    category: r.category as MaintenanceTask['category'],
    priority: r.priority as MaintenanceTask['priority'],
    status: r.status as MaintenanceTask['status'],
    assignedTo: r.assigned_to as string,
    estimatedCost: Number(r.estimated_cost),
    actualCost: Number(r.actual_cost),
    targetDate: r.target_date as string,
    completedDate: r.completed_date as string | undefined,
    notes: r.notes as string,
    workOrderNumber: (r.work_order_number as string) ?? '',
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }));
}

export async function upsertTask(task: Partial<MaintenanceTask> & { id: string; projectId: string }): Promise<boolean> {
  const { error } = await supabase.from('maintenance_tasks').upsert({
    id: task.id,
    property_id: task.projectId,
    title: task.title ?? '',
    description: task.description ?? '',
    component: task.component ?? '',
    category: task.category ?? 'Preventive',
    priority: task.priority ?? 'Medium',
    status: task.status ?? 'Pending',
    assigned_to: task.assignedTo ?? '',
    estimated_cost: task.estimatedCost ?? 0,
    actual_cost: task.actualCost ?? 0,
    target_date: task.targetDate ?? new Date().toISOString().slice(0, 10),
    completed_date: task.completedDate ?? null,
    notes: task.notes ?? '',
    work_order_number: task.workOrderNumber ?? `WO-${Date.now().toString().slice(-6)}`,
    updated_at: new Date().toISOString(),
  });
  return !error;
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase.from('maintenance_tasks').delete().eq('id', id);
  return !error;
}


