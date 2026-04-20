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
  tailoredSummary: string;
  tailoredBullets: string[];
  coverLetter: string;
  fullReport: string;
  reportFile: string;
}

export interface PipelineResponse {
  evaluation: EvaluationResponse;
  autoApply: boolean;
}

export interface HealthCheck {
  status: string;
  hasApiKey: boolean;
  mockAi: boolean;
  baseUrl: string | null;
  model: string;
}

export interface SettingsPayload {
  hasApiKey: boolean;
  keyPreview: string | null;
  baseUrl: string;
  model: string;
  mockAi: boolean;
}

export const api = {
  health: () => request<HealthCheck>('/health'),

  getSettings: () => request<SettingsPayload>('/settings'),

  saveSettings: (data: { apiKey?: string; baseUrl?: string; model?: string; mockAi?: boolean }) =>
    request<{ success: boolean }>('/settings/api-key', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  evaluate: (data: { jobDescription: string; jobUrl?: string; cvContent?: string }) =>
    request<EvaluationResponse>('/evaluate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  pipeline: (data: { jobDescription: string; jobUrl?: string; cvContent?: string }) =>
    request<PipelineResponse>('/pipeline/auto', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
