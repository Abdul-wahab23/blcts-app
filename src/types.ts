// ─── Domain Types ────────────────────────────────────────────────────────────

export type UserRole = 'Administrator' | 'Building Owner' | 'Facility Manager';
export type BuildingType = 'Residential' | 'Maisonette' | 'Apartment' | 'Commercial' | 'Office' | 'Mixed-Use' | 'Warehouse' | 'School' | 'Hospital' | 'Industrial';
export type ConstructionStandard = 'Economy' | 'Standard' | 'Premium' | 'Luxury';
export type MaintenanceStatus = 'Pending' | 'Assigned' | 'In-Progress' | 'Completed' | 'Verified';
export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MaintenanceCategory = 'Preventive' | 'Corrective' | 'Emergency' | 'Inspection';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  county: string;
  buildingType: BuildingType;
  constructionStandard: ConstructionStandard;
  floorAreaPerFloor: number; // m² per floor
  floors: number;
  status: 'Planning' | 'Under Construction' | 'Active' | 'Archived';
  ownerId: string;
  assignedFacilityManagerId?: string;
  blueprintUrl?: string;
  blueprintFileName?: string;
  blueprintAnalysis?: BlueprintAnalysisResult;
  latestBoqId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlueprintAnalysisResult {
  estimatedFloorArea: number | null;
  floors: number | null;
  buildingType: string | null;
  confidence: number | null; // 0.0–1.0
  observations: string[];
  isFallback: boolean;
  roomCount?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  roofType?: string | null;
  drawingScale?: string | null;
}

export interface BOQLineItem {
  section: string;
  quantity: number;
  unit: string;
  unitRate: number;
  amount: number;
  source: 'measured' | 'estimated';
}

export interface BOQEstimate {
  id: string;
  projectId: string;
  projectName: string;
  county: string;
  buildingType: string;
  constructionStandard: string;
  gfa: number;
  floors: number;
  costPerSqm: number;
  constructionCost: number;
  externalWorks: number;
  preliminaries: number;
  professionalFees: { name: string; rate: number; amount: number }[];
  statutoryCosts: number;
  subtotal: number;
  contingency: number;
  vatAmount: number;
  totalProjectCost: number;
  lifecycleYears: number;
  annualOpex: number;
  totalLifecycleCost: number;
  tco: number;
  lineItems: BOQLineItem[];
  yearlyProjection: { year: number; opex: number; cumulative: number }[];
  blueprintObservations: string[];
  aiConfidence: number | null;
  createdAt: string;
}

export interface MaintenanceTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  component: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo: string;
  estimatedCost: number;
  actualCost: number;
  targetDate: string;
  completedDate?: string;
  notes: string;
  workOrderNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegionalPricingRow {
  id: string;
  county: string;
  material_multiplier: number;
  labour_multiplier: number;
  service_multiplier: number;
  inflation_factor: number;
  transport_factor: number;
  base_cost_per_sqm_economy: number;
  base_cost_per_sqm_standard: number;
  base_cost_per_sqm_premium: number;
  base_cost_per_sqm_luxury: number;
  notes: string | null;
}

export interface MaterialRow {
  id: string;
  county: string;
  category: 'material' | 'labour' | 'service';
  item_id: string;
  name: string;
  unit_price: number;
  unit: string;
  notes: string | null;
}
