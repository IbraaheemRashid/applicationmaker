import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, ListChecks, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const steps = [
  {
    icon: Sparkles,
    title: 'Start here — paste a job',
    body: 'Drop a job description into Apply. You get a fit score, a ghost-job check, tailored bullets, and a cover letter in under two minutes.',
  },
  {
    icon: ListChecks,
    title: 'Everything lands in Pipeline',
    body: 'Every job you evaluate saves to Pipeline. Move it through saved → applied → interview. No spreadsheet required.',
  },
  {
    icon: MessageSquare,
    title: 'Compound your prep',
    body: 'Interview keeps a STAR story bank that grows with every application. Reuse stories across loops — they get sharper, not repetitive.',
  },
  {
    icon: SettingsIcon,
    title: 'One thing before you start',
    body: 'Open Settings to add an API key (or flip Mock Mode on to poke around first). Keys stay in your local .env — never sent anywhere else.',
  },
];

export function Tour() {
  const { tourComplete, completeTour } = useAppStore();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!tourComplete) {
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, [tourComplete]);

  if (tourComplete || !visible) return null;

  const finish = () => {
    setVisible(false);
    completeTour();
  };

  const s = steps[step];
  const Icon = s.icon;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" />

      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-8 pointer-events-auto fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === step ? 'w-6 bg-accent-500' : i < step ? 'w-4 bg-neutral-700' : 'w-4 bg-neutral-800'
                }`}
              />
            ))}
          </div>
          <button
            onClick={finish}
            className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>

        <div className="w-9 h-9 rounded-lg bg-accent-500/10 border border-accent-500/30 flex items-center justify-center mb-4">
          <Icon size={16} className="text-accent-500" />
        </div>

        <h3 className="text-lg font-semibold text-neutral-100 tracking-tight mb-2">{s.title}</h3>
        <p className="text-sm text-neutral-400 leading-relaxed mb-6">{s.body}</p>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-neutral-600 font-mono">
            {String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
          </span>
          <button
            onClick={() => (isLast ? finish() : setStep(step + 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-950 text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            {isLast ? "Let's go" : 'Next'}
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
