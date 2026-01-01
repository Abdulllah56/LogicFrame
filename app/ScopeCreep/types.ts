
export interface Deliverable {
  id: string;
  description: string;
  category: 'Design' | 'Development' | 'Content' | 'Marketing' | 'Other';
  status: 'To Do' | 'In Progress' | 'Completed';
  type: 'IN_SCOPE' | 'OUT_SCOPE';
}

export interface Request {
  id: string;
  projectId?: string;
  requestText: string;
  date: string;
  dateRequested?: string; // Deprecated, use 'date'
  category: 'Design Change' | 'New Feature' | 'Integration' | 'Content' | 'Revision' | 'Timeline' | 'Other';
  scopeStatus: 'IN_SCOPE' | 'OUT_SCOPE' | 'UNCLEAR';
  estimatedHours: number;
  estimatedCost: number;
  timelineImpact: string;
  justification?: string;
  note?: string; // Deprecated, use 'justification'
  status: 'Pending' | 'Approved' | 'Declined' | 'Discussion';
}

export interface Project {
  id: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  projectPrice: number;
  hourlyRate: number;
  currency: string;
  timeline: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'On Hold';
  deliverables: Deliverable[];
  requests: Request[];
}

export interface EmailConfig {
  provider: 'gmail' | 'outlook' | 'custom';
  email: string;
  senderName?: string;
  appPassword?: string;
  host?: string;
  port?: number;
}

export interface UserSettings {
  name: string;
  email: string;
  businessName: string;
  defaultHourlyRate: number;
  currency: string;
  emailConfig?: EmailConfig;
}

export interface UserAccount {
  id: string; // usually email
  password: string; // In a real app, this would be hashed
  settings: UserSettings;
  projects: Project[];
}

export type EmailTemplateType = 'SINGLE_QUOTE' | 'WEEKLY_SUMMARY' | 'FIRM_REMINDER' | 'AI_GENERATED';

export interface AiEmailConfig {
  tone: 'Professional' | 'Friendly' | 'Firm' | 'Persuasive' | 'Apologetic';
  intent: 'Request Approval' | 'Discuss Budget' | 'Decline Request' | 'Project Update' | 'Clarification';
  length: 'Short' | 'Medium' | 'Long';
  customInstructions: string;
}
