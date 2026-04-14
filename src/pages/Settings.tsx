import { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertCircle, Loader2, Shield, Server } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

const API_BASE = 'http://localhost:3001/api';

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [keyPreview, setKeyPreview] = useState<string | null>(null);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then((r) => r.json())
      .then((data) => {
        setHasKey(data.hasApiKey);
        setKeyPreview(data.keyPreview);
      })
      .catch(() => {});

    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!apiKey) return;
    setSaving(true);
    setStatus('idle');
    try {
      const res = await fetch(`${API_BASE}/settings/api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('success');
      setStatusMsg('API key saved successfully');
      setHasKey(true);
      setKeyPreview(apiKey.slice(0, 12) + '...' + apiKey.slice(-4));
      setApiKey('');
    } catch (err: any) {
      setStatus('error');
      setStatusMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-surface-400 mt-1">Configure your ApplyNow instance</p>
      </div>

      {/* Connection Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Server size={18} />
          Connection Status
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-300">Backend API</span>
            {health ? (
              <Badge variant="success">Connected</Badge>
            ) : (
              <Badge variant="danger">Offline</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-300">Career-ops</span>
            {health?.careerOpsConnected ? (
              <Badge variant="success">Found at {health.careerOpsPath}</Badge>
            ) : (
              <Badge variant="warning">Not found</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-300">Anthropic API Key</span>
            {hasKey ? (
              <Badge variant="success">{keyPreview}</Badge>
            ) : (
              <Badge variant="danger">Not set</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* API Key */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Key size={18} />
          Anthropic API Key
        </h2>
        <p className="text-sm text-surface-400 mb-4">
          Required for AI evaluation, CV tailoring, and PDF generation. Your key is stored locally in a <code className="text-primary-400">.env</code> file and never sent anywhere except Anthropic's API.
        </p>

        <div className="space-y-4">
          <Input
            type="password"
            placeholder="sk-ant-api03-..."
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setStatus('idle');
            }}
          />

          {status === 'success' && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle size={16} />
              {statusMsg}
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {statusMsg}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-surface-500 text-xs">
              <Shield size={12} />
              Saved to .env locally — never shared
            </div>
            <Button onClick={handleSave} disabled={!apiKey || saving}>
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save API Key'
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* How to get a key */}
      {!hasKey && (
        <Card className="p-6 border-primary-500/20 bg-primary-500/5">
          <h3 className="font-semibold text-white mb-2">How to get an API key</h3>
          <ol className="text-sm text-surface-300 space-y-2 list-decimal list-inside">
            <li>Go to <span className="text-primary-400">console.anthropic.com</span></li>
            <li>Sign up or log in</li>
            <li>Navigate to API Keys in settings</li>
            <li>Create a new key and paste it above</li>
          </ol>
          <p className="text-xs text-surface-500 mt-3">
            You can also set it via environment variable: <code className="text-primary-400">export ANTHROPIC_API_KEY=sk-ant-...</code> before starting the server.
          </p>
        </Card>
      )}
    </div>
  );
}
