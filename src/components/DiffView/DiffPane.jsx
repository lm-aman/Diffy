import { forwardRef } from 'react';
import { STATUS_BG } from '../../lib/diffRender.js';

const DiffPane = forwardRef(function DiffPane(
  { lines, side, onScroll, onTogglePath, expandedPaths },
  ref,
) {
  let lineCounter = 0;

  return (
    <div
      ref={ref}
      className="flex-1 overflow-auto font-mono text-xs bg-zinc-50 min-h-[200px] text-zinc-900"
      onScroll={onScroll}
    >
      {lines.length === 0 ? (
        <p className="text-zinc-600 text-sm p-3">No diff lines to show</p>
      ) : (
        lines.map((line, i) => {
          if (line.isCollapse) {
            return (
              <button
                key={`${line.path}-${i}`}
                type="button"
                onClick={() => onTogglePath?.(line.path)}
                className="w-full flex items-center gap-0 text-left hover:bg-zinc-200 border-y border-zinc-300 bg-zinc-100"
              >
                <span className="w-10 shrink-0 border-r border-zinc-300 py-1 text-center text-zinc-400 text-[10px]">
                  {expandedPaths?.has(line.path) ? '▼' : '▶'}
                </span>
                <span className="px-3 py-1 text-zinc-500 text-[11px] italic">
                  {line.text}
                </span>
              </button>
            );
          }

          lineCounter += 1;
          const num = lineCounter;

          return (
            <div
              key={`${line.path}-${i}`}
              data-path={line.path}
              data-status={line.status}
              className={`flex items-stretch min-h-[1.5rem] ${STATUS_BG[line.status] || ''} ${
                line.status === 'added' && side === 'left' ? 'opacity-30' : ''
              } ${line.status === 'removed' && side === 'right' ? 'opacity-30' : ''}`}
            >
              <span className="w-10 shrink-0 text-right pr-2 py-px text-zinc-400 text-[10px] select-none border-r border-zinc-200 bg-zinc-100/60">
                {num}
              </span>
              <span
                className="whitespace-pre flex-1 py-px pl-2"
                style={{ paddingLeft: `${line.indent * 12 + 8}px` }}
              >
                {line.text || ' '}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
});

export default DiffPane;
