const API_BASE = 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

export interface EvaluationResponse {
  score: number;
  grade: string;
  company: string;
  role: string;
  location: string;
  remote: boolean;
  salary: string;
  roleSummary: string;
  archetype: string;
  strengths: string[];
  gaps: string[];
  personalizations: string[];
  interviewQuestions: string[];
  compRange: string;
  legitimacy: 'high' | 'medium' | 'suspicious';
  levelFit: string;
  cvMatch: number;
  fullReport: string;
  reportFile: string;
}

export interface PipelineResponse {
  evaluation: EvaluationResponse;
  pdf: {
    filename: string;
    url: string;
    error?: string;
  } | null;
  autoApply: boolean;
}

export interface ScanResult {
  jobs: { title: string; url: string; company: string; location?: string; source: string }[];
  scanned: number;
  errors: string[];
}

export interface PdfResult {
  filename: string;
  url: string;
  path: string;
}

export interface HealthCheck {
  status: string;
  careerOpsConnected: boolean;
  careerOpsPath: string | null;
  hasApiKey: boolean;
}

export const api = {
  health: () => request<HealthCheck>('/health'),

  evaluate: (data: { jobDescription: string; jobUrl?: string; cvContent?: string }) =>
    request<EvaluationResponse>('/evaluate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  pipeline: (data: { jobDescription: string; jobUrl?: string; cvData?: any }) =>
    request<PipelineResponse>('/pipeline/auto', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  scan: (company?: string) =>
    request<ScanResult>('/scan', {
      method: 'POST',
      body: JSON.stringify({ company }),
    }),

  getCompanies: () =>
    request<{ name: string; enabled: boolean; hasApi: boolean }[]>('/scan/companies'),

  generatePdf: (cvData: any, filename?: string) =>
    request<PdfResult>('/pdf/generate', {
      method: 'POST',
      body: JSON.stringify({ cvData, filename }),
    }),

  tailorPdf: (cvData: any, jobDescription: string, jobUrl?: string, company?: string) =>
    request<PdfResult & { tailoredCV: any }>('/pdf/tailor', {
      method: 'POST',
      body: JSON.stringify({ cvData, jobDescription, jobUrl, company }),
    }),

  listPdfs: () => request<{ filename: string; url: string; size: number; created: string }[]>('/pdf/list'),
};
