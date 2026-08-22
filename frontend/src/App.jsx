import { useState } from "react";
import Navbar from "./components/Navbar";
import UploadSection from "./components/UploadSection";
import ResultsDashboard from "./components/ResultsDashboard";
import HistoryPanel from "./components/HistoryPanel";
import RecruiterPortal from "./components/RecruiterPortal";

export default function App() {
  const [result, setResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState("candidate");

  return (
    <div className="min-h-screen bg-[#0a0d14] bg-grid-pattern relative">
      <Navbar
        onHistoryClick={() => setShowHistory(true)}
        currentView={viewMode}
        onViewChange={(view) => {
          setViewMode(view);
          // Auto-reset single candidate result when toggling view if desired
        }}
      />
      <div className="pt-24 pb-16 px-6">
        {viewMode === "recruiter" ? (
          <RecruiterPortal />
        ) : result ? (
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
