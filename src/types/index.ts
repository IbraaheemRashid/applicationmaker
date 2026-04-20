export type ApplicationStatus =
  | 'saved'
  | 'evaluated'
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
  tailoredSummary: string;
  tailoredBullets: string[];
  coverLetter: string;
}

export interface CV {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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
