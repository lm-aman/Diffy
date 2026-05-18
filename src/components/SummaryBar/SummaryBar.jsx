import { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore.js';

const STAT_CONFIG = [
  { key: 'added', label: 'added', color: 'text-green-800', dot: 'bg-green-600' },
  { key: 'removed', label: 'removed', color: 'text-red-800', dot: 'bg-red-600' },
  { key: 'changed', label: 'changed', color: 'text-amber-900', dot: 'bg-amber-600' },
  { key: 'unchanged', label: 'unchanged', color: 'text-zinc-700', dot: 'bg-zinc-500' },
];

export default function SummaryBar() {
  const diffStats = useAppStore((s) => s.diffStats);
  const activeFilter = useAppStore((s) => s.activeFilter);
  const setActiveFilter = useAppStore((s) => s.setActiveFilter);

  useEffect(() => {
    if (activeFilter === 'all') return;
    const el = document.querySelector(`[data-path][data-status="${activeFilter}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeFilter]);

  if (!diffStats) {
    return (
      <div className="px-6 py-3 border-b border-zinc-300 bg-white text-sm text-zinc-600">
        Load JSON in both panes to compare
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 px-6 py-3 border-b border-zinc-300 bg-white">
      {STAT_CONFIG.map(({ key, label, color, dot }) => (
        <button
          key={key}
          type="button"
          onClick={() =>
            setActiveFilter(activeFilter === key ? 'all' : key)
          }
          className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-100 ${
            activeFilter === key || activeFilter === 'all'
              ? 'opacity-100'
              : 'opacity-40'
          } ${color}`}
        >
          <span className={`w-2 h-2 rounded-full ${dot}`} />
          <span className="font-medium">{diffStats[key]}</span>
          <span>{label}</span>
        </button>
      ))}
      {activeFilter !== 'all' && (
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className="ml-auto text-xs text-zinc-600 hover:text-zinc-900 underline underline-offset-2"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}
