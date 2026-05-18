export default function ViewModeToggle({ viewMode, onChange }) {
  const modes = [
    { id: 'split', label: 'Split' },
    { id: 'tree', label: 'Tree' },
  ];

  return (
    <div className="flex rounded-lg bg-zinc-100 p-1 border border-zinc-300">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            viewMode === m.id
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
