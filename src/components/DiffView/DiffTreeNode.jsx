import { useState } from 'react';
import Badge from '../shared/Badge.jsx';
import { formatPrimitive, STATUS_BG } from '../../lib/diffRender.js';
import { useAppStore } from '../../store/useAppStore.js';

function hasVisibleDescendant(node, filter) {
  if (node.status === filter) return true;
  return node.children?.some((c) => hasVisibleDescendant(c, filter)) ?? false;
}

export default function DiffTreeNode({
  node,
  depth = 0,
  forceExpanded = null,
  showUnchanged: showUnchangedProp,
}) {
  const showUnchangedStore = useAppStore((s) => s.showUnchanged);
  const showUnchanged = showUnchangedProp ?? showUnchangedStore;
  const activeFilter = useAppStore((s) => s.activeFilter);

  const hasChildren =
    node.children &&
    node.children.length > 0 &&
    (node.type === 'object' || node.type === 'array');

  const autoCollapse = !showUnchanged && node.status === 'unchanged';
  const [expanded, setExpanded] = useState(
    forceExpanded !== null ? forceExpanded : !autoCollapse,
  );

  if (activeFilter !== 'all' && node.status !== activeFilter) {
    if (!hasChildren) return null;
    if (!node.children?.some((c) => hasVisibleDescendant(c, activeFilter))) {
      return null;
    }
  }

  if (!showUnchanged && node.status === 'unchanged' && !hasChildren) {
    return null;
  }

  const indent = depth * 16;
  const bg = STATUS_BG[node.status] || '';

  let valueLabel = '';
  if (node.type === 'primitive') {
    if (node.status === 'changed') {
      valueLabel = `${formatPrimitive(node.leftValue)} → ${formatPrimitive(node.rightValue)}`;
    } else {
      valueLabel = formatPrimitive(node.leftValue ?? node.rightValue);
    }
  } else if (node.type === 'object') {
    valueLabel = '{...}';
  } else if (node.type === 'array') {
    valueLabel = '[...]';
  }

  return (
    <div
      className={`${bg} rounded-sm`}
      data-path={node.path}
      data-status={node.status}
      id={`node-${node.path}`}
    >
      <div
        className="flex items-center gap-2 py-0.5 hover:bg-zinc-200/80 font-mono text-sm cursor-pointer"
        style={{ paddingLeft: indent }}
        onClick={() => hasChildren && setExpanded((e) => !e)}
        onKeyDown={(e) => e.key === 'Enter' && hasChildren && setExpanded((x) => !x)}
        role={hasChildren ? 'button' : undefined}
        tabIndex={hasChildren ? 0 : undefined}
      >
        {hasChildren ? (
          <span className="text-zinc-500 w-4 text-center select-none">
            {expanded ? '▼' : '▶'}
          </span>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-zinc-900 font-semibold">{node.key}</span>
        <span className="text-zinc-500">:</span>
        <span
          className={`truncate ${
            node.status === 'unchanged' ? 'text-zinc-600' : 'text-zinc-900'
          }`}
        >
          {valueLabel}
        </span>
        {node.status !== 'unchanged' && <Badge status={node.status} />}
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <DiffTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              forceExpanded={forceExpanded}
              showUnchanged={showUnchanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}
