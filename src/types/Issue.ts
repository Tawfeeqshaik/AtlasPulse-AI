export interface Issue {
  id?: string; // Firestore document ID
  issueId: string; // AP-2026-XXXX format
  imageUrl: string;
  category: 'Pothole' | 'Road Damage' | 'Garbage Dump' | 'Water Leakage' | 'Broken Streetlight' | 'Drain Blockage' | 'Public Safety Hazard' | string;
  severityLevel: 'Emergency' | 'Urgent' | 'Important' | 'Routine' | string;
  confidenceScore: number;
  priorityScore: number;
  urgencyTier: string;
  responsibleDepartment: string;
  routingReason: string;
  estimatedResolutionDays: number;
  aiSummary: string;
  latitude: number;
  longitude: number;
  address?: string;
  createdAt: string; // ISO format or Firestore Timestamp representation
  status: 'Open' | 'In Progress' | 'Resolved' | string;
  notes?: string;
  citizenName?: string;
  userId?: string;
  createdBy?: string;
  createdByName?: string;
  verificationCount?: number;
  verifiedBy?: string[];
}
