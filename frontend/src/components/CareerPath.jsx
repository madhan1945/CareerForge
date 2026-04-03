import { TrendingUp, CheckCircle, Circle, ArrowRight } from "lucide-react";

export default function CareerPath({ data }) {
  if (!data) return null;

  const levelColors = {
    junior: "from-slate-500 to-slate-400",
    mid: "from-sky-500 to-sky-400",
    senior: "from-indigo-500 to-indigo-400",
    lead: "from-violet-500 to-violet-400"
  };

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <TrendingUp size={20} className="text-violet-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Career Path</h3>
          <p className="text-slate-500 text-xs">Your personalized growth roadmap</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 rounded-xl">
        <div>
          <p className="text-slate-400 text-xs">Current Role</p>
          <p className="text-white font-semibold">{data.current_role}</p>
        </div>
        <ArrowRight size={20} className="text-sky-400 flex-shrink-0 mx-2" />
        <div>
          <p className="text-slate-400 text-xs">Next Role</p>
          <p className="text-sky-400 font-semibold">{data.next_role}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
        {data.roadmap.map((step, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex flex-col items-center min-w-[80px] ${step.is_current ? "opacity-100" : step.is_completed ? "opacity-60" : "opacity-30"}`}>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${levelColors[step.level]} flex items-center justify-center mb-2`}>
                {step.is_completed ? <CheckCircle size={18} className="text-white" /> : <Circle size={18} className="text-white" />}
              </div>
              <p className="text-white text-xs font-medium text-center">{step.title}</p>
              <p className="text-slate-500 text-xs">{step.years} yrs</p>
              {step.is_current && <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full mt-1">You are here</span>}
            </div>
            {i < data.roadmap.length - 1 && <div className="w-8 h-0.5 bg-white/10 mx-1 flex-shrink-0" />}
          </div>
        ))}
      </div>
      {data.skills_to_acquire.length > 0 && (
        <div>
          <p className="text-slate-400 text-xs mb-3">Skills needed for next role:</p>
          <div className="flex flex-wrap gap-2">
            {data.skills_to_acquire.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-xs">
                + {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
