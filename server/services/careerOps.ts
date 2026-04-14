import path from 'path';
import fs from 'fs';

// Resolve career-ops location
const CAREER_OPS_PATHS = [
  path.resolve('..', 'career-ops'),
  path.resolve(process.env.HOME || '', 'repos', 'career-ops'),
];

export function getCareerOpsPath(): string {
  for (const p of CAREER_OPS_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('career-ops not found. Expected at: ' + CAREER_OPS_PATHS.join(' or '));
}

export function getTemplatePath(): string {
  return path.join(getCareerOpsPath(), 'templates', 'cv-template.html');
}

export function getFontsPath(): string {
  return path.join(getCareerOpsPath(), 'fonts');
}

export function getOutputDir(): string {
  const dir = path.resolve('output');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getReportsDir(): string {
  const dir = path.resolve('reports');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function readTemplate(): string {
  return fs.readFileSync(getTemplatePath(), 'utf-8');
}
