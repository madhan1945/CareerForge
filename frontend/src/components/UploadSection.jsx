import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, Sparkles, FileText, CheckCircle, ArrowRight, Zap, Target, Shield, Users } from "lucide-react";
import { uploadResume, analyzeResume } from "../utils/api";

export default function UploadSection({ onResult }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loadingStep, setLoadingStep] = useState("");

  const steps = [
    "Parsing resume document...",
    "Extracting skills & entities...",
    "Calculating ATS compatibility...",
    "Retrieving recommended jobs...",
    "Building career roadmap..."
  ];

  const simulateSteps = () => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setLoadingStep(steps[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1200);
    return interval;
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setUploadedFile(acceptedFiles[0]);
    setLoading(true);
    setError("");
    const interval = simulateSteps();
    try {
      const result = await uploadResume(acceptedFiles[0]);
      clearInterval(interval);
      onResult(result.data);
    } catch (err) {
      clearInterval(interval);
      setError("Failed to analyze resume. Make sure the backend server is running.");
      setUploadedFile(null);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }, [onResult]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"]
    },
    maxFiles: 1,
  });

  const handleTextAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    const interval = simulateSteps();
    try {
      const result = await analyzeResume(text);
      clearInterval(interval);
      onResult(result.data);
    } catch (err) {
      clearInterval(interval);
      setError("Failed to analyze resume. Make sure the backend server is running.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 animate-fade-in-up">
      {/* Decorative background orbs */}
      <div className="orb orb-1 opacity-20 pointer-events-none" />
      <div className="orb orb-2 opacity-20 pointer-events-none" />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: SaaS Pitch & Copy (5 Columns) */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/20 rounded-full px-4.5 py-1.5 animate-pulse-glow">
            <Sparkles size={14} className="text-sky-400" />
            <span className="text-sky-400 text-xs font-semibold uppercase tracking-wider">CareerForge AI v2.0</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Forge Your <br />
            <span className="gradient-text">Dream Career</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            The next-generation AI platform for candidates and recruiters. Scan resumes, score ATS compatibility, analyze skill gaps, and short-list applicants in seconds.
          </p>

          {/* Feature List */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                ✓
              </div>
              <span className="text-sm font-medium">Deep Neural Skill Extraction</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                ✓
              </div>
              <span className="text-sm font-medium">ATS Compatibility Scoring & Grading</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                ✓
              </div>
              <span className="text-sm font-medium">LLM-Powered Semantic Matching & Justification</span>
            </div>
          </div>

          {/* Metrics Counters */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
            <div>
              <p className="text-2xl font-bold text-white">2.4k+</p>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">Resumes Trained</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">95%+</p>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">Precision Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">A/B Grade</p>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">Average Score</p>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive AI Upload Widget (7 Columns) */}
        <div className="lg:col-span-7 w-full">
          <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10 relative overflow-hidden shadow-sky-500/5">
            {/* Glowing background gradient inside the card */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full filter blur-3xl pointer-events-none" />
            
            {/* Tab switchers */}
            <div className="flex gap-2 mb-6 bg-slate-950/40 border border-white/5 rounded-2xl p-1">
              <button
                onClick={() => { setActiveTab("upload"); setError(""); }}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "upload"
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Upload size={15} />
                Upload Resume
              </button>
              <button
                onClick={() => { setActiveTab("paste"); setError(""); }}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "paste"
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileText size={15} />
                Paste Resume Text
              </button>
            </div>

            {/* Upload Tab Container */}
            {activeTab === "upload" ? (
              <div
                {...getRootProps()}
                className={`glass rounded-2xl p-12 text-center cursor-pointer transition-all border-2 border-dashed relative group overflow-hidden min-h-[300px] flex flex-col justify-center items-center ${
                  isDragActive
                    ? "border-sky-500 bg-sky-500/5 scale-[1.02]"
                    : "border-white/10 hover:border-sky-500/40 hover:bg-white/5"
                }`}
              >
                <input {...getInputProps()} />
                {loading ? (
                  <div className="flex flex-col items-center gap-4 animate-fade-in w-full max-w-sm">
                    <div className="relative">
                      <Loader2 size={44} className="text-sky-500 animate-spin" />
                      <div className="absolute inset-0 rounded-full animate-pulse-glow" />
                    </div>
                    <p className="text-sky-400 font-semibold text-sm">{loadingStep || "Analyzing..."}</p>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full animate-pulse w-3/4" />
                    </div>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex flex-col items-center gap-3 animate-scale-in">
                    <CheckCircle size={44} className="text-emerald-400" />
                    <p className="text-white font-semibold text-sm">{uploadedFile.name}</p>
                    <p className="text-slate-500 text-xs">Upload completed! Processing details...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/20 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                      <Upload size={26} className="text-sky-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-base">
                        {isDragActive ? "Drop the file here!" : "Drag & drop your resume file"}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">Accepts PDF, DOCX, or TXT • Max 10MB</p>
                    </div>
                    <button className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-md shadow-sky-500/10 mt-2">
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Paste Text Tab Container */
              <div className="glass rounded-2xl p-5 border border-white/10 animate-scale-in flex flex-col min-h-[300px]">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your plain text resume content here..."
                  className="w-full flex-1 min-h-[200px] bg-transparent text-slate-300 placeholder-slate-600 resize-none outline-none text-sm leading-relaxed"
                />
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                  <span className="text-slate-500 text-xs font-medium">{text.length} characters</span>
                  <button
                    onClick={handleTextAnalyze}
                    disabled={!text.trim() || loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                  >
                    {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {loading ? loadingStep || "Analyzing..." : "Analyze Resume"}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center animate-fade-in flex items-center justify-center gap-2">
                <span className="text-sm font-bold">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Feature Section Cards (Bottom) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-8 border-t border-white/5">
        {[
          {
            icon: <Target className="text-sky-400" size={20} />,
            title: "ATS Optimizer Score",
            desc: "Instantly grade your resume layout, content depth, keywords, and density against global ATS parser rules."
          },
          {
            icon: <Zap className="text-sky-400" size={20} />,
            title: "Semantic Gap Scanning",
            desc: "Find missing technologies and domain skills required for your dream job and get instant upgrade suggestions."
          },
          {
            icon: <Users className="text-sky-400" size={20} />,
            title: "Recruiter Portal",
            desc: "Shortlist multiple candidates semantically against custom job profiles and auto-generate AI justifications."
          }
        ].map((f, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-5 border border-white/5 text-left card-hover"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4">
              {f.icon}
            </div>
            <h4 className="text-white font-bold text-base mb-1.5">{f.title}</h4>
            <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
