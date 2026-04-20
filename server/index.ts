import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { evaluateRouter } from './routes/evaluate';
import { pipelineRouter } from './routes/pipeline';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const envPath = path.resolve('.env');

function writeEnv(updates: Record<string, string>) {
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, 'm');
    if (re.test(envContent)) {
      envContent = envContent.replace(re, line);
    } else {
      envContent += (envContent.endsWith('\n') || envContent === '' ? '' : '\n') + line + '\n';
    }
  }
  fs.writeFileSync(envPath, envContent);
}

app.post('/api/settings/api-key', (req, res) => {
  const { apiKey, baseUrl, model, mockAi } = req.body as {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    mockAi?: boolean;
  };

  const updates: Record<string, string> = {};
  if (typeof apiKey === 'string') {
    if (apiKey && apiKey.length < 10) {
      res.status(400).json({ error: 'Key looks too short.' });
      return;
    }
    process.env.ANTHROPIC_API_KEY = apiKey;
    updates.ANTHROPIC_API_KEY = apiKey;
  }
  if (typeof baseUrl === 'string') {
    if (baseUrl) process.env.ANTHROPIC_BASE_URL = baseUrl;
    else delete process.env.ANTHROPIC_BASE_URL;
    updates.ANTHROPIC_BASE_URL = baseUrl;
  }
  if (typeof model === 'string') {
    if (model) process.env.ANTHROPIC_MODEL = model;
    else delete process.env.ANTHROPIC_MODEL;
    updates.ANTHROPIC_MODEL = model;
  }
  if (typeof mockAi === 'boolean') {
    process.env.MOCK_AI = mockAi ? 'true' : 'false';
    updates.MOCK_AI = mockAi ? 'true' : 'false';
  }

  writeEnv(updates);
  res.json({ success: true });
});

app.get('/api/settings', (_req, res) => {
  const key = process.env.ANTHROPIC_API_KEY || '';
  const keyPreview = key ? `${key.slice(0, 8)}...${key.slice(-4)}` : null;
  res.json({
    hasApiKey: !!key,
    keyPreview,
    baseUrl: process.env.ANTHROPIC_BASE_URL || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    mockAi: process.env.MOCK_AI === 'true' || process.env.MOCK_AI === '1',
  });
});

app.use('/api/evaluate', evaluateRouter);
app.use('/api/pipeline', pipelineRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    mockAi: process.env.MOCK_AI === 'true' || process.env.MOCK_AI === '1',
    baseUrl: process.env.ANTHROPIC_BASE_URL || null,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
  });
});

app.listen(PORT, () => {
  console.log(`ApplyNow API running on http://localhost:${PORT}`);
  if (process.env.MOCK_AI === 'true' || process.env.MOCK_AI === '1') {
    console.log('⚠️  MOCK_AI mode enabled — no real API calls will be made.');
  }
  if (process.env.ANTHROPIC_BASE_URL) {
    console.log(`→ Using custom base URL: ${process.env.ANTHROPIC_BASE_URL}`);
  }
});
