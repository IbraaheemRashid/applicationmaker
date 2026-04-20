import path from 'path';
import fs from 'fs';

export function getReportsDir(): string {
  const dir = path.resolve('reports');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
