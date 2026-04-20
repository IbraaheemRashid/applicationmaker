import { useState, useEffect } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  FlaskConical,
  WifiOff,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { TextArea } from '../components/ui/TextArea';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppStore } from '../store/useAppStore';
import { scoreToGrade, getGradeColor } from '../utils/helpers';
import { api } from '../utils/api';
import type { EvaluationResponse, HealthCheck } from '../utils/api';

type Step = 'idle' | 'running' | 'done' | 'error';

export function Apply() {
  const { addApplication, cvs } = useAppStore();

  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedCVId, setSelectedCVId] = useState<string>(cvs[0]?.id || '');
  const [step, setStep] = useState<Step>('idle');
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState('');
  const [health, setHealth] = useState<HealthCheck | null>(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    if (!selectedCVId && cvs[0]) setSelectedCVId(cvs[0].id);
  }, [cvs, selectedCVId]);

  const selectedCV = cvs.find((c) => c.id === selectedCVId);

  const run = async () => {
    if (!jobDescription && !jobUrl) return;
    setError('');
    setResult(null);
    setStep('running');

    try {
      const { evaluation } = await api.pipeline({
        jobDescription,
        jobUrl: jobUrl || undefined,
        cvContent: selectedCV?.content,
      });

      setResult(evaluation);
      setStep('done');

      addApplication({
        company: evaluation.company,
        role: evaluation.role,
        url: jobUrl,
        status: 'evaluated',
        score: evaluation.score,
        grade: scoreToGrade(evaluation.score),
        dateApplied: null,
        notes: `${evaluation.archetype} • ${evaluation.compRange}`,
        tags: [evaluation.archetype],
        location: evaluation.location,
        salary: evaluation.compRange,
        remote: evaluation.remote,
        evaluation: {
          roleSummary: evaluation.roleSummary,
          archetype: evaluation.archetype,
          cvMatch: evaluation.cvMatch,
          gaps: evaluation.gaps,
          strengths: evaluation.strengths,
          levelFit: evaluation.levelFit,
          compRange: evaluation.compRange,
          personalizations: evaluation.personalizations,
          interviewQuestions: evaluation.interviewQuestions,
          legitimacy: evaluation.legitimacy,
          tailoredSummary: evaluation.tailoredSummary,
          tailoredBullets: evaluation.tailoredBullets,
          coverLetter: evaluation.coverLetter,
        },
        cvId: selectedCVId || null,
      });
    } catch (err: any) {
      setError(err.message);
      setStep('error');
    }
  };

  const reset = () => {
    setResult(null);
    setStep('idle');
    setJobDescription('');
    setJobUrl('');
    setError('');
  };

  return (
    <div className="space-y-8" data-tour="apply-page">
      <Header health={health} />

      <div className="card p-6 space-y-4">
        <Input
          label="Job URL (optional)"
          placeholder="https://careers.company.com/…"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
        />
        <TextArea
          label="Job description"
          placeholder="Paste the full job description. The more detail, the sharper the evaluation."
          rows={10}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <div className="flex items-end justify-between gap-4 pt-1">
          <div className="min-w-0 flex-1">
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">
              CV
            </label>
            {cvs.length === 0 ? (
              <p className="text-xs text-neutral-500">
                No CV yet — evaluation runs without one. <span className="text-accent-500">Open Settings → My CVs</span> to add one for tailored output.
              </p>
            ) : (
              <div className="relative">
                <select
                  value={selectedCVId}
                  onChange={(e) => setSelectedCVId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:border-neutral-600 appearance-none cursor-pointer"
                >
                  <option value="">No CV — evaluate only</option>
                  {cvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              </div>
            )}
          </div>
          <Button
            onClick={run}
            disabled={(!jobDescription && !jobUrl) || step === 'running'}
          >
            {step === 'running' ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Sparkles size={13} />
                Evaluate job
              </>
            )}
          </Button>
        </div>

        {step === 'running' && <RunningBar />}
        {step === 'error' && (
          <div className="text-sm text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {result && <Results result={result} onReset={reset} />}
    </div>
  );
}

function Header({ health }: { health: HealthCheck | null }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">Apply</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Paste a job. Get fit score, ghost-job check, tailored bullets, cover letter.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {health?.mockAi && (
          <Badge variant="warning">
            <FlaskConical size={11} /> Mock mode
          </Badge>
        )}
        {health ? (
          health.hasApiKey || health.mockAi ? (
            <Badge variant="success">
              <Zap size={11} /> Ready
            </Badge>
          ) : (
            <Badge variant="warning">
              <AlertTriangle size={11} /> No API key
            </Badge>
          )
        ) : (
          <Badge variant="danger">
            <WifiOff size={11} /> Offline
          </Badge>
        )}
      </div>
    </div>
  );
}

function RunningBar() {
  return (
    <div className="flex items-center gap-3 text-sm text-neutral-400 bg-neutral-900/50 border border-neutral-800 rounded-lg px-3 py-2.5">
      <Loader2 size={14} className="animate-spin text-accent-500" />
      <span>Evaluating fit, flagging legitimacy, tailoring bullets…</span>
    </div>
  );
}

function Results({ result, onReset }: { result: EvaluationResponse; onReset: () => void }) {
  const grade = scoreToGrade(result.score);

  const legMeta = {
    high: { icon: <CheckCircle2 size={13} />, label: 'High confidence — real role', variant: 'success' as const },
    medium: { icon: <AlertTriangle size={13} />, label: 'Proceed with caution — mixed signals', variant: 'warning' as const },
    suspicious: { icon: <XCircle size={13} />, label: 'Suspicious — looks like a ghost job', variant: 'danger' as const },
  };
  const leg = legMeta[result.legitimacy];

  return (
    <div className="space-y-4 fade-in">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-neutral-100 truncate">
              {result.company} <span className="text-neutral-500">·</span> {result.role}
            </h2>
            <p className="text-sm text-neutral-400 mt-0.5">
              {result.archetype}
              {result.location && ` · ${result.location}${result.remote ? ' (Remote)' : ''}`}
              {result.compRange && ` · ${result.compRange}`}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-4xl font-semibold tracking-tight ${getGradeColor(grade)}`}>
              {grade}
            </div>
            <p className="text-[11px] text-neutral-500 font-mono">
              {result.score.toFixed(1)} / 5.0 · match {result.cvMatch}%
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <Badge variant={leg.variant}>
            {leg.icon} {leg.label}
          </Badge>
          {result.score >= 4.5 && (
            <Badge variant="accent">
              <Zap size={11} /> Strong match — apply now
            </Badge>
          )}
        </div>

        <p className="mt-5 text-sm text-neutral-300 leading-relaxed">{result.roleSummary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ListCard title="Strengths" items={result.strengths} tone="emerald" />
        <ListCard title="Gaps" items={result.gaps} tone="amber" />
      </div>

      <CopyBlock
        title="Tailored summary"
        subtitle="Drop into the top of your CV"
        content={result.tailoredSummary}
      />

      <CopyBlock
        title="Tailored bullets"
        subtitle="Reformulated from your CV using JD vocabulary — never invented"
        content={result.tailoredBullets.map((b) => `• ${b}`).join('\n')}
      />

      <CopyBlock
        title="Cover letter"
        subtitle="Paste into the application form"
        content={result.coverLetter}
      />

      <ListCard title="Likely interview questions" items={result.interviewQuestions} tone="neutral" numbered />

      <div className="flex justify-end">
        <Button variant="secondary" onClick={onReset}>
          Evaluate another
        </Button>
      </div>
    </div>
  );
}

function ListCard({
  title,
  items,
  tone,
  numbered,
}: {
  title: string;
  items: string[];
  tone: 'emerald' | 'amber' | 'neutral';
  numbered?: boolean;
}) {
  const bullet = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    neutral: 'text-neutral-500',
  }[tone];
  return (
    <div className="card p-5">
      <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2 text-sm text-neutral-200 leading-relaxed">
            <span className={`${bullet} font-mono text-xs mt-0.5 shrink-0 w-4`}>
              {numbered ? String(i + 1).padStart(2, '0') : tone === 'amber' ? '−' : '+'}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CopyBlock({ title, subtitle, content }: { title: string; subtitle: string; content: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3 gap-4">
        <div className="min-w-0">
          <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{title}</h3>
          <p className="text-[11px] text-neutral-600 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-400 hover:text-neutral-100 border border-neutral-800 hover:border-neutral-700 rounded-md transition-colors cursor-pointer"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans">
        {content}
      </pre>
    </div>
  );
}
