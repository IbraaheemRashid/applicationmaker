import Anthropic from '@anthropic-ai/sdk';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { readTemplate, getFontsPath, getOutputDir } from './careerOps';

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set. Go to Settings to add your API key.');
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export interface CVData {
  name: string;
  email: string;
  linkedinUrl?: string;
  linkedinDisplay?: string;
  portfolioUrl?: string;
  portfolioDisplay?: string;
  location: string;
  summary: string;
  competencies: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertItem[];
  skills: SkillCategory[];
}

interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location?: string;
  bullets: string[];
}

interface ProjectItem {
  title: string;
  badge?: string;
  description: string;
  tech?: string;
}

interface EducationItem {
  title: string;
  org: string;
  year: string;
  description?: string;
}

interface CertItem {
  title: string;
  org: string;
  year: string;
}

interface SkillCategory {
  category: string;
  items: string[];
}

export interface TailorInput {
  cvData: CVData;
  jobDescription: string;
  jobUrl?: string;
}

// ATS normalization from career-ops
function atsNormalize(text: string): string {
  return text
    .replace(/\u2014/g, '-')  // em-dash
    .replace(/\u2013/g, '-')  // en-dash
    .replace(/[\u201C\u201D]/g, '"')  // smart double quotes
    .replace(/[\u2018\u2019]/g, "'")  // smart single quotes
    .replace(/\u2026/g, '...')  // ellipsis
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')  // zero-width chars
    .replace(/\u00A0/g, ' ');  // non-breaking space
}

function buildHtml(data: CVData): string {
  let html = readTemplate();
  const fontsDir = getFontsPath();

  // Replace font URLs with absolute paths
  html = html.replace(/url\(['"]?\.\/fonts\//g, `url('file://${fontsDir}/`);

  // Basic replacements
  html = html.replace(/\{\{LANG\}\}/g, 'en');
  html = html.replace(/\{\{PAGE_WIDTH\}\}/g, '8.5in');
  html = html.replace(/\{\{NAME\}\}/g, data.name);
  html = html.replace(/\{\{EMAIL\}\}/g, data.email);
  html = html.replace(/\{\{LINKEDIN_URL\}\}/g, data.linkedinUrl || '#');
  html = html.replace(/\{\{LINKEDIN_DISPLAY\}\}/g, data.linkedinDisplay || 'LinkedIn');
  html = html.replace(/\{\{PORTFOLIO_URL\}\}/g, data.portfolioUrl || '#');
  html = html.replace(/\{\{PORTFOLIO_DISPLAY\}\}/g, data.portfolioDisplay || 'Portfolio');
  html = html.replace(/\{\{LOCATION\}\}/g, data.location);

  // Section titles
  html = html.replace(/\{\{SECTION_SUMMARY\}\}/g, 'Professional Summary');
  html = html.replace(/\{\{SECTION_COMPETENCIES\}\}/g, 'Core Competencies');
  html = html.replace(/\{\{SECTION_EXPERIENCE\}\}/g, 'Work Experience');
  html = html.replace(/\{\{SECTION_PROJECTS\}\}/g, 'Projects');
  html = html.replace(/\{\{SECTION_EDUCATION\}\}/g, 'Education');
  html = html.replace(/\{\{SECTION_CERTIFICATIONS\}\}/g, 'Certifications');
  html = html.replace(/\{\{SECTION_SKILLS\}\}/g, 'Skills');

  // Summary
  html = html.replace(/\{\{SUMMARY_TEXT\}\}/g, data.summary);

  // Competencies
  const compHtml = data.competencies
    .map((c) => `<span class="competency-tag">${c}</span>`)
    .join('\n      ');
  html = html.replace(/\{\{COMPETENCIES\}\}/g, compHtml);

  // Experience
  const expHtml = data.experience
    .map(
      (exp) => `
    <div class="job">
      <div class="job-header">
        <span class="job-company">${exp.company}</span>
        <span class="job-period">${exp.period}</span>
      </div>
      <div class="job-role">${exp.role}${exp.location ? ` <span class="job-location">${exp.location}</span>` : ''}</div>
      <ul>
        ${exp.bullets.map((b) => `<li>${b}</li>`).join('\n        ')}
      </ul>
    </div>`
    )
    .join('\n');
  html = html.replace(/\{\{EXPERIENCE\}\}/g, expHtml);

  // Projects
  const projHtml = data.projects
    .map(
      (p) => `
    <div class="project">
      <div class="project-title">${p.title}${p.badge ? ` <span class="project-badge">${p.badge}</span>` : ''}</div>
      <div class="project-desc">${p.description}</div>
      ${p.tech ? `<div class="project-tech">${p.tech}</div>` : ''}
    </div>`
    )
    .join('\n');
  html = html.replace(/\{\{PROJECTS\}\}/g, projHtml);

  // Education
  const eduHtml = data.education
    .map(
      (e) => `
    <div class="edu-item">
      <div class="edu-header">
        <span class="edu-title">${e.title} — <span class="edu-org">${e.org}</span></span>
        <span class="edu-year">${e.year}</span>
      </div>
      ${e.description ? `<div class="edu-desc">${e.description}</div>` : ''}
    </div>`
    )
    .join('\n');
  html = html.replace(/\{\{EDUCATION\}\}/g, eduHtml);

  // Certifications
  const certHtml = data.certifications
    .map(
      (c) => `
    <div class="cert-item">
      <span class="cert-title">${c.title} — <span class="cert-org">${c.org}</span></span>
      <span class="cert-year">${c.year}</span>
    </div>`
    )
    .join('\n');
  html = html.replace(/\{\{CERTIFICATIONS\}\}/g, certHtml);

  // Skills
  const skillsHtml = data.skills
    .map(
      (s) => `<div class="skill-item"><span class="skill-category">${s.category}:</span> ${s.items.join(', ')}</div>`
    )
    .join('\n      ');
  html = html.replace(/\{\{SKILLS\}\}/g, skillsHtml);

  return atsNormalize(html);
}

export async function tailorCV(input: TailorInput): Promise<{ html: string; tailoredData: CVData }> {
  const systemPrompt = `You are an ATS optimization expert. Given a CV and a job description, you tailor the CV to maximize match while NEVER inventing experience. You reformulate existing experience using JD vocabulary.

Respond with ONLY valid JSON (no markdown fences). Return a CVData object with these fields:
{
  "name": "string",
  "email": "string",
  "linkedinUrl": "string",
  "linkedinDisplay": "string",
  "portfolioUrl": "string",
  "portfolioDisplay": "string",
  "location": "string",
  "summary": "3-4 sentence professional summary using JD keywords naturally",
  "competencies": ["6-8 keyword phrases from JD that match candidate skills"],
  "experience": [{ "company": "", "role": "", "period": "", "location": "", "bullets": ["reordered and reformulated to match JD"] }],
  "projects": [{ "title": "", "badge": "", "description": "", "tech": "" }],
  "education": [{ "title": "", "org": "", "year": "", "description": "" }],
  "certifications": [{ "title": "", "org": "", "year": "" }],
  "skills": [{ "category": "", "items": [""] }]
}

Rules:
- NEVER invent skills or experience the candidate doesn't have
- Reformulate using exact JD vocabulary where truthful
- Reorder bullets so most JD-relevant come first
- Inject JD keywords into summary naturally
- Select top 3-4 most relevant projects
- Keep it concise — this must fit on 1-2 pages`;

  const userMessage = `## Current CV Data
${JSON.stringify(input.cvData, null, 2)}

## Job Description
${input.jobUrl ? `URL: ${input.jobUrl}\n` : ''}${input.jobDescription}

Tailor this CV for the job. Return the optimized CVData JSON.`;

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  let jsonStr = text;
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1];

  const tailoredData: CVData = JSON.parse(jsonStr.trim());
  const html = buildHtml(tailoredData);

  return { html, tailoredData };
}

export async function generatePdf(html: string, filename: string): Promise<string> {
  const outputDir = getOutputDir();
  const pdfPath = path.join(outputDir, filename);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    // Wait for fonts to load in browser context
    await page.evaluate('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.6in', right: '0.6in', bottom: '0.6in', left: '0.6in' },
    });

    fs.writeFileSync(pdfPath, pdfBuffer);
    return pdfPath;
  } finally {
    await browser.close();
  }
}

export { buildHtml };
