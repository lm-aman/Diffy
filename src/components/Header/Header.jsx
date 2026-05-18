import ViewModeToggle from './ViewModeToggle.jsx';
import { useAppStore } from '../../store/useAppStore.js';

export default function Header() {
  const viewMode = useAppStore((s) => s.viewMode);
  const showUnchanged = useAppStore((s) => s.showUnchanged);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const setShowUnchanged = useAppStore((s) => s.setShowUnchanged);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-300 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-zinc-900">Diffy</span>
        </h1>
        <span className="text-sm text-zinc-600">JSON Diff Viewer</span>
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnchanged}
            onChange={(e) => setShowUnchanged(e.target.checked)}
            className="rounded border-zinc-400 bg-white text-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          />
          Show unchanged
        </label>
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
      </div>
    </header>
  );
}
