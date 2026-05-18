const STYLES = {
  added: 'bg-green-100 text-green-900 border-green-400',
  removed: 'bg-red-100 text-red-900 border-red-400',
  changed: 'bg-amber-100 text-amber-950 border-amber-400',
  unchanged: 'bg-zinc-200 text-zinc-800 border-zinc-400',
};

const LABELS = {
  added: '[+]',
  removed: '[-]',
  changed: '[~]',
  unchanged: '[=]',
};

export default function Badge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-xs font-mono border rounded ${STYLES[status] || STYLES.unchanged} ${className}`}
    >
      {LABELS[status] || status}
    </span>
  );
}
