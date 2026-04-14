import { useState } from 'react';
import {
  Radar,
  Loader2,
  ExternalLink,
  MapPin,
  Plus,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useAppStore } from '../store/useAppStore';
import { api } from '../utils/api';

interface JobListing {
  title: string;
  url: string;
  company: string;
  location?: string;
  source: string;
}

export function Scan() {
  const { addApplication } = useAppStore();
  const [scanning, setScanning] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = useState('');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const handleScan = async () => {
    setScanning(true);
    setJobs([]);
    setErrors([]);
    try {
      const result = await api.scan(companyFilter || undefined);
      setJobs(result.jobs);
      setScannedCount(result.scanned);
      setErrors(result.errors);
    } catch (err: any) {
      setErrors([err.message]);
    } finally {
      setScanning(false);
    }
  };

  const handleSaveJob = (job: JobListing) => {
    addApplication({
      company: job.company,
      role: job.title,
      url: job.url,
      status: 'saved',
      score: null,
      grade: null,
      dateApplied: null,
      notes: `Found via ${job.source} scan`,
      tags: [job.source],
      location: job.location || '',
      salary: '',
      remote: false,
      evaluation: null,
      cvId: null,
    });
    setSavedJobs((prev) => new Set([...prev, job.url]));
  };

  const sourceColors: Record<string, string> = {
    greenhouse: 'bg-green-500/20 text-green-400',
    ashby: 'bg-blue-500/20 text-blue-400',
    lever: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portal Scanner</h1>
          <p className="text-surface-400 mt-1">Scan career portals for matching job openings</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex gap-3">
          <Input
            placeholder="Filter by company name (optional)"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleScan} disabled={scanning}>
            {scanning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Radar size={16} />
                Scan Portals
              </>
            )}
          </Button>
        </div>
      </Card>

      {scannedCount > 0 && (
        <div className="flex items-center gap-4">
          <Badge variant="info">{scannedCount} companies scanned</Badge>
          <Badge variant="success">{jobs.length} jobs found</Badge>
          {errors.length > 0 && <Badge variant="warning">{errors.length} errors</Badge>}
        </div>
      )}

      {errors.length > 0 && (
        <Card className="p-4 border-amber-500/30">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-400 mt-0.5" />
            <div className="text-sm text-surface-300">
              {errors.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          </div>
        </Card>
      )}

      {jobs.length > 0 && (
        <div className="space-y-2">
          {jobs.map((job) => (
            <Card key={job.url} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white truncate">{job.title}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sourceColors[job.source] || 'bg-surface-700 text-surface-300'
                      }`}
                    >
                      {job.source}
                    </span>
                  </div>
                  <p className="text-sm text-surface-400">{job.company}</p>
                  {job.location && (
                    <p className="text-xs text-surface-500 flex items-center gap-1 mt-1">
                      <MapPin size={11} /> {job.location}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                  {savedJobs.has(job.url) ? (
                    <Button size="sm" variant="ghost" disabled>
                      <CheckCircle size={14} className="text-emerald-400" /> Saved
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => handleSaveJob(job)}>
                      <Plus size={14} /> Save
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!scanning && jobs.length === 0 && scannedCount === 0 && (
        <Card className="p-12 text-center">
          <Radar size={32} className="text-surface-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Scan career portals</h3>
          <p className="text-surface-400 mb-4 max-w-md mx-auto">
            Automatically scan Greenhouse, Ashby, and Lever job boards for positions matching your profile.
            Configure tracked companies in portals.yml.
          </p>
          <Button onClick={handleScan}>
            <Radar size={16} /> Start Scanning
          </Button>
        </Card>
      )}
    </div>
  );
}
