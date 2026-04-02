import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { uploadResume, analyzeResume } from "../utils/api";

export default function UploadSection({ onResult }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [error, setError] = useState("");

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const result = await uploadResume(acceptedFiles[0]);
      onResult(result.data);
    } catch (err) {
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
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
    try {
      const result = await analyzeResume(text);
      onResult(result.data);
    } catch (err) {
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-2 mb-6">
          <Sparkles size={14} className="text-sky-400" />
          <span className="text-sky-400 text-sm font-medium">AI-Powered Analysis</span>
        </div>
        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">Forge Your</span>
          <br />
          <span className="text-white">Career Path</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Upload your resume and get instant AI analysis, ATS score, skill gap insights, and real-time job recommendations.
        </p>
      </div>

      <div className="flex gap-2 mb-6 glass rounded-xl p-1">
        <button onClick={() => setActiveTab("upload")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "upload" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"}`}>
          Upload File
        </button>
        <button onClick={() => setActiveTab("paste")} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "paste" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"}`}>
          Paste Text
        </button>
      </div>

      {activeTab === "upload" ? (
        <div {...getRootProps()} className={`glass rounded-2xl p-12 text-center cursor-pointer transition-all border-2 border-dashed ${isDragActive ? "border-sky-500 bg-sky-500/10" : "border-white/10 hover:border-sky-500/50"}`}>
          <input {...getInputProps()} />
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={48} className="text-sky-500 animate-spin" />
              <p className="text-slate-400">Analyzing your resume...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center">
                <Upload size={28} className="text-sky-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{isDragActive ? "Drop your resume here" : "Drag & drop your resume"}</p>
                <p className="text-slate-500 text-sm mt-1">PDF, DOCX, or TXT • Max 10MB</p>
              </div>
              <button className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">
                Browse Files
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl p-6">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your resume text here..." className="w-full h-48 bg-transparent text-slate-300 placeholder-slate-600 resize-none outline-none text-sm leading-relaxed" />
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
            <span className="text-slate-500 text-sm">{text.length} characters</span>
            <button onClick={handleTextAnalyze} disabled={!text.trim() || loading} className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
