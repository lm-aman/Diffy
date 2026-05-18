import { useMemo, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore.js';
import { flattenForSplit } from '../../lib/diffRender.js';
import DiffPane from './DiffPane.jsx';

export default function SplitDiffView() {
  const diffResult = useAppStore((s) => s.diffResult);
  const showUnchanged = useAppStore((s) => s.showUnchanged);
  const activeFilter = useAppStore((s) => s.activeFilter);
  const expandedPaths = useAppStore((s) => s.expandedPaths);
  const toggleExpandedPath = useAppStore((s) => s.toggleExpandedPath);

  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const syncingRef = useRef(false);

  const handleLeftScroll = (e) => {
    if (syncingRef.current) return;
    if (!rightRef.current) return;
    syncingRef.current = true;
    rightRef.current.scrollTop = e.target.scrollTop;
    syncingRef.current = false;
  };

  const handleRightScroll = (e) => {
    if (syncingRef.current) return;
    if (!leftRef.current) return;
    syncingRef.current = true;
    leftRef.current.scrollTop = e.target.scrollTop;
    syncingRef.current = false;
  };

  const leftLines = useMemo(
    () =>
      diffResult
        ? flattenForSplit(diffResult, 'left', showUnchanged, activeFilter, expandedPaths)
        : [],
    [diffResult, showUnchanged, activeFilter, expandedPaths],
  );

  const rightLines = useMemo(
    () =>
      diffResult
        ? flattenForSplit(diffResult, 'right', showUnchanged, activeFilter, expandedPaths)
        : [],
    [diffResult, showUnchanged, activeFilter, expandedPaths],
  );

  if (!diffResult) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-600">
        Load JSON in both panes to compare
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-0 border-t border-zinc-200 min-h-[240px]">
      <div className="border-r border-zinc-200 flex flex-col">
        <div className="px-3 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 border-b border-zinc-200">
          Left
        </div>
        <DiffPane
          ref={leftRef}
          lines={leftLines}
          side="left"
          onScroll={handleLeftScroll}
          onTogglePath={toggleExpandedPath}
          expandedPaths={expandedPaths}
        />
      </div>
      <div className="flex flex-col">
        <div className="px-3 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 border-b border-zinc-200">
          Right
        </div>
        <DiffPane
          ref={rightRef}
          lines={rightLines}
          side="right"
          onScroll={handleRightScroll}
          onTogglePath={toggleExpandedPath}
          expandedPaths={expandedPaths}
        />
      </div>
    </div>
  );
}
