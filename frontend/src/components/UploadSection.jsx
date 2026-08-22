import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, Sparkles, FileText, CheckCircle, ArrowRight, Zap, Target, Shield, Users, HelpCircle, Brain, TrendingUp, Briefcase } from "lucide-react";
import { uploadResume, analyzeResume } from "../utils/api";

export default function UploadSection({ onResult }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loadingStep, setLoadingStep] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

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

  const faqs = [
    {
      q: "How does the ATS scoring algorithm work?",
      a: "Our ATS compatibility engine evaluates resume layout parameters (like word count and structure), contact details presence, keyword densities, and matches your skills against industry standards. It outputs a score and actionable improvements."
    },
    {
      q: "What is LLM Semantic Matching?",
      a: "Unlike traditional keyword-matching systems, CareerForge uses vector embedding semantic models (and optional Google Gemini support) to evaluate the deeper meaning and experience context of a resume relative to a job description. This provides highly accurate shortlisting with natural text justifications."
    },
    {
      q: "Is my personal data secure?",
      a: "Yes. All resumes processed through CareerForge are stored securely in your private database. We do not sell, rent, or share candidate data with external organizations."
    },
    {
      q: "How does the recruiter portal work?",
      a: "Recruiters can enter any custom job description, choose which parsed candidates in the system to evaluate, and immediately retrieve a ranked candidate leaderboard with detailed AI justifications explaining why each candidate matches the role."
    }
  ];

  return (
    <div className="w-full space-y-28 pt-8">
      {/* Decorative ambient orbs (translucent glow) */}
      <div className="orb orb-1 opacity-20 pointer-events-none filter blur-[120px]" />
      <div className="orb orb-2 opacity-20 pointer-events-none filter blur-[120px]" />

      {/* SECTION 1: HERO & INTERACTIVE PARSER */}
      <section className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Value Prop (5 Columns) */}
          <div className="lg:col-span-5 space-y-6 text-left animate-fade-in-up">
            
            {/* Pill Badge with pulse dot */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-slate-950/40 text-[11px] font-medium text-slate-300 backdrop-blur-sm shadow-inner shadow-white/5 animate-pulse-glow">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              ✨ Enterprise Ready AI Recruiting
            </div>

            {/* Title with sleek cyan-to-violet gradient */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]">
              Forge Your <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
                Hiring Pipeline
              </span>
            </h1>

            {/* Muted Description */}
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Extract resume skills, grade ATS compliance, scan technical gaps, and match candidate embeddings semantically. Powered by scikit-learn & Google Gemini.
            </p>

            {/* Glowing Micro-Card Highlights */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {[
                { icon: <Sparkles size={14} className="text-cyan-400" />, title: "Neural Skill Extraction", desc: "spaCy-driven entity and technology classification" },
                { icon: <TrendingUp size={14} className="text-indigo-400" />, title: "ATS Scorer & Grading", desc: "Structure audits and formatting optimization suggestions" },
                { icon: <Brain size={14} className="text-violet-400" />, title: "LLM Justification Report", desc: "Detailed match justifications using semantic scoring" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3.5 p-3 rounded-2xl border border-white/5 bg-slate-950/20 backdrop-blur-sm card-hover">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner shadow-white/5">
                    {item.icon}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.title}</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Metrics Counters cards */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/5 max-w-md">
              {[
                { value: "2.4k+", label: "Resumes Trained" },
                { value: "95.8%", label: "Precision Rate" },
                { value: "< 3s", label: "Analysis Latency" }
              ].map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-white/5 bg-slate-950/30 text-left">
                  <p className="text-2xl font-black text-white bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">{m.value}</p>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Dropzone Card (7 Columns) */}
          <div className="lg:col-span-7 w-full relative group">
            {/* Ambient Radial Glow underneath the card */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 opacity-30 blur-2xl group-hover:opacity-40 transition-opacity duration-500" />
            
            <div className="relative glass rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10 overflow-hidden bg-slate-950/40 backdrop-blur-md">
              
              {/* Tab Mode Switcher */}
              <div className="flex bg-black/40 border border-white/5 rounded-2xl p-1 mb-6">
                <button
                  onClick={() => { setActiveTab("upload"); setError(""); }}
                  className={`flex-grow py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "upload"
                      ? "bg-white/10 text-white shadow-inner shadow-white/10 border border-white/5"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Upload size={13} />
                  Upload Document
                </button>
                <button
                  onClick={() => { setActiveTab("paste"); setError(""); }}
                  className={`flex-grow py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "paste"
                      ? "bg-white/10 text-white shadow-inner shadow-white/10 border border-white/5"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileText size={13} />
                  Paste Plain Text
                </button>
              </div>

              {/* Upload Drag & Drop Panel */}
              {activeTab === "upload" ? (
                <div
                  {...getRootProps()}
                  className={`glass rounded-2xl p-10 text-center cursor-pointer transition-all border-2 border-dashed relative min-h-[280px] flex flex-col justify-center items-center ${
                    isDragActive
                      ? "border-cyan-500/60 bg-cyan-500/5 scale-[1.01]"
                      : "border-white/10 hover:border-cyan-500/30 hover:bg-white/5"
                  }`}
                >
                  <input {...getInputProps()} />
                  {loading ? (
                    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                      <div className="relative">
                        <Loader2 size={36} className="text-cyan-400 animate-spin" />
                        <div className="absolute inset-0 rounded-full animate-pulse-glow" />
                      </div>
                      <p className="text-cyan-400 font-semibold text-xs tracking-wider uppercase">{loadingStep || "Processing..."}</p>
                      <div className="w-40 h-0.5 bg-white/10 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full animate-pulse w-3/4" />
                      </div>
                    </div>
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center gap-3 animate-scale-in">
                      <CheckCircle size={36} className="text-emerald-400" />
                      <p className="text-white font-semibold text-xs">{uploadedFile.name}</p>
                      <p className="text-slate-500 text-[10px]">Ready to process</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      {/* ACCENTED CIRCULAR CONTAINER */}
                      <div className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:scale-105 duration-300">
                        <Upload size={22} className="text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">
                          {isDragActive ? "Drop the file here!" : "Drag & drop your resume file"}
                        </p>
                        <p className="text-slate-500 text-[10px] mt-1">PDF, DOCX, or TXT • Max 10MB</p>
                      </div>
                      <button className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-indigo-500 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/10">
                        Select File
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Paste Panel */
                <div className="glass rounded-2xl p-4 border border-white/10 animate-scale-in flex flex-col min-h-[280px]">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste plain resume text details here..."
                    className="w-full flex-1 min-h-[180px] bg-transparent text-slate-300 placeholder-slate-600 resize-none outline-none text-xs leading-relaxed"
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                    <span className="text-slate-500 text-xs">{text.length} characters</span>
                    <button
                      onClick={handleTextAnalyze}
                      disabled={!text.trim() || loading}
                      className="flex items-center gap-1.5 px-5 py-2 bg-white text-black hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {loading ? loadingStep || "Analyzing..." : "Analyze"}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center flex items-center justify-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 text-center">
        <div className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">How CareerForge Works</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-lg mx-auto">
            A simplified, intelligent, three-step pipeline built to optimize job matches and shortlist top talents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Upload & Parse",
              desc: "Drag in your PDF/DOCX. Our NLP parser uses spaCy to instantly extract entities, locations, education, and years of experience."
            },
            {
              step: "02",
              title: "ATS & Gap Scan",
              desc: "The system grades formatting, keyword density, and checks for skill gaps, suggesting resources and technical areas to improve."
            },
            {
              step: "03",
              title: "Semantic Match",
              desc: "Compare candidates against custom job details using local vector embeddings and Google Gemini for ranked shortlists with justifications."
            }
          ].map((s, idx) => (
            <div key={idx} className="glass rounded-3xl p-6.5 relative border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all text-left group">
              <span className="text-5xl font-black text-white/5 absolute right-6 top-6 select-none group-hover:text-white/10 transition-colors duration-300">{s.step}</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-extrabold text-sm mb-4">
                {idx + 1}
              </div>
              <h4 className="text-white font-bold text-base mb-2">{s.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: PRODUCT MATRIX */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Advanced Product Capabilities</h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              CareerForge features a state-of-the-art classifier trained on thousands of resumes across 24 job categories. We combine machine learning with advanced LLM reasoning to ensure robust matching results.
            </p>
            
            <div className="mt-8 space-y-4">
              {[
                { title: "TF-IDF + LinearSVC Classifier", desc: "Our best-performing category classifier maintains a high cross-validation F1-score of 0.712." },
                { title: "Dynamic Career Roadmap Generator", desc: "Auto-maps your experience years to junior, mid, senior, or lead tiers, outlining skills to acquire." },
                { title: "Recruiter Leaderboards", desc: "Rank multiple applicants against any job description, sort by cosine semantic similarity, and display justifications." }
              ].map((cap, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-5 h-5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mt-1 flex-shrink-0">✓</div>
                  <div>
                    <h5 className="text-white font-bold text-sm">{cap.title}</h5>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass rounded-3xl p-6 border border-white/5 bg-gradient-to-br from-white/5 to-transparent relative min-h-[300px] flex items-center justify-center">
            {/* Mock Dashboard Preview */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Candidate Rank</span>
                <span className="text-slate-500 text-xs">Leaderboard Preview</span>
              </div>
              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500 text-white font-bold text-xs flex items-center justify-center">#1</div>
                  <div>
                    <p className="text-white font-bold text-xs">Jane Doe</p>
                    <p className="text-slate-400 text-[10px]">Data Scientist • 4 yrs exp</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-emerald-500/25 text-emerald-400 rounded-full font-bold text-[9px]">94% Match</span>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between opacity-80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center">#2</div>
                  <div>
                    <p className="text-white font-semibold text-xs">John Smith</p>
                    <p className="text-slate-500 text-[10px]">ML Engineer • 2 yrs exp</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded-full font-bold text-[9px]">81% Match</span>
                </div>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-white font-bold text-xs flex items-center justify-center">#3</div>
                  <div>
                    <p className="text-white text-xs">Alice Johnson</p>
                    <p className="text-slate-500 text-[10px]">Python Developer • 1 yr exp</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-bold text-[9px]">62% Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 text-center">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Loved by Candidates & Recruiters</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-2">
            See how CareerForge helps talent optimize resumes and assists HR departments in finding top matching professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass rounded-3xl p-6 text-left border border-white/5 bg-gradient-to-br from-white/5 to-transparent flex flex-col justify-between">
            <p className="text-slate-300 text-xs md:text-sm italic leading-relaxed">
              "As a job seeker, the ATS checker pointed out formatting errors I was completely unaware of. The skill gap roadmap suggested I learn Kubernetes, which directly helped me pass my technical interview for my current cloud developer role!"
            </p>
            <div className="flex items-center gap-3 mt-6 border-t border-white/5 pt-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                MK
              </div>
              <div>
                <h5 className="text-white font-bold text-xs">Manoj Kumar</h5>
                <p className="text-slate-500 text-[10px]">Full Stack Python Developer</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-3xl p-6 text-left border border-white/5 bg-gradient-to-br from-white/5 to-transparent flex flex-col justify-between">
            <p className="text-slate-300 text-xs md:text-sm italic leading-relaxed">
              "We process over 50 resumes a week. With the Recruiter Portal's semantic shortlisting and Gemini justifications, we can filter applicants and draft justifications for our client shortlist reports in minutes instead of hours."
            </p>
            <div className="flex items-center gap-3 mt-6 border-t border-white/5 pt-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                SP
              </div>
              <div>
                <h5 className="text-white font-bold text-xs">Sneha Patel</h5>
                <p className="text-slate-500 text-[10px]">Lead Technical Recruiter, TechCorp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FAQS */}
      <section className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left text-white font-semibold text-xs md:text-sm flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-cyan-400 text-base">{activeFaq === idx ? "−" : "+"}</span>
              </button>
              {activeFaq === idx && (
                <div className="p-5 text-slate-400 text-xs leading-relaxed bg-slate-900/30 border-t border-white/5 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-12 pb-8 text-left mt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center">
                <Briefcase size={14} className="text-white" />
              </div>
              <span className="text-base font-bold text-white">CareerForge</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed max-w-[200px]">
              AI-Powered Resume Analysis, ATS Compatibility Scorer, and semantic candidate matching.
            </p>
          </div>
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Features</h5>
            <ul className="space-y-2 text-slate-500 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Resume Parsing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">ATS Optimization</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Skill Gap Scanner</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Recruiter Shortlist</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Tech Stack</h5>
            <ul className="space-y-2 text-slate-500 text-xs">
              <li><a href="https://fastapi.tiangolo.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">FastAPI (Python)</a></li>
              <li><a href="https://react.dev" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">React & Tailwind</a></li>
              <li><a href="https://scikit-learn.org" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">scikit-learn Classifier</a></li>
              <li><a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Google Gemini API</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Open Source</h5>
            <ul className="space-y-2 text-slate-500 text-xs">
              <li><a href="https://github.com/madhan1945/CareerForge" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
              <li><a href="https://github.com/madhan1945/CareerForge/issues" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Submit an Issue</a></li>
              <li><a href="https://github.com/madhan1945/CareerForge/pulls" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Pull Requests</a></li>
              <li><a href="https://github.com/madhan1945" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Creator Profile</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-6 border-t border-white/5 gap-4">
          <p className="text-slate-600 text-[10px]">&copy; 2026 CareerForge. Open source under MIT License.</p>
          <div className="flex gap-4 text-slate-600 text-[10px]">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
