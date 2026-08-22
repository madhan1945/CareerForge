import { useState, useEffect } from "react";
import { Loader2, Sparkles, User, Briefcase, Award, CheckSquare, Square, ThumbsUp, AlertCircle, RefreshCw } from "lucide-react";

export default function RecruiterPortal() {
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [shortlisting, setShortlisting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/candidates");
      const data = await response.json();
      if (data.success) {
        setCandidates(data.candidates || []);
        // By default, select all candidates
        setSelectedIds((data.candidates || []).map(c => c._id));
      }
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Failed to fetch candidates from database. Make sure the backend server is running.");
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSelectToggle = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map(c => c._id));
    }
  };

  const handleShortlist = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description to match candidates against.");
      return;
    }
    if (selectedIds.length === 0) {
      setError("Please select at least one candidate resume to rank.");
      return;
    }

    setShortlisting(true);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_description: jobDescription,
          candidate_ids: selectedIds
        })
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.candidates);
      } else {
        setError(data.detail || "An error occurred during shortlisting.");
      }
    } catch (err) {
      console.error("Shortlisting error:", err);
      setError("Failed to process candidate shortlist. Make sure the backend is running.");
    } finally {
      setShortlisting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-sky-400 border-sky-500/30 bg-sky-500/10";
    if (score >= 40) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-red-400 border-red-500/30 bg-red-500/10";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-sky-400 animate-pulse" />
          Recruiter shortlisting & Justification
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Input a job description to rank candidates using LLM semantic matching and generate suitability justifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Description and Candidates List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description Input */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Briefcase size={18} className="text-sky-400" />
              Job Description
            </h3>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here... (e.g. 'Looking for a Senior Python Developer with 5+ years of experience in Django, AWS, and PostgreSQL. Must have team leadership experience.')"
              className="w-full h-44 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-slate-300 placeholder-slate-500 outline-none focus:border-sky-500/50 resize-none text-sm transition-all"
            />
          </div>

          {/* Candidate Selection List */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <User size={18} className="text-sky-400" />
                Select Candidates ({selectedIds.length}/{candidates.length})
              </h3>
              {candidates.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
                >
                  {selectedIds.length === candidates.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>

            {loadingCandidates ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={32} className="text-sky-500 animate-spin mb-2" />
                <p className="text-slate-500 text-sm">Loading candidates from database...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                <AlertCircle size={36} className="text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No candidate resumes found in database.</p>
                <p className="text-slate-600 text-xs mt-1">Please upload resumes in the Candidate Portal first.</p>
              </div>
            ) : (
              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
                {candidates.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => handleSelectToggle(c._id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedIds.includes(c._id)
                        ? "bg-sky-500/5 border-sky-500/30 hover:bg-sky-500/10"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-slate-400 hover:text-white transition-colors">
                        {selectedIds.includes(c._id) ? (
                          <CheckSquare size={18} className="text-sky-400" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                      <div>
                        <p className="text-white font-medium text-sm">{c.candidate_name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {c.category} • {c.experience_years || 0} yrs exp • {c.skills?.length || 0} skills
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-white/5 rounded-lg text-slate-300 text-xs font-semibold">
                      ATS: {c.ats_score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions & Quick Stats */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 flex flex-col justify-between h-full min-h-[220px]">
            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Award size={18} className="text-sky-400" />
                Shortlist Actions
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Matches the resumes against your job description semantically. Generates a suitability grade and a detailed recruiter justification report.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs my-3 flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button
                onClick={handleShortlist}
                disabled={shortlisting || loadingCandidates || candidates.length === 0}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
              >
                {shortlisting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Analyzing Resumes...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Run Semantic Shortlisting
                  </>
                )}
              </button>
              <button
                onClick={fetchCandidates}
                disabled={shortlisting}
                className="w-full py-2.5 glass text-slate-400 hover:text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={12} />
                Refresh Candidate List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="mt-10 animate-fade-in-up">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ThumbsUp className="text-emerald-400" />
            Shortlisted Candidates (Ranked by Match)
          </h2>

          {results.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-slate-400">
              No matching candidates found for this description.
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((cand, idx) => (
                <div key={cand.id} className="glass rounded-2xl p-6 border border-white/5 hover:border-sky-500/20 transition-all card-hover animate-scale-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Candidate Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-white font-bold text-lg">{cand.candidate_name}</h4>
                          <span className="text-xs text-slate-500 px-2 py-0.5 bg-white/5 rounded">
                            {cand.category}
                          </span>
                          {cand.is_llm ? (
                            <span className="text-[10px] text-emerald-400 font-bold border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              LLM Verified
                            </span>
                          ) : (
                            <span className="text-[10px] text-sky-400 font-bold border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              AI Matched
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mt-1">
                          File: <span className="text-slate-500">{cand.filename}</span> • Experience: <span className="text-slate-300 font-semibold">{cand.experience_years || 0} years</span>
                        </p>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="px-4 py-2 bg-slate-900/40 border border-white/5 rounded-xl text-center min-w-[90px]">
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">ATS Score</p>
                        <p className="text-white font-bold text-base mt-0.5">{cand.ats_score}%</p>
                        <span className="text-slate-400 text-[10px]">Grade {cand.ats_grade}</span>
                      </div>
                      <div className={`px-4 py-2 border rounded-xl text-center min-w-[110px] ${getScoreColor(cand.semantic_score)}`}>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Semantic Match</p>
                        <p className="font-extrabold text-lg mt-0.5">{cand.semantic_score}%</p>
                        <span className="text-[10px] font-semibold">Match Score</span>
                      </div>
                    </div>
                  </div>

                  {/* LLM Justification */}
                  <div className="mt-5 p-4 bg-slate-900/30 border border-white/5 rounded-xl animate-fade-in">
                    <p className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1.5">Recruiter Justification:</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{cand.justification}</p>
                  </div>

                  {/* Candidate Skills */}
                  <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-slate-500 font-medium mr-1">Skills:</span>
                    {cand.skills.slice(0, 10).map((skill, sIdx) => (
                      <span key={sIdx} className="px-2.5 py-0.5 bg-white/5 border border-white/5 rounded-full text-slate-400 text-xs">
                        {skill}
                      </span>
                    ))}
                    {cand.skills.length > 10 && (
                      <span className="text-xs text-slate-600 font-semibold pl-1">
                        +{cand.skills.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
