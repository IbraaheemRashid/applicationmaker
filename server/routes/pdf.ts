import { Router } from 'express';
import { tailorCV, generatePdf, buildHtml } from '../services/pdfGenerator';
import type { CVData } from '../services/pdfGenerator';
import fs from 'fs';
import path from 'path';
import { getOutputDir } from '../services/careerOps';

export const pdfRouter = Router();

// Generate PDF from CV data (no tailoring)
pdfRouter.post('/generate', async (req, res) => {
  try {
    const { cvData, filename } = req.body as { cvData: CVData; filename?: string };

    if (!cvData || !cvData.name) {
      res.status(400).json({ error: 'cvData with name required' });
      return;
    }

    const html = buildHtml(cvData);
    const date = new Date().toISOString().split('T')[0];
    const slug = cvData.name.toLowerCase().replace(/\s+/g, '-');
    const fname = filename || `cv-${slug}-${date}.pdf`;
    const pdfPath = await generatePdf(html, fname);

    res.json({
      path: pdfPath,
      filename: fname,
      url: `/output/${fname}`,
    });
  } catch (err: any) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: err.message || 'PDF generation failed' });
  }
});

// Tailor CV for a job description then generate PDF
pdfRouter.post('/tailor', async (req, res) => {
  try {
    const { cvData, jobDescription, jobUrl, company } = req.body;

    if (!cvData || !jobDescription) {
      res.status(400).json({ error: 'cvData and jobDescription required' });
      return;
    }

    // Step 1: AI tailors the CV
    const { html, tailoredData } = await tailorCV({ cvData, jobDescription, jobUrl });

    // Step 2: Generate PDF
    const date = new Date().toISOString().split('T')[0];
    const nameSlug = (cvData.name || 'candidate').toLowerCase().replace(/\s+/g, '-');
    const companySlug = (company || 'company').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fname = `cv-${nameSlug}-${companySlug}-${date}.pdf`;
    const pdfPath = await generatePdf(html, fname);

    res.json({
      path: pdfPath,
      filename: fname,
      url: `/output/${fname}`,
      tailoredCV: tailoredData,
      html,
    });
  } catch (err: any) {
    console.error('Tailor+PDF error:', err);
    res.status(500).json({ error: err.message || 'CV tailoring failed' });
  }
});

// Download PDF
pdfRouter.get('/download/:filename', (req, res) => {
  const filePath = path.join(getOutputDir(), req.params.filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  res.download(filePath);
});

// List generated PDFs
pdfRouter.get('/list', (_req, res) => {
  const outputDir = getOutputDir();
  const files = fs.readdirSync(outputDir)
    .filter((f) => f.endsWith('.pdf'))
    .map((f) => {
      const stat = fs.statSync(path.join(outputDir, f));
      return {
        filename: f,
        url: `/output/${f}`,
        size: stat.size,
        created: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  res.json(files);
});
