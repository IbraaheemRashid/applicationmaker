import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit3, ChevronDown, ChevronUp, BookOpen, Save } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Modal } from '../components/ui/Modal';
import { useAppStore } from '../store/useAppStore';

export function InterviewPrep() {
  const { stories, addStory, updateStory, deleteStory } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>('');

  const [form, setForm] = useState({
    title: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    reflection: '',
    tags: '',
    usedFor: '',
  });

  const allTags = [...new Set(stories.flatMap((s) => s.tags))];

  const filtered = stories.filter((s) => {
    if (!filterTag) return true;
    return s.tags.includes(filterTag);
  });

  const handleSubmit = () => {
    if (!form.title) return;
    const data = {
      title: form.title,
      situation: form.situation,
      task: form.task,
      action: form.action,
      result: form.result,
      reflection: form.reflection,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      usedFor: form.usedFor.split(',').map((t) => t.trim()).filter(Boolean),
    };

    if (editingId) {
      updateStory(editingId, data);
    } else {
      addStory(data);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ title: '', situation: '', task: '', action: '', result: '', reflection: '', tags: '', usedFor: '' });
    setShowAddModal(false);
    setEditingId(null);
  };

  const startEdit = (id: string) => {
    const story = stories.find((s) => s.id === id);
    if (!story) return;
    setForm({
      title: story.title,
      situation: story.situation,
      task: story.task,
      action: story.action,
      result: story.result,
      reflection: story.reflection,
      tags: story.tags.join(', '),
      usedFor: story.usedFor.join(', '),
    });
    setEditingId(id);
    setShowAddModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Interview Prep</h1>
          <p className="text-surface-400 mt-1">STAR+R story bank for interview questions</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Add Story
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-surface-400">Filter by tag:</p>
          <button
            onClick={() => setFilterTag('')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              !filterTag ? 'bg-primary-600 text-white' : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
            }`}
          >
            All ({stories.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filterTag === tag
                  ? 'bg-accent-600 text-white'
                  : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen size={32} className="text-surface-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Build your story bank</h3>
          <p className="text-surface-400 mb-4 max-w-md mx-auto">
            Add STAR+R stories to prepare for behavioral interviews. Tag them for easy retrieval.
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Your First Story
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((story) => (
            <Card key={story.id}>
              <div
                className="p-4 flex items-start gap-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === story.id ? null : story.id)}
              >
                <MessageSquare size={18} className="text-accent-400 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white">{story.title}</h3>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {story.tags.map((tag) => (
                      <Badge key={tag} variant="accent">{tag}</Badge>
                    ))}
                  </div>
                </div>
                {expandedId === story.id ? (
                  <ChevronUp size={16} className="text-surface-400" />
                ) : (
                  <ChevronDown size={16} className="text-surface-400" />
                )}
              </div>

              {expandedId === story.id && (
                <div className="px-4 pb-4 pt-0 border-t border-surface-800 mt-0">
                  <div className="pt-4 space-y-4">
                    {[
                      { label: 'Situation', value: story.situation, color: 'text-blue-400' },
                      { label: 'Task', value: story.task, color: 'text-amber-400' },
                      { label: 'Action', value: story.action, color: 'text-emerald-400' },
                      { label: 'Result', value: story.result, color: 'text-purple-400' },
                      { label: 'Reflection', value: story.reflection, color: 'text-cyan-400' },
                    ].map(
                      ({ label, value, color }) =>
                        value && (
                          <div key={label}>
                            <h4 className={`text-xs font-semibold uppercase tracking-wider ${color} mb-1`}>{label}</h4>
                            <p className="text-sm text-surface-300">{value}</p>
                          </div>
                        )
                    )}

                    {story.usedFor.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1">
                          Used for
                        </h4>
                        <div className="flex gap-2 flex-wrap">
                          {story.usedFor.map((u) => (
                            <Badge key={u}>{u}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(story.id)}>
                        <Edit3 size={14} /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400"
                        onClick={() => deleteStory(story.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={resetForm}
        title={editingId ? 'Edit Story' : 'Add STAR+R Story'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Story Title *"
            placeholder="e.g. Scaled ML pipeline to handle 10x traffic"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextArea
            label="Situation"
            placeholder="What was the context? What was happening?"
            rows={3}
            value={form.situation}
            onChange={(e) => setForm({ ...form, situation: e.target.value })}
          />
          <TextArea
            label="Task"
            placeholder="What was your specific responsibility?"
            rows={2}
            value={form.task}
            onChange={(e) => setForm({ ...form, task: e.target.value })}
          />
          <TextArea
            label="Action"
            placeholder="What did you do? Be specific about YOUR contributions."
            rows={3}
            value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value })}
          />
          <TextArea
            label="Result"
            placeholder="What was the outcome? Use metrics if possible."
            rows={2}
            value={form.result}
            onChange={(e) => setForm({ ...form, result: e.target.value })}
          />
          <TextArea
            label="Reflection"
            placeholder="What did you learn? What would you do differently?"
            rows={2}
            value={form.reflection}
            onChange={(e) => setForm({ ...form, reflection: e.target.value })}
          />
          <Input
            label="Tags (comma separated)"
            placeholder="e.g. leadership, scaling, ML, system design"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
          <Input
            label="Used For (comma separated)"
            placeholder="e.g. Anthropic SWE, Google ML Eng"
            value={form.usedFor}
            onChange={(e) => setForm({ ...form, usedFor: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.title}>
              <Save size={14} />
              {editingId ? 'Save Changes' : 'Add Story'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
