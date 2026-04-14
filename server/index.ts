import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { evaluateRouter } from './routes/evaluate';
import { pdfRouter } from './routes/pdf';
import { scanRouter } from './routes/scan';
import { pipelineRouter } from './routes/pipeline';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API key management - set via UI or .env
app.post('/api/settings/api-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    res.status(400).json({ error: 'Invalid API key format. Must start with sk-ant-' });
    return;
  }
  process.env.ANTHROPIC_API_KEY = apiKey;

  // Also persist to .env so it survives restarts
  const envPath = path.resolve('.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    // Replace existing key
    if (envContent.includes('ANTHROPIC_API_KEY=')) {
      envContent = envContent.replace(/ANTHROPIC_API_KEY=.*/g, `ANTHROPIC_API_KEY=${apiKey}`);
    } else {
      envContent += `\nANTHROPIC_API_KEY=${apiKey}\n`;
    }
  } else {
    envContent = `ANTHROPIC_API_KEY=${apiKey}\n`;
  }
  fs.writeFileSync(envPath, envContent);

  res.json({ success: true, message: 'API key saved' });
});

app.get('/api/settings', (_req, res) => {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  const keyPreview = hasApiKey
    ? process.env.ANTHROPIC_API_KEY!.slice(0, 12) + '...' + process.env.ANTHROPIC_API_KEY!.slice(-4)
    : null;
  res.json({ hasApiKey, keyPreview });
});

// Serve generated PDFs
const outputDir = path.resolve('output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
app.use('/output', express.static(outputDir));

// API routes
app.use('/api/evaluate', evaluateRouter);
app.use('/api/pdf', pdfRouter);
app.use('/api/scan', scanRouter);
app.use('/api/pipeline', pipelineRouter);

// Health check
app.get('/api/health', (_req, res) => {
  const careerOpsPath = path.resolve('..', 'career-ops');
  const hasCareerOps = fs.existsSync(careerOpsPath);
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    status: 'ok',
    careerOpsConnected: hasCareerOps,
    careerOpsPath: hasCareerOps ? careerOpsPath : null,
    hasApiKey,
  });
});

app.listen(PORT, () => {
  console.log(`ApplyNow API running on http://localhost:${PORT}`);
  console.log(`Career-ops path: ${path.resolve('..', 'career-ops')}`);
});
