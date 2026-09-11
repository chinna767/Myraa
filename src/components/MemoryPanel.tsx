import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Search, Plus, Trash2, Bookmark, Calendar, ShieldCheck, Tag } from 'lucide-react';
import { Memory, MemoryCategory } from '../types';

interface MemoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  onSaveMemory: (data: { key: string; value: string; category?: MemoryCategory; importance?: number }) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
}

const CATEGORIES: MemoryCategory[] = [
  'Preference',
  'Goal',
  'Project',
  'Habit',
  'Schedule',
  'Relationship',
  'Interest',
  'Important Fact',
  'Conversation',
  'Instruction',
];

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  isOpen,
  onClose,
  memories,
  onSaveMemory,
  onDeleteMemory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('Project');
  const [newImportance, setNewImportance] = useState(8);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const filteredMemories = memories.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      m.key.toLowerCase().includes(q) ||
      m.value.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    setIsSaving(true);
    try {
      await onSaveMemory({
        key: newKey.trim(),
        value: newValue.trim(),
        category: newCategory,
        importance: newImportance,
      });
      setNewKey('');
      setNewValue('');
      setIsAddingNew(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="myraa-memory-panel-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800/80 p-5 flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Persistent Memory
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                  {memories.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Survives restarts & Gemini sessions</p>
            </div>
          </div>
          <button
            id="close-memory-panel-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              id="memory-search-input"
              type="text"
              placeholder="Search facts, preferences, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-cyan-500 text-black font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            id="add-memory-toggle-btn"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            {isAddingNew ? 'Cancel New Memory' : 'Store New Memory Explicitly'}
          </button>
        </div>

        {/* Add New Memory Form */}
        {isAddingNew && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateMemory}
            className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs"
          >
            <div>
              <label className="text-slate-400 block mb-1">Key / Topic</label>
              <input
                type="text"
                placeholder="e.g. Favorite Editor, Current Project"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Value / Fact</label>
              <textarea
                placeholder="e.g. Chinna loves VS Code with Dark Modern theme"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                rows={2}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Importance (1-10)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newImportance}
                  onChange={(e) => setNewImportance(parseInt(e.target.value, 10) || 8)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-semibold text-xs transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Saving to Database...' : 'Save to Persistent Database'}
            </button>
          </motion.form>
        )}

        {/* Memories List */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredMemories.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No memories match your query.
            </div>
          ) : (
            filteredMemories.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-cyan-300">{m.key}</span>
                  </div>
                  <button
                    onClick={() => onDeleteMemory(m.id)}
                    title="Forget / Delete Memory"
                    className="text-slate-500 hover:text-rose-400 p-1 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{m.value}</p>
                <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      <Tag className="w-2.5 h-2.5 text-cyan-400" />
                      {m.category}
                    </span>
                    <span className="text-slate-400">Score {m.importance}/10</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-2.5 h-2.5" />
                    {new Date(m.updatedAt || m.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Stored safely on server
          </span>
          <span className="font-mono">User: Chinna</span>
        </div>
      </motion.div>
    </div>
  );
};
