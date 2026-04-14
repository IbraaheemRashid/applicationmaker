import { Router } from 'express';
import { evaluateJob } from '../services/evaluator';
import { tailorCV, generatePdf } from '../services/pdfGenerator';
import type { CVData } from '../services/pdfGenerator';
import fs from 'fs';
import path from 'path';
import { getReportsDir, getOutputDir } from '../services/careerOps';

export const pipelineRouter = Router();

// Full auto-pipeline: evaluate + tailor CV + generate PDF
pipelineRouter.post('/auto', async (req, res) => {
  try {
    const { jobDescription, jobUrl, cvData } = req.body;

    if (!jobDescription) {
      res.status(400).json({ error: 'jobDescription required' });
      return;
    }

    // Stream progress via SSE-style response
    res.setHeader('Content-Type', 'application/json');

    // Step 1: Evaluate
    const evaluation = await evaluateJob({
      jobDescription,
      jobUrl,
      cvContent: cvData ? formatCVForEval(cvData) : undefined,
    });

    // Save report
    const reportsDir = getReportsDir();
    const date = new Date().toISOString().split('T')[0];
    const slug = evaluation.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const existing = fs.readdirSync(reportsDir).filter((f) => f.endsWith('.md'));
    const num = String(existing.length + 1).padStart(3, '0');
    const reportFile = `${num}-${slug}-${date}.md`;
    fs.writeFileSync(path.join(reportsDir, reportFile), evaluation.fullReport);

    // Step 2: Generate tailored PDF (if CV data provided and score >= 3.5)
    let pdfResult = null;
    if (cvData && evaluation.score >= 3.5) {
      try {
        const { html, tailoredData } = await tailorCV({
          cvData,
          jobDescription,
          jobUrl,
        });

        const nameSlug = (cvData.name || 'candidate').toLowerCase().replace(/\s+/g, '-');
        const compSlug = slug;
        const fname = `cv-${nameSlug}-${compSlug}-${date}.pdf`;
        const pdfPath = await generatePdf(html, fname);

        pdfResult = {
          path: pdfPath,
          filename: fname,
          url: `/output/${fname}`,
          tailoredCV: tailoredData,
        };
      } catch (pdfErr: any) {
        console.error('PDF generation failed (non-fatal):', pdfErr.message);
        pdfResult = { error: pdfErr.message };
      }
    }

    res.json({
      evaluation: {
        ...evaluation,
        reportFile,
      },
      pdf: pdfResult,
      autoApply: evaluation.score >= 4.5,
    });
  } catch (err: any) {
    console.error('Pipeline error:', err);
    res.status(500).json({ error: err.message || 'Pipeline failed' });
  }
});

function formatCVForEval(cvData: CVData): string {
  let cv = `# ${cvData.name}\n${cvData.email}\n${cvData.location}\n\n`;
  cv += `## Summary\n${cvData.summary}\n\n`;

  if (cvData.experience?.length) {
    cv += `## Experience\n`;
    for (const exp of cvData.experience) {
      cv += `### ${exp.role} — ${exp.company} (${exp.period})\n`;
      for (const b of exp.bullets) cv += `- ${b}\n`;
      cv += '\n';
    }
  }

  if (cvData.projects?.length) {
    cv += `## Projects\n`;
    for (const p of cvData.projects) {
      cv += `### ${p.title}\n${p.description}\n${p.tech || ''}\n\n`;
    }
  }

  if (cvData.skills?.length) {
    cv += `## Skills\n`;
    for (const s of cvData.skills) {
      cv += `**${s.category}:** ${s.items.join(', ')}\n`;
    }
  }

  return cv;
}
