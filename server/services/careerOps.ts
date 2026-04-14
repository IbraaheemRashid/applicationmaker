import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Primary: external career-ops repo
const CAREER_OPS_PATHS = [
  path.resolve('..', 'career-ops'),
  path.resolve(process.env.HOME || '', 'repos', 'career-ops'),
];

// Fallback: bundled copies in this project
const LOCAL_TEMPLATE = path.resolve(__dirname, '..', 'templates', 'cv-template.html');
const LOCAL_FONTS = path.resolve(__dirname, '..', 'fonts');

export function getCareerOpsPath(): string | null {
  for (const p of CAREER_OPS_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function getTemplatePath(): string {
  const cop = getCareerOpsPath();
  if (cop) return path.join(cop, 'templates', 'cv-template.html');
  if (fs.existsSync(LOCAL_TEMPLATE)) return LOCAL_TEMPLATE;
  throw new Error(
    'CV template not found. Expected career-ops at: ' + CAREER_OPS_PATHS.join(' or ')
  );
}

export function getFontsPath(): string {
  const cop = getCareerOpsPath();
  if (cop) return path.join(cop, 'fonts');
  if (fs.existsSync(LOCAL_FONTS) && fs.readdirSync(LOCAL_FONTS).length > 0) return LOCAL_FONTS;
  throw new Error('Fonts directory not found.');
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
  const p = getTemplatePath();
  console.log('[careerOps] Reading template from:', p);
  return fs.readFileSync(p, 'utf-8');
}
