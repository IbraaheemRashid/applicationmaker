import { useState } from 'react';
import {
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit3,
  ChevronRight,
  MapPin,
  DollarSign,
  Wifi,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { TextArea } from '../components/ui/TextArea';
import { useAppStore } from '../store/useAppStore';
import { getStatusColor, getStatusLabel, formatDate, scoreToGrade, getGradeColor, STATUS_FLOW } from '../utils/helpers';
import type { ApplicationStatus } from '../types';

export function Tracker() {
  const { applications, addApplication, updateApplication, updateStatus, deleteApplication } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'score' | 'status'>('date');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    url: '',
    location: '',
    salary: '',
    remote: false,
    notes: '',
    tags: '',
  });

  const filtered = applications
    .filter((a) => {
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'company':
          return a.company.localeCompare(b.company);
        case 'score':
          return (b.score ?? 0) - (a.score ?? 0);
        case 'status':
          return STATUS_FLOW.indexOf(a.status as never) - STATUS_FLOW.indexOf(b.status as never);
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

  const handleSubmit = () => {
    if (!formData.company || !formData.role) return;

    if (editingId) {
      updateApplication(editingId, {
        company: formData.company,
        role: formData.role,
        url: formData.url,
        location: formData.location,
        salary: formData.salary,
        remote: formData.remote,
        notes: formData.notes,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
    } else {
      addApplication({
        company: formData.company,
        role: formData.role,
        url: formData.url,
        status: 'saved',
        score: null,
        grade: null,
        dateApplied: null,
        notes: formData.notes,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        location: formData.location,
        salary: formData.salary,
        remote: formData.remote,
        evaluation: null,
        cvId: null,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ company: '', role: '', url: '', location: '', salary: '', remote: false, notes: '', tags: '' });
    setShowAddModal(false);
    setEditingId(null);
  };

  const startEdit = (id: string) => {
    const app = applications.find((a) => a.id === id);
    if (!app) return;
    setFormData({
      company: app.company,
      role: app.role,
      url: app.url,
      location: app.location,
      salary: app.salary,
      remote: app.remote,
      notes: app.notes,
      tags: app.tags.join(', '),
    });
    setEditingId(id);
    setShowAddModal(true);
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...(['saved', 'evaluated', 'applied', 'responded', 'interview', 'offer', 'rejected', 'withdrawn'] as const).map(
      (s) => ({ value: s, label: getStatusLabel(s) })
    ),
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Application Tracker</h1>
          <p className="text-surface-400 mt-1">{applications.length} applications tracked</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Add Application
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search company, role, or tags..."
              className="w-full pl-9 pr-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-40"
          />
          <Select
            options={[
              { value: 'date', label: 'Date Added' },
              { value: 'company', label: 'Company' },
              { value: 'score', label: 'Score' },
              { value: 'status', label: 'Status' },
            ]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-36"
          />
        </div>
      </Card>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-surface-400">No applications found</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Add your first application
            </Button>
          </Card>
        ) : (
          filtered.map((app) => (
            <Card
              key={app.id}
              className={`transition-all duration-200 ${expandedId === app.id ? 'border-primary-500/30' : ''}`}
            >
              <div
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white truncate">{app.company}</h3>
                    {app.score !== null && (
                      <span className={`text-sm font-bold ${getGradeColor(scoreToGrade(app.score))}`}>
                        {scoreToGrade(app.score)} ({app.score.toFixed(1)})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-400 truncate">{app.role}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                    {app.location && (
                      <span className="text-xs text-surface-500 flex items-center gap-1">
                        <MapPin size={11} /> {app.location}
                      </span>
                    )}
                    {app.remote && (
                      <span className="text-xs text-cyan-400 flex items-center gap-1">
                        <Wifi size={11} /> Remote
                      </span>
                    )}
                    {app.salary && (
                      <span className="text-xs text-surface-500 flex items-center gap-1">
                        <DollarSign size={11} /> {app.salary}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-surface-500 text-right shrink-0">
                  <p>{formatDate(app.dateAdded)}</p>
                  {app.dateApplied && <p className="text-emerald-400">Applied {formatDate(app.dateApplied)}</p>}
                </div>
                <ChevronRight
                  size={16}
                  className={`text-surface-500 transition-transform ${expandedId === app.id ? 'rotate-90' : ''}`}
                />
              </div>

              {expandedId === app.id && (
                <div className="px-4 pb-4 pt-0 border-t border-surface-800 mt-0">
                  <div className="pt-4 space-y-4">
                    {app.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {app.tags.map((tag) => (
                          <Badge key={tag} variant="accent">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    {app.notes && <p className="text-sm text-surface-300">{app.notes}</p>}

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-surface-500">Move to:</span>
                      {(['saved', 'evaluated', 'applied', 'interview', 'offer', 'rejected', 'withdrawn'] as ApplicationStatus[])
                        .filter((s) => s !== app.status)
                        .map((s) => (
                          <button
                            key={s}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(app.id, s);
                            }}
                            className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(s)} hover:opacity-80 transition-opacity cursor-pointer`}
                          >
                            {getStatusLabel(s)}
                          </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      {app.url && (
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={14} /> View Posting
                        </a>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => startEdit(app.id)}>
                        <Edit3 size={14} /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => deleteApplication(app.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={resetForm}
        title={editingId ? 'Edit Application' : 'Add Application'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company *"
              placeholder="e.g. Anthropic"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <Input
              label="Role *"
              placeholder="e.g. Senior Software Engineer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>
          <Input
            label="Job URL"
            placeholder="https://..."
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="e.g. San Francisco, CA"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              label="Salary Range"
              placeholder="e.g. $150k - $200k"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remote"
              checked={formData.remote}
              onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
              className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="remote" className="text-sm text-surface-300">Remote position</label>
          </div>
          <Input
            label="Tags (comma separated)"
            placeholder="e.g. AI, ML, Python, Senior"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
          <TextArea
            label="Notes"
            placeholder="Any additional notes..."
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.company || !formData.role}>
              {editingId ? 'Save Changes' : 'Add Application'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
