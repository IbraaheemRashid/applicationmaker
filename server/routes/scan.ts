import { Router } from 'express';
import { scanPortals, getCompanies } from '../services/scanner';

export const scanRouter = Router();

scanRouter.post('/', async (req, res) => {
  try {
    const { company } = req.body;
    const result = await scanPortals(company);
    res.json(result);
  } catch (err: any) {
    console.error('Scan error:', err);
    res.status(500).json({ error: err.message || 'Scan failed' });
  }
});

scanRouter.get('/companies', (_req, res) => {
  try {
    const companies = getCompanies();
    res.json(companies);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
