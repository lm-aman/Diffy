export default function CollapseToggle({ count, expanded, onToggle, label = 'unchanged keys' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full text-left px-3 py-1.5 text-sm text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
    >
      {expanded ? '▼' : '▶'} {count} {label} — click to {expanded ? 'collapse' : 'expand'}
    </button>
  );
}
