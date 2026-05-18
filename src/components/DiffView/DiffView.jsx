import { useAppStore } from '../../store/useAppStore.js';
import SplitDiffView from './SplitDiffView.jsx';
import TreeDiffView from './TreeDiffView.jsx';

export default function DiffView() {
  const viewMode = useAppStore((s) => s.viewMode);

  return (
    <section className="rounded-xl border border-zinc-300 overflow-hidden bg-white shadow-sm">
      <div className="px-4 py-2 border-b border-zinc-200 bg-zinc-50">
        <h2 className="text-sm font-medium text-zinc-900">Diff</h2>
      </div>
      {viewMode === 'split' ? <SplitDiffView /> : <TreeDiffView />}
    </section>
  );
}
