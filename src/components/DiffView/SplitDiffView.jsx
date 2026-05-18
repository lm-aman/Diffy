import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore.js';
import { flattenForSplit } from '../../lib/diffRender.js';
import DiffPane from './DiffPane.jsx';

export default function SplitDiffView() {
  const diffResult = useAppStore((s) => s.diffResult);
  const showUnchanged = useAppStore((s) => s.showUnchanged);
  const activeFilter = useAppStore((s) => s.activeFilter);
  const expandedPaths = useAppStore((s) => s.expandedPaths);
  const toggleExpandedPath = useAppStore((s) => s.toggleExpandedPath);

  const processLines = (side) => {
    if (!diffResult) return [];
    return flattenForSplit(diffResult, side, showUnchanged, activeFilter).filter(
      (line) => !line.isCollapse || !expandedPaths.has(line.path),
    );
  };

  const leftLines = useMemo(
    () => processLines('left'),
    [diffResult, showUnchanged, activeFilter, expandedPaths],
  );

  const rightLines = useMemo(
    () => processLines('right'),
    [diffResult, showUnchanged, activeFilter, expandedPaths],
  );

  const collapseLines = useMemo(() => {
    if (!diffResult) return [];
    return flattenForSplit(diffResult, 'left', showUnchanged, activeFilter).filter(
      (l) => l.isCollapse,
    );
  }, [diffResult, showUnchanged, activeFilter]);

  if (!diffResult) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-600">
        Load JSON in both panes to compare
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-0 border-t border-zinc-200 min-h-[240px]">
      <div className="border-r border-zinc-200">
        <div className="px-3 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 border-b border-zinc-200">
          Left
        </div>
        {collapseLines.map((line) => (
          <button
            key={line.path}
            type="button"
            onClick={() => toggleExpandedPath(line.path)}
            className="w-full text-left px-4 py-1 text-xs text-zinc-700 hover:bg-zinc-100 border-b border-zinc-100"
          >
            {expandedPaths.has(line.path) ? '▼' : '▶'} {line.text}
          </button>
        ))}
        <DiffPane lines={leftLines} side="left" />
      </div>
      <div>
        <div className="px-3 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 border-b border-zinc-200">
          Right
        </div>
        <DiffPane lines={rightLines} side="right" />
      </div>
    </div>
  );
}
