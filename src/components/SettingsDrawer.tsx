import { useEffect, useState } from 'react';
import { X, Key, FileText, Plus, Trash2, Check, AlertCircle, Info } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TextArea } from './ui/TextArea';
import { Badge } from './ui/Badge';
import { api } from '../utils/api';
import type { SettingsPayload } from '../utils/api';
import { useAppStore } from '../store/useAppStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'ai' | 'cvs';

export function SettingsDrawer({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('ai');
  const [settings, setSettings] = useState<SettingsPayload | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [mockAi, setMockAi] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMsg, setSaveMsg] = useState('');

  const { cvs, addCV, deleteCV } = useAppStore();
  const [cvName, setCvName] = useState('');
  const [cvContent, setCvContent] = useState('');

  useEffect(() => {
    if (open) {
      api.getSettings().then((s) => {
        setSettings(s);
        setBaseUrl(s.baseUrl);
        setModel(s.model);
        setMockAi(s.mockAi);
      });
    }
  }, [open]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);

  const save = async () => {
    setSaveStatus('saving');
    try {
      await api.saveSettings({
        apiKey: apiKey || undefined,
        baseUrl,
        model,
        mockAi,
      });
      setApiKey('');
      const updated = await api.getSettings();
      setSettings(updated);
      setSaveStatus('saved');
      setSaveMsg('Saved');
      setTimeout(() => setSaveStatus('idle'), 1600);
    } catch (err: any) {
      setSaveStatus('error');
      setSaveMsg(err.message);
    }
  };

  const handleAddCv = () => {
    if (!cvName.trim() || !cvContent.trim()) return;
    addCV({ name: cvName.trim(), content: cvContent.trim() });
    setCvName('');
    setCvContent('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCvContent(text);
    if (!cvName) setCvName(file.name.replace(/\.[^.]+$/, ''));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-neutral-950 border-l border-neutral-800 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900">
          <h2 className="text-sm font-semibold text-neutral-100">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-900 text-neutral-500 hover:text-neutral-200 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-1 px-6 pt-4 border-b border-neutral-900">
          {(['ai', 'cvs'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors cursor-pointer ${
                tab === t
                  ? 'text-neutral-100 border-accent-500'
                  : 'text-neutral-500 hover:text-neutral-300 border-transparent'
              }`}
            >
              {t === 'ai' ? 'AI provider' : `My CVs (${cvs.length})`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {tab === 'ai' && (
            <>
              <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2">
                <Info size={13} className="shrink-0" />
                <span>
                  Key is stored in your local <code className="text-accent-500">.env</code>. Never sent anywhere but the provider you choose.
                </span>
              </div>

              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                    <Key size={12} /> Mock mode
                  </span>
                  <button
                    onClick={() => setMockAi(!mockAi)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                      mockAi ? 'bg-accent-500' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-neutral-100 transition-transform ${
                        mockAi ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </label>
                <p className="text-xs text-neutral-500">
                  Returns canned output without calling any API. Use this to try the UI before setting up billing.
                </p>
              </div>

              <div className="border-t border-neutral-900 pt-5 space-y-4">
                <div>
                  <Input
                    label="API key"
                    type="password"
                    placeholder={settings?.hasApiKey ? `current: ${settings.keyPreview}` : 'sk-ant-... or sk-or-...'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-neutral-500 mt-1.5">
                    Anthropic: keys start <code className="text-accent-500">sk-ant-</code>. OpenRouter: <code className="text-accent-500">sk-or-</code>.
                  </p>
                </div>

                <Input
                  label="Base URL (optional)"
                  placeholder="e.g. https://openrouter.ai/api/v1"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
                <p className="text-xs text-neutral-500 -mt-2">
                  Leave empty for Anthropic. Set to <code className="text-accent-500">https://openrouter.ai/api/v1</code> to use OpenRouter (cheaper, easier billing).
                </p>

                <Input
                  label="Model"
                  placeholder="claude-sonnet-4-20250514"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
                <p className="text-xs text-neutral-500 -mt-2">
                  For OpenRouter, try <code className="text-accent-500">anthropic/claude-sonnet-4</code>.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs">
                  {saveStatus === 'saved' && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check size={12} /> {saveMsg}
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle size={12} /> {saveMsg}
                    </span>
                  )}
                </div>
                <Button onClick={save} disabled={saveStatus === 'saving'}>
                  {saveStatus === 'saving' ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </>
          )}

          {tab === 'cvs' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                    <FileText size={12} /> Saved CVs
                  </h3>
                  {cvs.length > 0 && <Badge>{cvs.length}</Badge>}
                </div>

                {cvs.length === 0 ? (
                  <p className="text-xs text-neutral-500">No CVs yet. Paste one below — plain text, Markdown, or upload a .txt file.</p>
                ) : (
                  <div className="space-y-1.5">
                    {cvs.map((cv) => (
                      <div
                        key={cv.id}
                        className="group flex items-center justify-between px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-neutral-100 truncate">{cv.name}</p>
                          <p className="text-xs text-neutral-500">{cv.content.length} chars</p>
                        </div>
                        <button
                          onClick={() => deleteCV(cv.id)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-900 pt-5 space-y-3">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide flex items-center gap-2">
                  <Plus size={12} /> Add a CV
                </h3>
                <Input
                  label="Name"
                  placeholder="e.g. Senior IC — April 2026"
                  value={cvName}
                  onChange={(e) => setCvName(e.target.value)}
                />
                <TextArea
                  label="Content"
                  placeholder="Paste your CV as plain text or Markdown. We'll use this to evaluate fit and tailor bullets for each job."
                  rows={10}
                  value={cvContent}
                  onChange={(e) => setCvContent(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer inline-flex items-center gap-1.5">
                    <FileText size={12} />
                    <span>Or upload a .txt / .md file</span>
                    <input
                      type="file"
                      accept=".txt,.md,.markdown"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <Button onClick={handleAddCv} disabled={!cvName.trim() || !cvContent.trim()}>
                    <Plus size={13} /> Save CV
                  </Button>
                </div>
                <p className="text-[11px] text-neutral-600">
                  Tip: keep your source-of-truth CV in LaTeX / Overleaf. Paste the rendered text here — the tailored bullets come back as text you can paste into your template.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
