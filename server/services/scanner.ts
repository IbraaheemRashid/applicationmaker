import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { getCareerOpsPath } from './careerOps';

interface PortalConfig {
  title_filter: {
    positive: string[];
    negative: string[];
    seniority_boost?: string[];
  };
  tracked_companies: CompanyConfig[];
}

interface CompanyConfig {
  name: string;
  enabled: boolean;
  careers_url: string;
  api?: string;
}

interface JobListing {
  title: string;
  url: string;
  company: string;
  location?: string;
  source: string;
}

function loadPortalsConfig(): PortalConfig | null {
  const paths = [
    path.resolve('portals.yml'),
    path.join(getCareerOpsPath(), 'portals.yml'),
    path.join(getCareerOpsPath(), 'templates', 'portals.example.yml'),
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return yaml.load(fs.readFileSync(p, 'utf-8')) as PortalConfig;
    }
  }
  return null;
}

function detectApi(company: CompanyConfig): { type: string; url: string } | null {
  if (company.api) {
    if (company.api.includes('greenhouse')) return { type: 'greenhouse', url: company.api };
    if (company.api.includes('ashby')) return { type: 'ashby', url: company.api };
    if (company.api.includes('lever')) return { type: 'lever', url: company.api };
  }

  const url = company.careers_url || '';
  const ghMatch = url.match(/job-boards(?:\.eu)?\.greenhouse\.io\/([^/?#]+)/);
  if (ghMatch) return { type: 'greenhouse', url: `https://boards-api.greenhouse.io/v1/boards/${ghMatch[1]}/jobs` };

  const ashbyMatch = url.match(/jobs\.ashbyhq\.com\/([^/?#]+)/);
  if (ashbyMatch) return { type: 'ashby', url: `https://api.ashbyhq.com/posting-api/job-board/${ashbyMatch[1]}?includeCompensation=true` };

  const leverMatch = url.match(/jobs\.lever\.co\/([^/?#]+)/);
  if (leverMatch) return { type: 'lever', url: `https://api.lever.co/v0/postings/${leverMatch[1]}` };

  return null;
}

function matchesFilter(title: string, filter: PortalConfig['title_filter']): boolean {
  const lower = title.toLowerCase();
  const hasNeg = filter.negative?.some((n) => lower.includes(n.toLowerCase()));
  if (hasNeg) return false;
  if (!filter.positive || filter.positive.length === 0) return true;
  return filter.positive.some((p) => lower.includes(p.toLowerCase()));
}

function parseGreenhouse(json: any, company: string): JobListing[] {
  return (json.jobs || []).map((j: any) => ({
    title: j.title,
    url: j.absolute_url,
    company,
    location: j.location?.name,
    source: 'greenhouse',
  }));
}

function parseAshby(json: any, company: string): JobListing[] {
  return (json.jobs || []).map((j: any) => ({
    title: j.title,
    url: j.jobUrl || j.applyUrl,
    company,
    location: j.location,
    source: 'ashby',
  }));
}

function parseLever(json: any, company: string): JobListing[] {
  if (!Array.isArray(json)) return [];
  return json.map((j: any) => ({
    title: j.text,
    url: j.hostedUrl,
    company,
    location: j.categories?.location,
    source: 'lever',
  }));
}

async function fetchCompanyJobs(company: CompanyConfig, filter: PortalConfig['title_filter']): Promise<JobListing[]> {
  const api = detectApi(company);
  if (!api) return [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(api.url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!resp.ok) return [];
    const json = await resp.json();

    let jobs: JobListing[];
    switch (api.type) {
      case 'greenhouse': jobs = parseGreenhouse(json, company.name); break;
      case 'ashby': jobs = parseAshby(json, company.name); break;
      case 'lever': jobs = parseLever(json, company.name); break;
      default: return [];
    }

    return jobs.filter((j) => matchesFilter(j.title, filter));
  } catch {
    return [];
  }
}

export async function scanPortals(companyFilter?: string): Promise<{
  jobs: JobListing[];
  scanned: number;
  errors: string[];
}> {
  const config = loadPortalsConfig();
  if (!config) {
    return { jobs: [], scanned: 0, errors: ['No portals.yml found'] };
  }

  const companies = config.tracked_companies.filter((c) => {
    if (!c.enabled) return false;
    if (companyFilter) return c.name.toLowerCase().includes(companyFilter.toLowerCase());
    return true;
  });

  const errors: string[] = [];
  const allJobs: JobListing[] = [];

  // Scan in batches of 10
  const batchSize = 10;
  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((c) => fetchCompanyJobs(c, config.title_filter))
    );

    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === 'fulfilled') {
        allJobs.push(...r.value);
      } else {
        errors.push(`${batch[j].name}: ${r.reason}`);
      }
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allJobs.filter((j) => {
    if (!j.url || seen.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });

  return { jobs: unique, scanned: companies.length, errors };
}

export function getCompanies(): { name: string; enabled: boolean; hasApi: boolean }[] {
  const config = loadPortalsConfig();
  if (!config) return [];
  return config.tracked_companies.map((c) => ({
    name: c.name,
    enabled: c.enabled,
    hasApi: detectApi(c) !== null,
  }));
}
