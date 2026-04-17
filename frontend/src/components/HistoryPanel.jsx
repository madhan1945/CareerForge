import { useState, useEffect } from "react";
import { Clock, X, TrendingUp } from "lucide-react";

export default function HistoryPanel({ onClose }) {
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, statsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/v1/history"),
          fetch("http://127.0.0.1:8000/api/v1/stats")
        ]);
        const histData = await histRes.json();
        const statsData = await statsRes.json();
        setAnalyses(histData.analyses || []);
        setStats(statsData.stats || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGradeColor = (grade) => {
    if (grade === "A") return "text-emerald-400";
    if (grade === "B") return "text-sky-400";
    if (grade === "C") return "text-amber-400";
    return "text-red-400";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "from-emerald-500 to-sky-500";
    if (score >= 60) return "from-sky-500 to-indigo-500";
    return "from-amber-500 to-red-500";
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <div className="glass rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">

        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Clock size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Analysis History</h2>
              <p className="text-slate-500 text-xs">Your past resume analyses</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-0 border-b border-white/10">
            <div className="text-center py-5 border-r border-white/10">
              <p className="text-3xl font-bold gradient-text">{stats.total_analyses}</p>
              <p className="text-slate-500 text-xs mt-1">Total Analyses</p>
            </div>
            <div className="text-center py-5 border-r border-white/10">
              <p className="text-3xl font-bold gradient-text">{stats.avg_ats_score}%</p>
              <p className="text-slate-500 text-xs mt-1">Avg ATS Score</p>
            </div>
            <div className="text-center py-5">
              <p className="text-sm font-bold text-sky-400 leading-tight px-2">{stats.top_categories[0]?.category || "N/A"}</p>
              <p className="text-slate-500 text-xs mt-1">Top Category</p>
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No analyses yet.</p>
              <p className="text-slate-600 text-xs mt-1">Upload a resume to get started!</p>
            </div>
          ) : (
            analyses.map((a, i) => (
              <div key={i} className="rounded-2xl p-4 bg-white/5 border border-white/10 hover:border-sky-500/30 transition-all card-hover">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-xs font-semibold">
                    {a.category}
                  </span>
                  <span className="text-slate-500 text-xs">{new Date(a.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className={`text-lg font-bold ${getGradeColor(a.ats_grade)}`}>{a.ats_score}%</p>
                    <p className="text-slate-500 text-xs">ATS Score</p>
                    <span className={`text-xs font-bold ${getGradeColor(a.ats_grade)}`}>Grade {a.ats_grade}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-white">{a.skills?.length || 0}</p>
                    <p className="text-slate-500 text-xs">Skills</p>
                    <span className="text-xs text-slate-400">detected</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-white">{a.skill_gap_score}%</p>
                    <p className="text-slate-500 text-xs">Skill Match</p>
                    <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(a.skill_gap_score)}`} style={{ width: `${a.skill_gap_score}%` }} />
                    </div>
                  </div>
                </div>
                {a.missing_skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {a.missing_skills.slice(0, 4).map((s, j) => (
                      <span key={j} className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs">
                        -{s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
