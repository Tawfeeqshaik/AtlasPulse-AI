export interface VisionAnalysisResult {
  issueCategory: string;
  severityLevel: string;
  confidenceScore: number;
  aiSummary: string;
}

export interface PriorityEngineResult {
  priorityScore: number;
  urgencyTier: string;
  responsibleDepartment: string;
  estimatedResolutionDays: number;
  impactReason: string;
  routingReason: string;
}

export interface Stage1Scene {
  sceneDescription: string;
  visibleObjects: string[];
  isRealPhoto: boolean;
  isOutdoor: boolean;
  containsInfrastructure: boolean;
  confidence: number;
}

export interface Stage3Validation {
  damageAnswer: 'YES' | 'NO' | 'UNKNOWN';
  reason?: string;
}

export interface Stage4Evidence {
  evidence: string[];
}

export interface FullGeminiAnalysis {
  issueId: string;
  createdAt?: string;
  localImageUrl?: string;
  
  // Pipeline details
  stage1?: Stage1Scene;
  stage2Passed?: boolean;
  stage3?: Stage3Validation;
  stage4?: Stage4Evidence;
  
  // Final outputs
  vision: VisionAnalysisResult;
  priority: PriorityEngineResult;
  officialLetter: string;
  
  // Status and rejection info
  rejected?: boolean;
  rejectionReason?: string;
  lastActiveStage?: string;
}

