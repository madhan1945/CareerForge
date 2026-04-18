import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, Sparkles, FileText, CheckCircle } from "lucide-react";
import { uploadResume, analyzeResume } from "../utils/api";

export default function UploadSection({ onResult }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loadingStep, setLoadingStep] = useState("");

  const steps = [
    "Parsing resume...",
    "Extracting skills...",
    "Calculating ATS score...",
    "Fetching job matches...",
    "Building career path..."
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
      setError("Failed to analyze resume. Make sure the backend is running.");
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
      setError("Failed to analyze resume. Make sure the backend is running.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-2 mb-6 animate-pulse-glow">
          <Sparkles size={14} className="text-sky-400" />
          <span className="text-sky-400 text-sm font-medium">AI-Powered Analysis</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">Forge Your</span>
          <br />
          <span className="text-white">Career Path</span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
          Upload your resume and get instant AI analysis, ATS score, skill gap insights, and real-time job recommendations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 glass rounded-xl p-1">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "upload" ? "bg-sky-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
        >
          Upload File
        </button>
        <button
          onClick={() => setActiveTab("paste")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "paste" ? "bg-sky-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
        >
          Paste Text
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" ? (
        <div
          {...getRootProps()}
          className={`glass rounded-2xl p-10 md:p-12 text-center cursor-pointer transition-all border-2 border-dashed ${
            isDragActive ? "border-sky-500 bg-sky-500/10 scale-105" : "border-white/10 hover:border-sky-500/50"
          }`}
        >
          <input {...getInputProps()} />
          {loading ? (
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <div className="relative">
                <Loader2 size={48} className="text-sky-500 animate-spin" />
                <div className="absolute inset-0 rounded-full animate-pulse-glow" />
              </div>
              <p className="text-sky-400 font-medium">{loadingStep || "Analyzing..."}</p>
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          ) : uploadedFile ? (
            <div className="flex flex-col items-center gap-3 animate-scale-in">
              <CheckCircle size={48} className="text-emerald-400" />
              <p className="text-white font-semibold">{uploadedFile.name}</p>
              <p className="text-slate-500 text-sm">Processing complete!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center transition-transform group-hover:scale-110">
                <Upload size={28} className="text-sky-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">
                  {isDragActive ? "Drop your resume here!" : "Drag & drop your resume"}
                </p>
                <p className="text-slate-500 text-sm mt-1">PDF, DOCX, or TXT • Max 10MB</p>
              </div>
              <button className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95">
                Browse Files
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Paste Text Tab */
        <div className="glass rounded-2xl p-6 animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-slate-400" />
            <span className="text-slate-400 text-xs">Paste your resume content below</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your resume text here..."
            className="w-full h-48 bg-transparent text-slate-300 placeholder-slate-600 resize-none outline-none text-sm leading-relaxed"
          />
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
            <span className="text-slate-500 text-sm">{text.length} characters</span>
            <button
              onClick={handleTextAnalyze}
              disabled={!text.trim() || loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? loadingStep || "Analyzing..." : "Analyze Resume"}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-fade-in">
          {error}
        </div>
      )}

      {/* Features row */}
      <div className="grid grid-cols-3 gap-3 mt-8 stagger-children">
        {[
          { icon: "🎯", label: "ATS Scoring" },
          { icon: "🔍", label: "Skill Gap Analysis" },
          { icon: "💼", label: "Live Job Matches" }
        ].map((f, i) => (
          <div key={i} className="glass rounded-xl p-3 text-center animate-fade-in-up opacity-0" style={{ animationFillMode: "forwards", animationDelay: `${i * 100 + 300}ms` }}>
            <p className="text-lg mb-1">{f.icon}</p>
            <p className="text-slate-400 text-xs">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
