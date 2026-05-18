import { useAppStore } from '../../store/useAppStore.js';
import PasteInput from './PasteInput.jsx';
import UploadInput from './UploadInput.jsx';
import ApiInput from './ApiInput/ApiInput.jsx';

const TABS = [
  { id: 'paste', label: 'Paste' },
  { id: 'upload', label: 'Upload' },
  { id: 'api', label: 'API' },
];

export default function InputPanel({ side, label }) {
  const pane = useAppStore((s) => s[side]);
  const setPaneTab = useAppStore((s) => s.setPaneTab);

  return (
    <div className="flex flex-col border border-zinc-300 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-2 border-b border-zinc-200 bg-zinc-50">
        <span className="text-sm font-medium text-zinc-900">{label}</span>
      </div>
      <div className="flex border-b border-zinc-200 bg-zinc-50">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPaneTab(side, tab.id)}
            className={`flex-1 px-3 py-2 text-sm transition-colors ${
              pane.activeTab === tab.id
                ? 'bg-white text-zinc-900 border-b-2 border-zinc-900 font-medium'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 flex-1 min-h-[200px]">
        {pane.activeTab === 'paste' && <PasteInput side={side} />}
        {pane.activeTab === 'upload' && <UploadInput side={side} />}
        {pane.activeTab === 'api' && <ApiInput side={side} />}
      </div>
    </div>
  );
}
