import type { ApplicationStatus, ScoreGrade } from '../types';

export function getStatusColor(status: ApplicationStatus): string {
  const colors: Record<ApplicationStatus, string> = {
    saved: 'bg-surface-600',
    evaluating: 'bg-amber-500',
    evaluated: 'bg-blue-500',
    applying: 'bg-indigo-500',
    applied: 'bg-purple-500',
    responded: 'bg-cyan-500',
    interview: 'bg-emerald-500',
    offer: 'bg-green-500',
    rejected: 'bg-red-500',
    withdrawn: 'bg-surface-500',
  };
  return colors[status];
}

export function getStatusLabel(status: ApplicationStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getGradeColor(grade: ScoreGrade | null): string {
  if (!grade) return 'text-surface-400';
  const colors: Record<ScoreGrade, string> = {
    A: 'text-emerald-400',
    B: 'text-blue-400',
    C: 'text-amber-400',
    D: 'text-orange-400',
    F: 'text-red-400',
  };
  return colors[grade];
}

export function scoreToGrade(score: number | null): ScoreGrade | null {
  if (score === null) return null;
  if (score >= 4.5) return 'A';
  if (score >= 4.0) return 'B';
  if (score >= 3.5) return 'C';
  if (score >= 3.0) return 'D';
  return 'F';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export const STATUS_FLOW: ApplicationStatus[] = [
  'saved',
  'evaluating',
  'evaluated',
  'applying',
  'applied',
  'responded',
  'interview',
  'offer',
];
