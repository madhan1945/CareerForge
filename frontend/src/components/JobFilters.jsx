import { useState } from "react";
import { Search, MapPin, DollarSign } from "lucide-react";

export default function JobFilters({ onFilter }) {
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  const handleApply = () => {
    onFilter({
      location,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null
    });
  };

  return (
    <div className="glass rounded-2xl p-4 mb-4">
      <p className="text-slate-400 text-xs mb-3 font-medium">Filter Jobs</p>
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 flex-1 min-w-[150px]">
          <MapPin size={14} className="text-slate-500" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (e.g. Bangalore)" className="bg-transparent text-slate-300 text-xs outline-none w-full placeholder-slate-600" />
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 flex-1 min-w-[120px]">
          <DollarSign size={14} className="text-slate-500" />
          <input value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="Min Salary" type="number" className="bg-transparent text-slate-300 text-xs outline-none w-full placeholder-slate-600" />
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 flex-1 min-w-[120px]">
          <DollarSign size={14} className="text-slate-500" />
          <input value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="Max Salary" type="number" className="bg-transparent text-slate-300 text-xs outline-none w-full placeholder-slate-600" />
        </div>
        <button onClick={handleApply} className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-medium transition-colors">
          <Search size={14} />
          Apply Filters
        </button>
      </div>
    </div>
  );
}
