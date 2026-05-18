import { STATUS_BG } from '../../lib/diffRender.js';

export default function DiffPane({ lines, side }) {
  return (
    <div className="flex-1 overflow-auto font-mono text-sm p-3 bg-zinc-50 min-h-[200px] text-zinc-900">
      {lines.length === 0 ? (
        <p className="text-zinc-600 text-sm">No diff lines to show</p>
      ) : (
        lines.map((line, i) => (
          <div
            key={`${line.path}-${i}`}
            data-path={line.path}
            className={`whitespace-pre ${STATUS_BG[line.status] || ''} ${
              line.status === 'added' && side === 'left'
                ? 'opacity-30 line-through'
                : ''
            } ${
              line.status === 'removed' && side === 'right'
                ? 'opacity-30 line-through'
                : ''
            }`}
            style={{ paddingLeft: `${line.indent * 16 + 8}px` }}
          >
            {line.text || '\u00a0'}
          </div>
        ))
      )}
    </div>
  );
}
