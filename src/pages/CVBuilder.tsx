import { useState } from 'react';
import {
  Plus,
  FileText,
  Trash2,
  Edit3,
  Copy,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Loader2,
} from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Modal } from '../components/ui/Modal';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../utils/helpers';
import { api } from '../utils/api';
import type { CV, CVSection, CVItem } from '../types';

const SECTION_TYPES: CVSection['type'][] = [
  'header',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'custom',
];

const defaultSection = (type: CVSection['type'], order: number): CVSection => ({
  id: uuid(),
  type,
  title: type.charAt(0).toUpperCase() + type.slice(1),
  content: '',
  items: [],
  order,
});

const defaultItem = (): CVItem => ({
  id: uuid(),
  title: '',
  subtitle: '',
  date: '',
  description: '',
  bullets: [''],
});

export function CVBuilder() {
  const { cvs, addCV, updateCV, deleteCV } = useAppStore();
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCVName, setNewCVName] = useState('');
  const [newCVTarget, setNewCVTarget] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const selectedCV = cvs.find((c) => c.id === selectedCVId) || null;

  const cvDataForApi = selectedCV
    ? {
        name: selectedCV.sections.find((s) => s.type === 'header')?.content || selectedCV.name,
        email: '',
        location: '',
        summary: selectedCV.sections.find((s) => s.type === 'summary')?.content || '',
        competencies: [],
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
    : null;

  const handlePreview = async () => {
    if (!cvDataForApi) {
      console.warn('[Preview] No cvDataForApi — selectedCV:', selectedCV?.id);
      return;
    }
    console.log('[Preview] Starting preview with cvData:', JSON.stringify(cvDataForApi).slice(0, 200));
    setLoadingPreview(true);
    setPreviewMode(true);
    try {
      const html = await api.previewHtml(cvDataForApi);
      console.log('[Preview] Got HTML response, length:', html.length);
      setPreviewHtml(html);
    } catch (err) {
      console.error('[Preview] Failed:', err);
      setPreviewHtml(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!cvDataForApi) {
      console.warn('[PDF] No cvDataForApi — selectedCV:', selectedCV?.id);
      return;
    }
    console.log('[PDF] Starting generation with cvData:', JSON.stringify(cvDataForApi).slice(0, 200));
    setGeneratingPdf(true);
    setPdfUrl(null);
    try {
      const result = await api.generatePdf(cvDataForApi);
      console.log('[PDF] Generation result:', result);
      setPdfUrl(`http://localhost:3001${result.url}`);
    } catch (err) {
      console.error('[PDF] Generation failed:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleCreate = () => {
    if (!newCVName) return;
    const id = addCV({
      name: newCVName,
      targetRole: newCVTarget,
      keywords: [],
      sections: [
        defaultSection('header', 0),
        defaultSection('summary', 1),
        defaultSection('experience', 2),
        defaultSection('education', 3),
        defaultSection('skills', 4),
        defaultSection('projects', 5),
      ],
    });
    setSelectedCVId(id);
    setShowCreateModal(false);
    setNewCVName('');
    setNewCVTarget('');
  };

  const handleDuplicate = (cv: CV) => {
    const id = addCV({
      name: `${cv.name} (copy)`,
      targetRole: cv.targetRole,
      keywords: [...cv.keywords],
      sections: cv.sections.map((s) => ({ ...s, id: uuid(), items: s.items.map((i) => ({ ...i, id: uuid() })) })),
    });
    setSelectedCVId(id);
  };

  const updateSection = (sectionId: string, updates: Partial<CVSection>) => {
    if (!selectedCV) return;
    updateCV(selectedCV.id, {
      sections: selectedCV.sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)),
    });
  };

  const addSection = (type: CVSection['type']) => {
    if (!selectedCV) return;
    updateCV(selectedCV.id, {
      sections: [...selectedCV.sections, defaultSection(type, selectedCV.sections.length)],
    });
  };

  const removeSection = (sectionId: string) => {
    if (!selectedCV) return;
    updateCV(selectedCV.id, {
      sections: selectedCV.sections.filter((s) => s.id !== sectionId),
    });
  };

  const addItem = (sectionId: string) => {
    if (!selectedCV) return;
    updateCV(selectedCV.id, {
      sections: selectedCV.sections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, defaultItem()] } : s
      ),
    });
  };

  const updateItem = (sectionId: string, itemId: string, updates: Partial<CVItem>) => {
    if (!selectedCV) return;
    updateCV(selectedCV.id, {
      sections: selectedCV.sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)) }
          : s
      ),
    });
  };

  const removeItem = (sectionId: string, itemId: string) => {
    if (!selectedCV) return;
    updateCV(selectedCV.id, {
      sections: selectedCV.sections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s
      ),
    });
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!selectedCV) return;
    const sections = [...selectedCV.sections];
    const idx = sections.findIndex((s) => s.id === sectionId);
    if (direction === 'up' && idx > 0) {
      [sections[idx], sections[idx - 1]] = [sections[idx - 1], sections[idx]];
    } else if (direction === 'down' && idx < sections.length - 1) {
      [sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]];
    }
    updateCV(selectedCV.id, { sections: sections.map((s, i) => ({ ...s, order: i })) });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">CV Builder</h1>
          <p className="text-surface-400 mt-1">Create and tailor your CVs for each application</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          New CV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* CV List Sidebar */}
        <div className="space-y-2">
          {cvs.length === 0 ? (
            <Card className="p-6 text-center">
              <FileText size={24} className="text-surface-500 mx-auto mb-2" />
              <p className="text-sm text-surface-400">No CVs yet</p>
              <Button size="sm" className="mt-3" onClick={() => setShowCreateModal(true)}>
                Create First CV
              </Button>
            </Card>
          ) : (
            cvs.map((cv) => (
              <Card
                key={cv.id}
                hover
                onClick={() => {
                  setSelectedCVId(cv.id);
                  setPreviewMode(false);
                }}
                className={`p-4 ${selectedCVId === cv.id ? 'border-primary-500/50 bg-primary-500/5' : ''}`}
              >
                <h3 className="font-medium text-white text-sm">{cv.name}</h3>
                <p className="text-xs text-surface-400 mt-0.5">{cv.targetRole || 'General'}</p>
                <p className="text-xs text-surface-500 mt-1">{formatDate(cv.updatedAt)}</p>
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDuplicate(cv); }}
                    className="p-1 rounded hover:bg-surface-700 text-surface-400 hover:text-surface-200 cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteCV(cv.id); if (selectedCVId === cv.id) setSelectedCVId(null); }}
                    className="p-1 rounded hover:bg-surface-700 text-surface-400 hover:text-red-400 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {!selectedCV ? (
            <Card className="p-12 text-center">
              <FileText size={32} className="text-surface-500 mx-auto mb-3" />
              <p className="text-surface-400">Select or create a CV to start editing</p>
            </Card>
          ) : previewMode ? (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Preview: {selectedCV.name}</h2>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleGeneratePdf}
                    disabled={generatingPdf}
                  >
                    {generatingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    {generatingPdf ? 'Generating...' : 'Export PDF'}
                  </Button>
                  {pdfUrl && (
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="text-emerald-400">
                        <FileText size={14} /> Download
                      </Button>
                    </a>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setPreviewMode(false)}>
                    <Edit3 size={14} /> Edit
                  </Button>
                </div>
              </div>
              <div className="bg-gray-200 rounded-lg p-4 flex justify-center" style={{ minHeight: '80vh' }}>
                {loadingPreview ? (
                  <div className="flex items-center gap-2 text-surface-500">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Rendering preview...</span>
                  </div>
                ) : previewHtml ? (
                  <iframe
                    srcDoc={previewHtml}
                    title="CV Preview"
                    className="bg-white rounded shadow-lg"
                    style={{
                      width: '8.5in',
                      minHeight: '11in',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                ) : (
                  <p className="text-surface-500">Preview could not be loaded.</p>
                )}
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Input
                    value={selectedCV.name}
                    onChange={(e) => updateCV(selectedCV.id, { name: e.target.value })}
                    className="text-lg font-bold bg-transparent border-none focus:ring-0 p-0"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handlePreview}>
                    <Eye size={14} /> Preview
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleGeneratePdf}
                    disabled={generatingPdf}
                  >
                    {generatingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    {generatingPdf ? 'Generating...' : 'Export PDF'}
                  </Button>
                  {pdfUrl && (
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="text-emerald-400">
                        <FileText size={14} /> View PDF
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              <Input
                label="Target Role"
                placeholder="e.g. Senior AI Engineer"
                value={selectedCV.targetRole}
                onChange={(e) => updateCV(selectedCV.id, { targetRole: e.target.value })}
              />

              {selectedCV.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <Card key={section.id} className="overflow-hidden">
                    <div
                      className="p-4 flex items-center gap-3 cursor-pointer hover:bg-surface-800/50"
                      onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    >
                      <GripVertical size={16} className="text-surface-500" />
                      <span className="text-xs uppercase tracking-wider text-surface-500 font-medium">
                        {section.type}
                      </span>
                      <input
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="flex-1 bg-transparent border-none text-white font-medium focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }} className="p-1 hover:bg-surface-700 rounded text-surface-400 cursor-pointer">
                          <ChevronUp size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }} className="p-1 hover:bg-surface-700 rounded text-surface-400 cursor-pointer">
                          <ChevronDown size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="p-1 hover:bg-surface-700 rounded text-surface-400 hover:text-red-400 cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {expandedSection === section.id && (
                      <div className="p-4 pt-0 space-y-4 border-t border-surface-800">
                        <TextArea
                          label="Content"
                          placeholder="Section description or content..."
                          rows={3}
                          value={section.content}
                          onChange={(e) => updateSection(section.id, { content: e.target.value })}
                        />

                        {['experience', 'education', 'projects', 'certifications', 'custom'].includes(section.type) && (
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-surface-300">Items</h4>
                            {section.items.map((item) => (
                              <div key={item.id} className="p-3 bg-surface-800 rounded-lg space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <Input
                                    placeholder="Title"
                                    value={item.title}
                                    onChange={(e) => updateItem(section.id, item.id, { title: e.target.value })}
                                  />
                                  <Input
                                    placeholder="Company / Institution"
                                    value={item.subtitle}
                                    onChange={(e) => updateItem(section.id, item.id, { subtitle: e.target.value })}
                                  />
                                </div>
                                <Input
                                  placeholder="Date range (e.g. Jan 2023 - Present)"
                                  value={item.date}
                                  onChange={(e) => updateItem(section.id, item.id, { date: e.target.value })}
                                />
                                <TextArea
                                  placeholder="Description"
                                  rows={2}
                                  value={item.description}
                                  onChange={(e) => updateItem(section.id, item.id, { description: e.target.value })}
                                />
                                <div className="space-y-2">
                                  <label className="text-xs text-surface-400">Bullet points</label>
                                  {item.bullets.map((bullet, bi) => (
                                    <div key={bi} className="flex gap-2">
                                      <span className="text-surface-500 mt-2">•</span>
                                      <input
                                        className="flex-1 px-2 py-1 bg-surface-700 border border-surface-600 rounded text-sm text-surface-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        value={bullet}
                                        onChange={(e) => {
                                          const newBullets = [...item.bullets];
                                          newBullets[bi] = e.target.value;
                                          updateItem(section.id, item.id, { bullets: newBullets });
                                        }}
                                        placeholder="Achievement or responsibility..."
                                      />
                                      <button
                                        onClick={() => {
                                          const newBullets = item.bullets.filter((_, i) => i !== bi);
                                          updateItem(section.id, item.id, { bullets: newBullets.length ? newBullets : [''] });
                                        }}
                                        className="text-surface-500 hover:text-red-400 cursor-pointer"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => updateItem(section.id, item.id, { bullets: [...item.bullets, ''] })}
                                  >
                                    <Plus size={12} /> Add bullet
                                  </Button>
                                </div>
                                <div className="flex justify-end">
                                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => removeItem(section.id, item.id)}>
                                    <Trash2 size={12} /> Remove
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button size="sm" variant="secondary" onClick={() => addItem(section.id)}>
                              <Plus size={14} /> Add Item
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}

              <div className="flex flex-wrap gap-2">
                {SECTION_TYPES.map((type) => (
                  <Button key={type} size="sm" variant="ghost" onClick={() => addSection(type)}>
                    <Plus size={12} />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New CV">
        <div className="space-y-4">
          <Input
            label="CV Name"
            placeholder="e.g. AI Engineer CV - Anthropic"
            value={newCVName}
            onChange={(e) => setNewCVName(e.target.value)}
          />
          <Input
            label="Target Role (optional)"
            placeholder="e.g. Senior AI Engineer"
            value={newCVTarget}
            onChange={(e) => setNewCVTarget(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newCVName}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
