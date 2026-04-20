import { useState } from 'react';
import {
  Plus,
  Search,
  ExternalLink,
  Trash2,
  ChevronRight,
  MapPin,
  DollarSign,
  Wifi,
  TrendingUp,
  Target,
  Briefcase,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { TextArea } from '../components/ui/TextArea';
import { useAppStore } from '../store/useAppStore';
import { getStatusColor, getStatusLabel, formatDate, scoreToGrade, getGradeColor } from '../utils/helpers';
import type { ApplicationStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const STATUSES: ApplicationStatus[] = ['saved', 'evaluated', 'applied', 'responded', 'interview', 'offer', 'rejected'];

export function Pipeline() {
  const { applications, addApplication, updateStatus, deleteApplication } = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ company: '', role: '', url: '', notes: '' });

  const active = applications.filter((a) =>
    ['applied', 'responded', 'interview'].includes(a.status)
  ).length;
  const interviewRate = applications.length
    ? (applications.filter((a) => ['interview', 'offer'].includes(a.status)).length /
        applications.length) *
      100
    : 0;
  const avgScore =
    applications.filter((a) => a.score !== null).reduce((s, a) => s + (a.score ?? 0), 0) /
      (applications.filter((a) => a.score !== null).length || 1) || 0;

  const stats = [
    { label: 'Total', value: applications.length, icon: Briefcase },
    { label: 'Active', value: active, icon: TrendingUp },
    { label: 'Interview rate', value: `${interviewRate.toFixed(0)}%`, icon: Target },
    { label: 'Avg score', value: avgScore ? avgScore.toFixed(1) : '—', icon: TrendingUp },
  ];

  const filtered = applications
    .filter((a) => (filterStatus === 'all' ? true : a.status === filterStatus))
    .filter((a) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

  const handleAdd = () => {
    if (!form.company || !form.role) return;
    addApplication({
      company: form.company,
      role: form.role,
      url: form.url,
      status: 'saved',
      score: null,
      grade: null,
      dateApplied: null,
      notes: form.notes,
      tags: [],
      location: '',
      salary: '',
      remote: false,
      evaluation: null,
      cvId: null,
    });
    setForm({ company: '', role: '', url: '', notes: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-8" data-tour="pipeline-page">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">Pipeline</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Every job you evaluate lands here. Move status as things progress.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setShowAdd(true)}>
          <Plus size={13} /> Add manually
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-neutral-500">{s.label}</p>
                <p className="text-2xl font-semibold text-neutral-100 mt-1 tracking-tight font-mono">
                  {s.value}
                </p>
              </div>
              <s.icon size={14} className="text-neutral-700" />
            </div>
          </div>
        ))}
      </div>

      <div className="card p-3 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
          <input
            type="text"
            placeholder="Search company, role, tags…"
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-700 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          <StatusPill active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
            All
          </StatusPill>
          {STATUSES.map((s) => (
            <StatusPill
              key={s}
              active={filterStatus === s}
              onClick={() => setFilterStatus(s)}
            >
              {getStatusLabel(s)}
            </StatusPill>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-3">
              <Briefcase size={16} className="text-neutral-600" />
            </div>
            <p className="text-sm text-neutral-400">
              {applications.length === 0 ? 'No applications yet' : 'Nothing matches those filters'}
            </p>
            {applications.length === 0 && (
              <Button className="mt-4" onClick={() => navigate('/')}>
                <Plus size={13} /> Evaluate your first job
              </Button>
            )}
          </div>
        ) : (
          filtered.map((app) => (
            <div
              key={app.id}
              className={`card card-hover ${expandedId === app.id ? 'border-neutral-700' : ''}`}
            >
              <button
                className="w-full text-left px-4 py-3 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-medium text-neutral-100 truncate">{app.company}</h3>
                    {app.score !== null && (
                      <span className={`text-xs font-mono font-semibold ${getGradeColor(scoreToGrade(app.score))}`}>
                        {scoreToGrade(app.score)} {app.score.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{app.role}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`chip ${getStatusColor(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                    {app.location && (
                      <span className="text-[11px] text-neutral-500 flex items-center gap-0.5">
                        <MapPin size={10} /> {app.location}
                      </span>
                    )}
                    {app.remote && (
                      <span className="text-[11px] text-cyan-400 flex items-center gap-0.5">
                        <Wifi size={10} /> Remote
                      </span>
                    )}
                    {app.salary && (
                      <span className="text-[11px] text-neutral-500 flex items-center gap-0.5">
                        <DollarSign size={10} /> {app.salary}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-neutral-600 font-mono text-right shrink-0">
                  {formatDate(app.dateAdded)}
                </div>
                <ChevronRight
                  size={14}
                  className={`text-neutral-600 transition-transform ${expandedId === app.id ? 'rotate-90' : ''}`}
                />
              </button>

              {expandedId === app.id && (
                <div className="px-4 pb-4 pt-1 border-t border-neutral-800 space-y-3">
                  {app.evaluation && (
                    <p className="text-sm text-neutral-300 mt-3">{app.evaluation.roleSummary}</p>
                  )}
                  {app.notes && (
                    <p className="text-xs text-neutral-500 whitespace-pre-wrap">{app.notes}</p>
                  )}

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-neutral-600 uppercase tracking-wider mr-1">Move →</span>
                    {STATUSES.filter((s) => s !== app.status).map((s) => (
                      <button
                        key={s}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(app.id, s);
                        }}
                        className={`chip ${getStatusColor(s)} hover:opacity-80 cursor-pointer`}
                      >
                        {getStatusLabel(s)}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {app.url && (
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-accent-500 hover:text-accent-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={11} /> View posting
                      </a>
                    )}
                    <div className="flex-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-neutral-500 hover:text-red-400"
                      onClick={() => deleteApplication(app.id)}
                    >
                      <Trash2 size={12} /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add application" size="md">
        <div className="space-y-3">
          <Input
            label="Company"
            placeholder="Anthropic"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <Input
            label="Role"
            placeholder="Senior Software Engineer"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
          <Input
            label="URL"
            placeholder="https://…"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <TextArea
            label="Notes"
            placeholder="Optional"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.company || !form.role}>
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatusPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap cursor-pointer ${
        active
          ? 'bg-neutral-800 text-neutral-100'
          : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
      }`}
    >
      {children}
    </button>
  );
}
