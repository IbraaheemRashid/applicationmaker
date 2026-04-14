import Anthropic from '@anthropic-ai/sdk';

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set. Go to Settings to add your API key.');
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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
  fullReport: string;
}

const SYSTEM_PROMPT = `You are an expert career advisor and job application evaluator. You analyze job descriptions against candidate profiles to provide structured evaluations.

You MUST respond with ONLY a valid JSON object (no markdown, no code fences, no extra text). The JSON must match this exact structure:

{
  "score": <number 1.0-5.0>,
  "grade": "<A|B|C|D|F>",
  "company": "<company name>",
  "role": "<role title>",
  "location": "<location or Remote>",
  "remote": <true|false>,
  "salary": "<estimated range or empty string>",
  "roleSummary": "<2-3 sentence summary of the role>",
  "archetype": "<one of: AI Platform/LLMOps, Agentic/Automation, Technical PM, Solutions Architect, Forward Deployed, Transformation, Software Engineering, Data Engineering, DevOps/SRE, Product Management, Design, Marketing, Sales, Operations, Other>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "personalizations": ["<cv change 1>", "<cv change 2>", "<cv change 3>", "<cv change 4>"],
  "interviewQuestions": ["<question 1>", "<question 2>", "<question 3>", "<question 4>"],
  "compRange": "<salary range estimate with currency>",
  "legitimacy": "<high|medium|suspicious>",
  "levelFit": "<seniority assessment>",
  "cvMatch": <number 0-100>
}

Scoring guide:
- 4.5+: Exceptional match, apply immediately
- 4.0-4.4: Strong match, good fit
- 3.5-3.9: Decent match, worth considering
- 3.0-3.4: Weak match, significant gaps
- Below 3.0: Poor match, recommend against

For legitimacy:
- "high": Real, active opening with specific requirements
- "medium": Some vague signals, proceed with caution
- "suspicious": Ghost job indicators (very generic, old posting, unrealistic requirements)`;

export async function evaluateJob(input: EvaluationInput): Promise<EvaluationResult> {
  const userMessage = buildUserMessage(input);

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  // Parse JSON from response, handling potential markdown wrapping
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
    msg += `\n\nNote: No CV provided. Evaluate the job posting itself and provide general assessment. Set cvMatch to 50 as baseline.`;
  }

  return msg;
}

function generateReport(result: EvaluationResult): string {
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

## Compensation
${result.compRange}

## Interview Questions
${result.interviewQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
`;
}
