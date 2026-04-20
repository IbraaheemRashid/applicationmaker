import { useState } from 'react';
import { Plus, ChevronDown, Trash2, Tag as TagIcon, MessageSquare, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useAppStore } from '../store/useAppStore';

export function Interview() {
  const { stories, addStory, deleteStory, applications } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    reflection: '',
    tags: '',
  });

  const allTags = Array.from(new Set(stories.flatMap((s) => s.tags))).sort();
  const filtered = filterTag ? stories.filter((s) => s.tags.includes(filterTag)) : stories;

  const upcoming = applications.filter((a) => a.status === 'interview');

  const handleAdd = () => {
    if (!form.title || !form.situation) return;
    addStory({
      title: form.title,
      situation: form.situation,
      task: form.task,
      action: form.action,
      result: form.result,
      reflection: form.reflection,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      usedFor: [],
    });
    setForm({ title: '', situation: '', task: '', action: '', result: '', reflection: '', tags: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-8" data-tour="interview-page">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">Interview</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Your STAR+R story bank. Add a story once, reuse it across loops — sharper each time.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={13} /> Add story
        </Button>
      </div>

      {upcoming.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={13} className="text-accent-500" />
            <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
              Upcoming interviews
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {upcoming.map((a) => (
              <div
                key={a.id}
                className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg"
              >
                <p className="text-sm text-neutral-100 truncate">{a.company}</p>
                <p className="text-xs text-neutral-500 truncate">{a.role}</p>
                {a.evaluation?.interviewQuestions?.length ? (
                  <p className="text-[11px] text-accent-500 mt-1">
                    {a.evaluation.interviewQuestions.length} likely questions
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-neutral-600 uppercase tracking-wider mr-1">
            <TagIcon size={10} className="inline mr-1" /> Filter:
          </span>
          <button
            onClick={() => setFilterTag(null)}
            className={`px-2 py-0.5 text-xs rounded-md cursor-pointer ${
              filterTag === null
                ? 'bg-neutral-800 text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-2 py-0.5 text-xs rounded-md cursor-pointer ${
                filterTag === tag
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-3">
            <BookOpen size={16} className="text-neutral-600" />
          </div>
          <p className="text-sm text-neutral-400">No stories yet</p>
          <p className="text-xs text-neutral-600 mt-1">
            STAR+R = Situation, Task, Action, Result, Reflection. The Reflection is what sets you apart.
          </p>
          <Button className="mt-4" onClick={() => setShowAdd(true)}>
            <Plus size={13} /> Add your first story
          </Button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((s) => (
            <div key={s.id} className="card card-hover">
              <button
                onClick={() => setOpenId(openId === s.id ? null : s.id)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neutral-100 truncate">{s.title}</h3>
                  {s.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {s.tags.map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronDown
                  size={14}
                  className={`text-neutral-600 transition-transform ${openId === s.id ? 'rotate-180' : ''}`}
                />
              </button>
              {openId === s.id && (
                <div className="px-4 pb-4 border-t border-neutral-800 space-y-3 pt-3">
                  <Section label="Situation">{s.situation}</Section>
                  <Section label="Task">{s.task}</Section>
                  <Section label="Action">{s.action}</Section>
                  <Section label="Result">{s.result}</Section>
                  <Section label="Reflection" accent>{s.reflection}</Section>
                  <div className="flex justify-end pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-neutral-500 hover:text-red-400"
                      onClick={() => deleteStory(s.id)}
                    >
                      <Trash2 size={12} /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add story" size="lg">
        <div className="space-y-3">
          <Input
            label="Title"
            placeholder="e.g. Shipped real-time inference under a 2-week constraint"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextArea
            label="Situation"
            rows={2}
            value={form.situation}
            onChange={(e) => setForm({ ...form, situation: e.target.value })}
          />
          <TextArea
            label="Task"
            rows={2}
            value={form.task}
            onChange={(e) => setForm({ ...form, task: e.target.value })}
          />
          <TextArea
            label="Action"
            rows={3}
            value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value })}
          />
          <TextArea
            label="Result"
            rows={2}
            value={form.result}
            onChange={(e) => setForm({ ...form, result: e.target.value })}
          />
          <TextArea
            label="Reflection — what would you do differently?"
            rows={2}
            value={form.reflection}
            onChange={(e) => setForm({ ...form, reflection: e.target.value })}
          />
          <Input
            label="Tags (comma separated)"
            placeholder="leadership, scaling, conflict"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.title || !form.situation}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Section({ label, children, accent }: { label: string; children: React.ReactNode; accent?: boolean }) {
  if (!children) return null;
  return (
    <div>
      <p className={`text-[11px] font-medium uppercase tracking-wider mb-1 ${accent ? 'text-accent-500' : 'text-neutral-500'}`}>
        {label}
      </p>
      <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{children}</p>
    </div>
  );
}
