import Header from './components/Header/Header.jsx';
import SummaryBar from './components/SummaryBar/SummaryBar.jsx';
import InputPanel from './components/InputPanel/InputPanel.jsx';
import DiffView from './components/DiffView/DiffView.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <SummaryBar />
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InputPanel side="left" label="Left" />
          <InputPanel side="right" label="Right" />
        </div>
        <DiffView />
      </main>
    </div>
  );
}
