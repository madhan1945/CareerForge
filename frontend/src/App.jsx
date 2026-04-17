import { useState } from "react";
import Navbar from "./components/Navbar";
import UploadSection from "./components/UploadSection";
import ResultsDashboard from "./components/ResultsDashboard";
import HistoryPanel from "./components/HistoryPanel";

export default function App() {
  const [result, setResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="min-h-screen bg-dark-200">
      <Navbar onHistoryClick={() => setShowHistory(true)} />
      <div className="pt-24 pb-16 px-6">
        {result ? (
          <ResultsDashboard data={result} onReset={() => setResult(null)} />
        ) : (
          <div className="min-h-[80vh] flex items-center justify-center">
            <UploadSection onResult={setResult} />
          </div>
        )}
      </div>
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </div>
  );
}
