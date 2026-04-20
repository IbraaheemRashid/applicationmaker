import Anthropic from '@anthropic-ai/sdk';

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('API key not set. Open Settings to add your key.');
  }
  const config: { apiKey: string; baseURL?: string } = {
    apiKey: process.env.ANTHROPIC_API_KEY,
  };
  if (process.env.ANTHROPIC_BASE_URL) {
    config.baseURL = process.env.ANTHROPIC_BASE_URL;
  }
  return new Anthropic(config);
}

function getModel(): string {
  return process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
}

function isMockMode(): boolean {
  return process.env.MOCK_AI === 'true' || process.env.MOCK_AI === '1';
}

export interface EvaluationInput {
  jobDescription: string;
  jobUrl?: string;
  cvContent?: string;
}

export interface EvaluationResult {
  score: number;
  grade: string;
  roleSummary: string;
  archetype: string;
  company: string;
  role: string;
  location: string;
  remote: boolean;
  salary: string;
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
}

const SYSTEM_PROMPT = `You are an expert career advisor. You evaluate a job description against a candidate CV and produce a structured, opinionated evaluation plus tailored application output.

Respond with ONLY a valid JSON object — no markdown fences, no extra text. Use this exact shape:

{
  "score": <number 1.0-5.0>,
  "grade": "<A|B|C|D|F>",
  "company": "<company name>",
  "role": "<role title>",
  "location": "<location or Remote>",
  "remote": <true|false>,
  "salary": "<estimated range or empty string>",
  "roleSummary": "<2-3 sentence summary of the role>",
  "archetype": "<AI Platform | Agentic | Technical PM | Solutions Architect | Forward Deployed | SWE | DS/ML | Data Eng | DevOps | PM | Design | Marketing | Sales | Ops | Other>",
  "strengths": ["<3-5 candidate strengths for this role>"],
  "gaps": ["<2-4 honest gaps>"],
  "personalizations": ["<4 specific CV changes to make>"],
  "interviewQuestions": ["<4-6 likely interview questions>"],
  "compRange": "<salary range with currency>",
  "legitimacy": "<high|medium|suspicious>",
  "levelFit": "<seniority assessment>",
  "cvMatch": <number 0-100>,
  "tailoredSummary": "<3-4 sentence professional summary tailored to this JD using its vocabulary, truthful to the CV>",
  "tailoredBullets": ["<6-8 reformulated or reordered experience bullets, JD-keyword-aligned, never inventing>"],
  "coverLetter": "<200-280 word cover letter, first person, specific to this company and role, no clichés>"
}

Scoring:
- 4.5+ exceptional, apply immediately
- 4.0-4.4 strong, apply
- 3.5-3.9 decent, worth considering
- 3.0-3.4 weak, likely skip
- <3.0 poor

Legitimacy:
- "high": specific, recent, clear requirements
- "medium": some vague signals
- "suspicious": ghost job indicators (overly generic, ancient, absurd requirements, copy-paste across unrelated roles)

Be honest about gaps. Never invent experience in tailored output.`;

export async function evaluateJob(input: EvaluationInput): Promise<EvaluationResult> {
  if (isMockMode()) {
    return buildMockResult(input);
  }

  const userMessage = buildUserMessage(input);

  const response = await getClient().messages.create({
    model: getModel(),
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  let jsonStr = text;
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1];

  const result = JSON.parse(jsonStr.trim());

  return {
    ...result,
    fullReport: generateReport(result),
  };
}

function buildUserMessage(input: EvaluationInput): string {
  let msg = '';

  if (input.cvContent) {
    msg += `## Candidate CV\n\n${input.cvContent}\n\n---\n\n`;
  }

  msg += `## Job Description\n\n`;
  if (input.jobUrl) {
    msg += `URL: ${input.jobUrl}\n\n`;
  }
  msg += input.jobDescription;

  if (!input.cvContent) {
    msg += `\n\nNote: No CV provided. Evaluate the posting itself and provide a general assessment. Set cvMatch to 50, keep tailoredSummary/tailoredBullets/coverLetter short and generic.`;
  }

  return msg;
}

function buildMockResult(input: EvaluationInput): EvaluationResult {
  const jd = input.jobDescription || input.jobUrl || '';
  const firstLine = jd.split('\n').find((l) => l.trim()) || 'Example Role';
  const company = extractCompany(jd) || 'Example Co';
  const role = extractRole(jd) || firstLine.slice(0, 60);
  const suspicious = /ghost|urgent hiring|immediate|multiple positions|competitive salary/i.test(jd);

  const result: Omit<EvaluationResult, 'fullReport'> = {
    score: 4.2,
    grade: 'B',
    company,
    role,
    location: 'Remote',
    remote: true,
    salary: '$120k - $170k',
    roleSummary: `[MOCK] Mid-senior role at ${company} focused on building and shipping ${role.toLowerCase()}-adjacent systems. This is a canned response — enable real AI in Settings to get a real evaluation.`,
    archetype: 'SWE',
    strengths: [
      '[MOCK] Strong execution track record',
      '[MOCK] Domain experience matches listed stack',
      '[MOCK] Prior ownership at comparable scale',
    ],
    gaps: ['[MOCK] No measurable evidence of X yet', '[MOCK] Formal Y experience is thin'],
    personalizations: [
      '[MOCK] Lead summary with the system you shipped that mirrors their product',
      '[MOCK] Reorder bullets to put JD-keyword matches first',
      '[MOCK] Replace generic "collaborated" verbs with specific JD vocabulary',
      '[MOCK] Drop the oldest role to keep to one page',
    ],
    interviewQuestions: [
      '[MOCK] Walk me through the most complex system you designed.',
      '[MOCK] Where did a launch fail, and what did you learn?',
      '[MOCK] How do you prioritise when scope and time both compress?',
      '[MOCK] Describe a time you disagreed with a PM on direction.',
    ],
    compRange: '$120k - $170k base + equity',
    legitimacy: suspicious ? 'suspicious' : 'high',
    levelFit: 'Mid to senior — maps to L5 at FAANG',
    cvMatch: 72,
    tailoredSummary:
      '[MOCK] Senior engineer with a track record of shipping user-facing systems at scale. Deep experience in TypeScript and distributed services. Looking to apply that execution cadence to an early-stage AI product team.',
    tailoredBullets: [
      '[MOCK] Shipped [feature] to [N] users, cutting latency [%]',
      '[MOCK] Led rewrite of [system] from [old] to [new], enabling [outcome]',
      '[MOCK] Mentored [N] engineers through [ambiguous problem]',
      '[MOCK] Owned on-call rotation for [service], reduced incidents [%]',
      '[MOCK] Partnered with PM/design to scope [initiative] end-to-end',
      '[MOCK] Built [tool] that unlocked [downstream metric]',
    ],
    coverLetter: `[MOCK] Dear ${company} hiring team,\n\nThis is a canned mock cover letter. The real pipeline will produce a 200-word letter tailored to the JD, referencing your product and why the fit is mutual. Enable real AI in Settings (paste a key or set MOCK_AI=false in .env) to get genuine output.\n\nBest,\n[Your name]`,
  };

  return { ...result, fullReport: generateReport(result) };
}

function extractCompany(jd: string): string | null {
  const m = jd.match(/at\s+([A-Z][A-Za-z0-9&. -]{1,40})/);
  return m ? m[1].trim() : null;
}

function extractRole(jd: string): string | null {
  const m = jd.match(/(Senior|Staff|Lead|Principal|Junior)?\s*(Software Engineer|Engineer|Designer|PM|Product Manager|Analyst|Scientist)/i);
  return m ? m[0].trim() : null;
}

function generateReport(result: Omit<EvaluationResult, 'fullReport'> & { fullReport?: string }): string {
  const date = new Date().toISOString().split('T')[0];
  return `# ${result.company} — ${result.role}
**Date:** ${date}
**Score:** ${result.score}/5.0 (${result.grade})
**Archetype:** ${result.archetype}

## Role Summary
${result.roleSummary}

## Legitimacy: ${result.legitimacy}
${result.levelFit}

## Strengths
${result.strengths.map((s) => `- ${s}`).join('\n')}

## Gaps
${result.gaps.map((g) => `- ${g}`).join('\n')}

## CV Personalizations
${result.personalizations.map((p) => `- ${p}`).join('\n')}

## Tailored Summary
${result.tailoredSummary}

## Tailored Bullets
${result.tailoredBullets.map((b) => `- ${b}`).join('\n')}

## Cover Letter
${result.coverLetter}

## Compensation
${result.compRange}

## Interview Questions
${result.interviewQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
`;
}
