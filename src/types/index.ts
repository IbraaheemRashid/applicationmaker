export type ApplicationStatus =
  | 'saved'
  | 'evaluating'
  | 'evaluated'
  | 'applying'
  | 'applied'
  | 'responded'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type ScoreGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface Application {
  id: string;
  company: string;
  role: string;
  url: string;
  status: ApplicationStatus;
  score: number | null;
  grade: ScoreGrade | null;
  dateAdded: string;
  dateApplied: string | null;
  lastUpdated: string;
  notes: string;
  tags: string[];
  location: string;
  salary: string;
  remote: boolean;
  evaluation: Evaluation | null;
  cvId: string | null;
}

export interface Evaluation {
  roleSummary: string;
  archetype: string;
  cvMatch: number;
  gaps: string[];
  strengths: string[];
  levelFit: string;
  compRange: string;
  personalizations: string[];
  interviewQuestions: string[];
  legitimacy: 'high' | 'medium' | 'suspicious';
}

export interface CV {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sections: CVSection[];
  targetRole: string;
  keywords: string[];
}

export interface CVSection {
  id: string;
  type: 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'custom';
  title: string;
  content: string;
  items: CVItem[];
  order: number;
}

export interface CVItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  bullets: string[];
}

export interface InterviewStory {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection: string;
  tags: string[];
  usedFor: string[];
}

export interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  interviewRate: number;
  avgScore: number;
  byStatus: Record<ApplicationStatus, number>;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'status_change' | 'new_application' | 'evaluation' | 'cv_generated';
  description: string;
  timestamp: string;
  applicationId?: string;
}
