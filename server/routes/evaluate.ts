import { Router } from 'express';
import { evaluateJob } from '../services/evaluator';
import fs from 'fs';
import path from 'path';
import { getReportsDir } from '../services/paths';

export const evaluateRouter = Router();

evaluateRouter.post('/', async (req, res) => {
  try {
    const { jobDescription, jobUrl, cvContent } = req.body;

    if (!jobDescription && !jobUrl) {
      res.status(400).json({ error: 'jobDescription or jobUrl required' });
      return;
    }

    const result = await evaluateJob({ jobDescription, jobUrl, cvContent });

    const reportsDir = getReportsDir();
    const date = new Date().toISOString().split('T')[0];
    const slug = result.company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const existing = fs.readdirSync(reportsDir).filter((f) => f.endsWith('.md'));
    const num = String(existing.length + 1).padStart(3, '0');
    const reportFile = `${num}-${slug}-${date}.md`;
    fs.writeFileSync(path.join(reportsDir, reportFile), result.fullReport);

    res.json({ ...result, reportFile });
  } catch (err: any) {
    console.error('Evaluation error:', err);
    res.status(500).json({ error: err.message || 'Evaluation failed' });
  }
});
