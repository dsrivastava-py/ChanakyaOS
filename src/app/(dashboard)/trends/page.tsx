"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Pin, 
  AlertTriangle, 
  Briefcase, 
  ArrowUpRight,
  Sparkles,
  Plus
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

export default function MarketTrends() {
  const [mounted, setMounted] = useState(false);
  const { market_trends, active_pathway, pinTrend, unpinTrend, pinned_trends, saveSnippetToNotes } = useUserStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPinned = (title: string) => pinned_trends.some(t => t.title === title);

  const togglePin = (title: string, data: Record<string, unknown>) => {
    if (isPinned(title)) {
      unpinTrend(title);
    } else {
      pinTrend({ title, ...data });
    }
  };

  // Mock data for charts
  const salaryData = [
    { name: "Entry", value: 4.5 },
    { name: "1-3Y", value: 8.2 },
    { name: "4-6Y", value: 15.5 },
    { name: "7-10Y", value: 24.0 },
    { name: "10Y+", value: 38.0 },
  ];

  const momentumData = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 600 },
    { name: "Apr", value: 800 },
    { name: "May", value: 500 },
    { name: "Jun", value: 900 },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="mb-4">
        <p className="text-[#10B981] text-sm font-medium tracking-[0.12em] uppercase mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Live Market Intelligence
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight max-w-2xl">
          Intelligence for <span className="text-[#10B981]">{active_pathway}</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Salary Benchmark Chart */}
        <div className="lg:col-span-2 bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8 relative">
          <button 
            onClick={() => togglePin("Salary Benchmark", { salaryData })}
            className={`absolute top-6 right-6 p-2 rounded-lg transition-all ${isPinned("Salary Benchmark") ? 'bg-[#10B981] text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
          >
            <Pin className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-semibold text-white">Salary Benchmark (India)</h2>
              <p className="text-xs text-gray-500 mt-1">Average annual compensation in Lakhs (INR)</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                defaultValue="Bangalore" 
                className="bg-[#1A2236] border border-[#1F2937] text-sm text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-[#10B981]/50"
              />
            </div>
          </div>

            {mounted && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}L`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111827", borderColor: "#1F2937", borderRadius: "12px", fontSize: "12px" }}
                    itemStyle={{ color: "#10B981" }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Hiring Momentum Card */}
        <div className="bg-[#111827]/75 backdrop-blur-md border border-[#10B981]/20 rounded-3xl p-8 flex flex-col relative overflow-hidden">
          <button 
            onClick={() => togglePin("Hiring Momentum", { momentumData })}
            className={`absolute top-6 right-6 p-2 rounded-lg transition-all z-10 ${isPinned("Hiring Momentum") ? 'bg-[#10B981] text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <h2 className="text-lg font-semibold text-white mb-2">Hiring Momentum</h2>
          <div className="flex items-center gap-3 mt-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">+18.4%</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Quarterly Growth</div>
            </div>
          </div>

          <div className="h-32 w-full mt-auto min-h-[120px]">
            {mounted && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={momentumData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Emerging Skills */}
        <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8 relative">
           <button 
            onClick={() => togglePin("Emerging Skills", { skills: market_trends.emergingSkills })}
            className={`absolute top-6 right-6 p-2 rounded-lg transition-all ${isPinned("Emerging Skills") ? 'bg-[#10B981] text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-white font-semibold">Emerging Skills</h2>
          </div>
          <div className="space-y-4">
            {market_trends.emergingSkills.map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#1A2236] border border-[#1F2937] rounded-2xl group hover:border-[#10B981]/30 transition-all">
                <span className="text-gray-300 text-sm font-medium">{skill}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => saveSnippetToNotes({ 
                      title: `Skill Trend: ${skill}`, 
                      content: `${skill} is identified as an emerging skill in the current market for ${active_pathway}.`,
                      link: '/trends'
                    })}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all mr-1"
                    title="Send to LMS Notes"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-tighter bg-[#10B981]/10 px-2 py-0.5 rounded">Hot</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-600 group-hover:text-[#10B981] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recruitment Alerts */}
        <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8 relative">
           <button 
            onClick={() => togglePin("Recruitment Alert", { alert: "64% startup filter" })}
            className={`absolute top-6 right-6 p-2 rounded-lg transition-all ${isPinned("Recruitment Alert") ? 'bg-[#10B981] text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-8">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h2 className="text-white font-semibold">Strategic Alerts</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-yellow-500/5 border border-yellow-500/20 p-5 rounded-2xl group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-yellow-500 font-bold text-xs uppercase tracking-widest">Startup Filter</h3>
                <button 
                  onClick={() => saveSnippetToNotes({
                    title: "Recruitment Alert: Startup Filter",
                    content: "64% of top Indian startups are now skipping resumes without active GitHub/Portfolio URLs for this role.",
                    link: "/trends"
                  })}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-[10px] font-bold transition-all"
                >
                  <Plus className="w-3 h-3" /> Pinned to Notes
                </button>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                64% of top Indian startups are now skipping resumes without active GitHub/Portfolio URLs for this role.
              </p>
            </div>
            <div className="bg-[#10B981]/5 border border-[#10B981]/20 p-5 rounded-2xl group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[#10B981] font-bold text-xs uppercase tracking-widest">Remote Shift</h3>
                <button 
                  onClick={() => saveSnippetToNotes({
                    title: "Market Shift: Remote Models",
                    content: "Transition to \"Hybrid\" models in Pune and Hyderabad is increasing demand for async communication skills.",
                    link: "/trends"
                  })}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 text-[10px] font-bold transition-all"
                >
                  <Plus className="w-3 h-3" /> Pinned to Notes
                </button>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Transition to &quot;Hybrid&quot; models in Pune and Hyderabad is increasing demand for async communication skills.
              </p>
            </div>
          </div>
        </div>

        {/* Top Employers */}
        <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8 relative">
          <button 
            onClick={() => togglePin("Top Employers", { employers: ["Reliance", "Zomato", "CRED", "Razorpay", "Postman", "Groww"] })}
            className={`absolute top-6 right-6 p-2 rounded-lg transition-all ${isPinned("Top Employers") ? 'bg-[#10B981] text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-semibold text-white mb-8 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#D4AF37]" />
            Active Employers
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {["Reliance", "Zomato", "CRED", "Razorpay", "Postman", "Groww"].map((employer) => (
              <div key={employer} className="p-4 bg-[#1A2236] border border-[#1F2937] rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/5 transition-all group">
                <div className="w-10 h-10 bg-gray-800 rounded-full mb-3 flex items-center justify-center text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors">
                  {employer[0]}
                </div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-white">{employer}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
