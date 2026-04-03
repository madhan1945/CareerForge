import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Briefcase, Brain, Target, TrendingUp, ExternalLink, ChevronRight, RotateCcw } from "lucide-react";
import CareerPath from "./CareerPath";
import JobFilters from "./JobFilters";
import { useState } from "react";

function ScoreCard({ label, score, color }) {
  return (
    <div className="glass rounded-2xl p-6 card-hover">
      <div className="w-24 h-24 mx-auto mb-4">
        <CircularProgressbar value={score} text={`${score}%`} styles={buildStyles({ textColor: "#f8fafc", pathColor: color, trailColor: "rgba(255,255,255,0.1)", textSize: "20px" })} />
      </div>
      <p className="text-center text-slate-400 text-sm font-medium">{label}</p>
    </div>
  );
}

function SkillBadge({ skill, type }) {
  const colors = {
    matched: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    missing: "bg-red-500/10 border-red-500/30 text-red-400",
    found: "bg-sky-500/10 border-sky-500/30 text-sky-400",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors[type]}`}>
      {skill}
    </span>
  );
}

function JobCard({ job }) {
  return (
    <div className="glass rounded-2xl p-5 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-white font-semibold text-sm">{job.title}</h4>
          <p className="text-slate-400 text-xs mt-1">{job.company}</p>
        </div>
        <span className="flex-shrink-0 px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400 text-xs font-bold">
          {job.match_score}%
        </span>
      </div>
      <p className="text-slate-500 text-xs mb-3 line-clamp-2">{job.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-xs">📍 {job.location}</span>
        <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sky-400 hover:text-sky-300 text-xs font-medium transition-colors">
          Apply <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}

export default function ResultsDashboard({ data, onReset }) {
  const { classification, parsed_info, ats_score, skill_gap, improvement_suggestions, job_recommendations, career_path } = data;
  const [jobs, setJobs] = useState(job_recommendations || []);
  const [filtering, setFiltering] = useState(false);

  const handleFilter = async (filters) => {
    setFiltering(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: parsed_info.skills, category: classification.category, ...filters })
      });
      const result = await response.json();
      setJobs(result.jobs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setFiltering(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Analysis Complete</h2>
          <p className="text-slate-400 mt-1">Here is your personalized career report</p>
        </div>
        <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-slate-400 hover:text-white transition-colors text-sm">
          <RotateCcw size={14} />
          New Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Brain size={20} className="text-indigo-400" />
            </div>
            <h3 className="text-white font-semibold">Classification</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold gradient-text">{classification.category}</span>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs">AI Predicted</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-slate-500 text-xs">Experience</p>
              <p className="text-white font-semibold">{parsed_info.experience_years || "N/A"} yrs</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Word Count</p>
              <p className="text-white font-semibold">{parsed_info.word_count}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">ATS Grade</p>
              <p className="text-white font-semibold">{ats_score.grade}</p>
            </div>
          </div>
        </div>
        <ScoreCard label="ATS Score" score={Math.round(ats_score.overall_score)} color="#0ea5e9" />
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-sky-400" />
          </div>
          <h3 className="text-white font-semibold">ATS Score Breakdown</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(ats_score.breakdown).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400 text-xs capitalize">{key}</span>
                <span className="text-white text-xs font-medium">{value}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
        {ats_score.feedback.length > 0 && (
          <div className="mt-6 space-y-2">
            {ats_score.feedback.map((fb, i) => (
              <div key={i} className="flex items-center gap-2 text-amber-400 text-xs">
                <ChevronRight size={12} />
                {fb}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Target size={20} className="text-emerald-400" />
            </div>
            <h3 className="text-white font-semibold">Detected Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {parsed_info.skills.map((skill, i) => (
              <SkillBadge key={i} skill={skill} type="found" />
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Target size={20} className="text-red-400" />
              </div>
              <h3 className="text-white font-semibold">Skill Gap</h3>
            </div>
            <span className="text-xs text-slate-500">{skill_gap.match_score}% match</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500" style={{ width: `${skill_gap.match_score}%` }} />
          </div>
          <p className="text-slate-400 text-xs mb-3">Missing skills:</p>
          <div className="flex flex-wrap gap-2">
            {skill_gap.missing_skills.slice(0, 8).map((skill, i) => (
              <SkillBadge key={i} skill={skill} type="missing" />
            ))}
          </div>
        </div>
      </div>

      {improvement_suggestions.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">💡 Improvement Suggestions</h3>
          <div className="space-y-2">
            {improvement_suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                <span className="text-sky-400 mt-0.5">→</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {career_path && <CareerPath data={career_path} />}

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Briefcase size={20} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Job Recommendations</h3>
            <p className="text-slate-500 text-xs">Real-time listings matched to your profile</p>
          </div>
        </div>
        <JobFilters onFilter={handleFilter} />
        {filtering ? (
          <div className="text-center py-8 text-slate-400 text-sm">Fetching filtered jobs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job, i) => (
              <JobCard key={i} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
