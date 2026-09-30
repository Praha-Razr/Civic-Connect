
export enum IssueCategory {
  POTHOLE = 'Pothole',
  ROAD_DAMAGE = 'Road Damage',
  STREET_LIGHT = 'Street Light',
  GARBAGE = 'Garbage',
  WATER = 'Water Leakage',
  WATER_CONTAMINATION = 'Water Contamination',
  SANITATION = 'Sanitation',
  DRAINAGE = 'Drainage',
  STRAY_ANIMALS = 'Stray Animals',
  NOISE_POLLUTION = 'Noise Pollution',
  ILLEGAL_CONSTRUCTION = 'Illegal Construction',
  TRAFFIC_SIGNAL = 'Traffic Signal',
  PARK_MAINTENANCE = 'Park Maintenance',
  PUBLIC_TOILETS = 'Public Toilets',
  ENCROACHMENT = 'Encroachment',
  TREE_FALLEN = 'Fallen Tree',
  SEWAGE_OVERFLOW = 'Sewage Overflow',
  AIR_QUALITY = 'Air Pollution',
  PUBLIC_TRANSPORT = 'Public Transport',
  VANDALISM = 'Vandalsim',
  ABANDONED_VEHICLE = 'Abandoned Vehicle',
  MOSQUITO_BREEDING = 'Mosquito Breeding',
  ILLEGAL_ADVERTISING = 'Illegal Advertising',
  STREET_VENDORS = 'Street Vendors',
  EXPOSED_WIRES = 'Exposed Wires',
  BRIDGE_MAINTENANCE = 'Bridge Maintenance',
  SIDEWALK_DAMAGE = 'Sidewalk Damage',
  PUBLIC_SAFETY = 'Public Safety',
  STREET_SIGN = 'Street Sign Damage',
  OPEN_MANHOLE = 'Open Manhole',
  WATER_LOGGING = 'Water Logging',
  ILLEGAL_PARKING = 'Illegal Parking',
  FIRE_HAZARD = 'Fire Hazard',
  DAMAGED_HYDRANT = 'Damaged Hydrant',
  PEST_INFESTATION = 'Pest Infestation',
  SCHOOL_ZONE = 'School Zone Safety',
  BROKEN_FENCE = 'Broken Fence',
  HANGING_CABLES = 'Hanging Cables',
  OTHERS = 'Others'
}

export enum IssueStatus {
  SUBMITTED = 'Submitted',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  REJECTED = 'Rejected',
  ESCALATED = 'Escalated',
  MERGED = 'Merged'
}

export enum IssuePriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum EscalationLevel {
  VILLAGE_PRESIDENT = 'Village President',
  TALUK_OFFICE = 'Taluk Office',
  DISTRICT_COLLECTOR = 'District Collector'
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  area?: string;
  village?: string;
  taluk?: string;
  district?: string;
}

export interface ActionSuggestion {
  department: string;
  manpower: string;
  steps: string[];
  estimatedHours: number;
}

export interface AdminAIAnalysis {
  riskScore: number;
  fraudDetectionReasoning: string;
  predictedResolutionHours: number;
  priorityJustification: string;
  resourceComplexity: 'Simple' | 'Moderate' | 'Complex';
  slaStatus: 'on-track' | 'at-risk' | 'violation';
  trustImpact?: number;
}

export interface PolicySimulation {
  expectedImprovement: string;
  costBenefitRatio: string;
  satisfactionDelta: number;
  riskAssessment: string;
}

export interface TalukBudgetAdvisory {
  suggestedBudget: number;
  manpowerRequired: string;
  breakdown: string[];
  efficiencyJustification: string;
  complexityFactor: string;
}

export interface ResolveChainEvent {
  timestamp: string;
  status: IssueStatus | string;
  action: string;
  actor: string;
  tier?: EscalationLevel;
}

export interface Grievance {
  id: string;
  dnaSignature: string;
  title: string;
  category: IssueCategory;
  description: string;
  image?: string;
  location: Location;
  status: IssueStatus;
  priority: IssuePriority;
  currentTier: EscalationLevel;
  createdAt: string;
  updatedAt: string;
  aiCategorized: boolean;
  rating?: number;
  feedback?: string;
  upvotes: number;
  votedByMe?: boolean;
  isEmergency?: boolean;
  slaDeadline?: string;
  isAnonymous?: boolean;
  parentCaseId?: string;
  aiSuggestions?: ActionSuggestion;
  adminAIAnalysis?: AdminAIAnalysis;
  talukBudgetAdvisory?: TalukBudgetAdvisory;
  resolveChain: ResolveChainEvent[];
}

export type UserRole = 'citizen' | 'admin';

export interface UserImpactLedger {
  reportsVerified: number;
  hoursSavedForCity: number;
  safetyContributionScore: number;
}

export interface User {
  email: string;
  password?: string;
  role: UserRole;
  adminLevel?: EscalationLevel;
  district?: string;
  taluk?: string;
  village?: string;
  points: number;
  trustScore: number;
  badges: string[];
  impactLedger?: UserImpactLedger;
}
