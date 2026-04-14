import { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Target,
  Lightbulb,
  ArrowRight,
  Loader2,
  FileText,
  Download,
  Zap,
  WifiOff,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TextArea } from '../components/ui/TextArea';
import { Input } from '../components/ui/Input';
import { useAppStore } from '../store/useAppStore';
import { scoreToGrade, getGradeColor } from '../utils/helpers';
import { api } from '../utils/api';
import type { PipelineResponse } from '../utils/api';

type Step = 'idle' | 'evaluating' | 'tailoring' | 'generating_pdf' | 'done' | 'error';

export function Evaluate() {
  const { addApplication, cvs } = useAppStore();
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedCVId, setSelectedCVId] = useState<string>('');
  const [step, setStep] = useState<Step>('idle');
  const [result, setResult] = useState<PipelineResponse | null>(null);
  const [error, setError] = useState('');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    api.health()
      .then((h) => setBackendOnline(h.status === 'ok'))
      .catch(() => setBackendOnline(false));
  }, []);

  const selectedCV = cvs.find((c) => c.id === selectedCVId);

  const cvDataFromStore = selectedCV
    ? {
        name: selectedCV.sections.find((s) => s.type === 'header')?.content || selectedCV.name,
        email: '',
        location: '',
        summary: selectedCV.sections.find((s) => s.type === 'summary')?.content || '',
        competencies: selectedCV.sections.find((s) => s.type === 'skills')?.content?.split(',').map((s) => s.trim()) || [],
        experience: selectedCV.sections
          .filter((s) => s.type === 'experience')
          .flatMap((s) =>
            s.items.map((i) => ({
              company: i.subtitle,
              role: i.title,
              period: i.date,
              location: '',
              bullets: i.bullets.filter(Boolean),
            }))
          ),
        projects: selectedCV.sections
          .filter((s) => s.type === 'projects')
          .flatMap((s) =>
            s.items.map((i) => ({
              title: i.title,
              description: i.description,
              tech: i.bullets.join(', '),
            }))
          ),
        education: selectedCV.sections
          .filter((s) => s.type === 'education')
          .flatMap((s) =>
            s.items.map((i) => ({
              title: i.title,
              org: i.subtitle,
              year: i.date,
              description: i.description,
            }))
          ),
        certifications: selectedCV.sections
          .filter((s) => s.type === 'certifications')
          .flatMap((s) =>
            s.items.map((i) => ({
              title: i.title,
              org: i.subtitle,
              year: i.date,
            }))
          ),
        skills: selectedCV.sections
          .filter((s) => s.type === 'skills')
          .flatMap((s) =>
            s.items.map((i) => ({
              category: i.title,
              items: i.bullets.filter(Boolean),
            }))
          ),
      }
    : undefined;

  const handleAutoPipeline = async () => {
    if (!jobDescription && !jobUrl) return;
    setError('');
    setResult(null);

    try {
      setStep('evaluating');

      const pipelineResult = await api.pipeline({
        jobDescription,
        jobUrl: jobUrl || undefined,
        cvData: cvDataFromStore,
      });

      setResult(pipelineResult);
      setStep('done');

      // Auto-save to tracker
      const ev = pipelineResult.evaluation;
      addApplication({
        company: ev.company,
        role: ev.role,
        url: jobUrl,
        status: 'evaluated',
        score: ev.score,
        grade: scoreToGrade(ev.score),
        dateApplied: null,
        notes: `Archetype: ${ev.archetype}\nComp: ${ev.compRange}${
          pipelineResult.pdf?.url ? `\nPDF: ${pipelineResult.pdf.url}` : ''
        }`,
        tags: [ev.archetype],
        location: ev.location,
        salary: ev.compRange,
        remote: ev.remote,
        evaluation: {
          roleSummary: ev.roleSummary,
          archetype: ev.archetype,
          cvMatch: ev.cvMatch,
          gaps: ev.gaps,
          strengths: ev.strengths,
          levelFit: ev.levelFit,
          compRange: ev.compRange,
          personalizations: ev.personalizations,
          interviewQuestions: ev.interviewQuestions,
          legitimacy: ev.legitimacy,
        },
        cvId: selectedCVId || null,
      });
    } catch (err: any) {
      setError(err.message);
      setStep('error');
    }
  };

  const ev = result?.evaluation;

  const legIcon = {
    high: <CheckCircle size={16} className="text-emerald-400" />,
    medium: <AlertTriangle size={16} className="text-amber-400" />,
    suspicious: <XCircle size={16} className="text-red-400" />,
  };
  const legLabel = {
    high: 'High Confidence — Real, active opening',
    medium: 'Proceed with Caution — Mixed signals',
    suspicious: 'Suspicious — Ghost job indicators',
  };
  const legVariant = {
    high: 'success' as const,
    medium: 'warning' as const,
    suspicious: 'danger' as const,
  };

  const stepLabels: Record<Step, string> = {
    idle: '',
    evaluating: 'Evaluating job with AI...',
    tailoring: 'Tailoring CV for this role...',
    generating_pdf: 'Generating ATS-optimized PDF...',
    done: 'Pipeline complete!',
    error: 'Something went wrong',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Auto Pipeline</h1>
          <p className="text-surface-400 mt-1">
            Paste a job → AI evaluates → tailors your CV → generates PDF
          </p>
        </div>
        {backendOnline === false && (
          <Badge variant="danger">
            <WifiOff size={12} className="mr-1" /> Backend offline
          </Badge>
        )}
        {backendOnline === true && (
          <Badge variant="success">
            <Zap size={12} className="mr-1" /> Connected
          </Badge>
        )}
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <Input
            label="Job URL (optional)"
            placeholder="https://careers.company.com/job/..."
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
          <TextArea
            label="Job Description"
            placeholder="Paste the full job description here..."
            rows={8}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          {cvs.length > 0 && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-surface-300">
                Attach CV (optional — enables auto PDF generation)
              </label>
              <select
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedCVId}
                onChange={(e) => setSelectedCVId(e.target.value)}
              >
                <option value="">No CV — evaluate only</option>
                {cvs.map((cv) => (
                  <option key={cv.id} value={cv.id}>
                    {cv.name} {cv.targetRole ? `(${cv.targetRole})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            {step !== 'idle' && step !== 'done' && step !== 'error' && (
              <div className="flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-primary-400" />
                <span className="text-sm text-surface-300">{stepLabels[step]}</span>
              </div>
            )}
            {step === 'done' && (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">
                  Evaluated, saved to tracker
                  {result?.pdf?.url && ' + PDF generated'}
                </span>
              </div>
            )}
            {step === 'error' && <span className="text-sm text-red-400">{error}</span>}
            {step === 'idle' && <div />}
            <Button
              onClick={handleAutoPipeline}
              disabled={(!jobDescription && !jobUrl) || (step !== 'idle' && step !== 'done' && step !== 'error') || backendOnline === false}
            >
              {step === 'evaluating' || step === 'tailoring' || step === 'generating_pdf' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Run Auto Pipeline
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {ev && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {ev.company} — {ev.role}
                </h2>
                <p className="text-surface-400 text-sm mt-1">{ev.archetype}</p>
                {ev.location && (
                  <p className="text-surface-500 text-xs mt-0.5">{ev.location}{ev.remote ? ' (Remote)' : ''}</p>
                )}
              </div>
              <div className="text-right">
                <span className={`text-4xl font-bold ${getGradeColor(scoreToGrade(ev.score))}`}>
                  {scoreToGrade(ev.score)}
                </span>
                <p className="text-sm text-surface-400">{ev.score.toFixed(1)} / 5.0</p>
                <p className="text-xs text-surface-500">CV Match: {ev.cvMatch}%</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-2">Role Summary</h3>
                <p className="text-surface-200">{ev.roleSummary}</p>
              </div>

              <div className="flex items-center gap-2">
                {legIcon[ev.legitimacy]}
                <Badge variant={legVariant[ev.legitimacy]}>{legLabel[ev.legitimacy]}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-1">Level Fit</h3>
                  <p className="text-surface-200 text-sm">{ev.levelFit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-1">Compensation</h3>
                  <p className="text-surface-200 text-sm">{ev.compRange}</p>
                </div>
              </div>
            </div>
          </Card>

          {result?.pdf?.url && (
            <Card className="p-4 border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-emerald-400" />
                  <div>
                    <p className="font-medium text-white">Tailored CV Generated</p>
                    <p className="text-xs text-surface-400">{result.pdf.filename}</p>
                  </div>
                </div>
                <a
                  href={`http://localhost:3001${result.pdf.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="secondary">
                    <Download size={14} /> Download PDF
                  </Button>
                </a>
              </div>
            </Card>
          )}

          {result?.autoApply && (
            <Card className="p-4 border-primary-500/30 bg-primary-500/5">
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-primary-400" />
                <p className="text-sm text-primary-300">
                  <strong>Score 4.5+:</strong> This is a strong match. Apply immediately!
                </p>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={18} className="text-emerald-400" />
                <h3 className="font-semibold text-white">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {ev.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                    <span className="text-emerald-400 mt-0.5">+</span> {s}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-amber-400" />
                <h3 className="font-semibold text-white">Gaps to Address</h3>
              </div>
              <ul className="space-y-2">
                {ev.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                    <span className="text-amber-400 mt-0.5">-</span> {g}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-accent-400" />
              <h3 className="font-semibold text-white">CV Personalizations</h3>
            </div>
            <ul className="space-y-2">
              {ev.personalizations.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                  <ArrowRight size={14} className="text-accent-400 mt-0.5 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-primary-400" />
              <h3 className="font-semibold text-white">Likely Interview Questions</h3>
            </div>
            <ul className="space-y-3">
              {ev.interviewQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-surface-300">
                  <span className="text-primary-400 font-mono text-xs mt-0.5 shrink-0">Q{i + 1}</span> {q}
                </li>
              ))}
            </ul>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setResult(null);
                setStep('idle');
                setJobDescription('');
                setJobUrl('');
              }}
            >
              Evaluate Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
