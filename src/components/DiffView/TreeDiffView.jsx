import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore.js';
import DiffTreeNode from './DiffTreeNode.jsx';

export default function TreeDiffView() {
  const diffResult = useAppStore((s) => s.diffResult);
  const showUnchanged = useAppStore((s) => s.showUnchanged);
  const [treeKey, setTreeKey] = useState(0);
  const [forceExpanded, setForceExpanded] = useState(null);

  if (!diffResult) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-600">
        Load JSON in both panes to compare
      </div>
    );
  }

  return (
    <div className="border-t border-zinc-200">
      <div className="flex gap-2 px-4 py-2 border-b border-zinc-200 bg-zinc-50">
        <button
          type="button"
          onClick={() => {
            setForceExpanded(true);
            setTreeKey((k) => k + 1);
          }}
          className="text-xs font-medium text-zinc-800 hover:text-zinc-950 underline underline-offset-2"
        >
          Expand all
        </button>
        <button
          type="button"
          onClick={() => {
            setForceExpanded(false);
            setTreeKey((k) => k + 1);
          }}
          className="text-xs font-medium text-zinc-800 hover:text-zinc-950 underline underline-offset-2"
        >
          Collapse all
        </button>
      </div>
      <div key={treeKey} className="p-4 overflow-auto max-h-[500px] font-mono">
        {diffResult.map((node) => (
          <DiffTreeNode
            key={node.path}
            node={node}
            forceExpanded={forceExpanded}
            showUnchanged={showUnchanged}
          />
        ))}
      </div>
    </div>
  );
}
