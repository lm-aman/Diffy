export default function ParamsTable({
  title,
  rows,
  onChange,
  columns = ['key', 'value', 'enabled'],
  keyReadOnly = false,
}) {
  const addRow = () => {
    onChange([...rows, { key: '', value: '', enabled: true }]);
  };

  const updateRow = (index, field, value) => {
    const next = rows.map((r, i) =>
      i === index ? { ...r, [field]: value } : r,
    );
    onChange(next);
  };

  const removeRow = (index) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
          {title}
        </h4>
        <button
          type="button"
          onClick={addRow}
          className="text-xs font-medium text-zinc-800 hover:text-zinc-950 underline underline-offset-2"
        >
          + Add
        </button>
      </div>
      <div className="border border-zinc-300 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-100 text-zinc-800 text-left border-b border-zinc-200">
              {columns.includes('enabled') && <th className="w-8 p-2" />}
              <th className="p-2">Key</th>
              <th className="p-2">Value</th>
              <th className="w-8 p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-zinc-500 text-center text-xs">
                  No rows
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-zinc-200">
                {columns.includes('enabled') && (
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={row.enabled ?? true}
                      onChange={(e) => updateRow(i, 'enabled', e.target.checked)}
                      className="rounded border-zinc-400 text-zinc-900"
                    />
                  </td>
                )}
                <td className="p-1">
                  <input
                    value={row.key}
                    readOnly={keyReadOnly}
                    onChange={(e) => updateRow(i, 'key', e.target.value)}
                    className={`w-full px-2 py-1 bg-white border border-zinc-300 rounded text-sm ${keyReadOnly ? 'text-zinc-500' : 'text-zinc-900'}`}
                  />
                </td>
                <td className="p-1">
                  <input
                    value={row.value}
                    onChange={(e) => updateRow(i, 'value', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-zinc-300 rounded text-sm text-zinc-900"
                  />
                </td>
                <td className="p-1">
                  {!keyReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="text-zinc-500 hover:text-red-700 px-1"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
