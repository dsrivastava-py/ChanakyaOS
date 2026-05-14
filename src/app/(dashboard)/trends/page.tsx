"use client";

import { useState, useEffect, useMemo } from "react";
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
  Plus,
  DollarSign,
  BarChart3,
  MapPin,
  Clock,
  Building,
  Filter,
  RefreshCw,
  Loader2
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
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function MarketTrends() {
  const [mounted, setMounted] = useState(false);
  const {
    market_trends,
    active_pathway,
    locked_pathway,
    pinTrend,
    unpinTrend,
    pinned_trends,
    saveSnippetToNotes
  } = useUserStore();

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [salaryLocation, setSalaryLocation] = useState("Bangalore");
  const [salaryExperience, setSalaryExperience] = useState("0-2");

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

  // Generate dynamic data based on user's locked pathway
  const dynamicSalaryData = useMemo(() => {
    const baseSalaries: Record<string, number[]> = {
      "Data Analyst": [4.5, 7.5, 12, 18, 28],
      "Full Stack Developer": [5, 9, 15, 24, 35],
      "Product Manager": [8, 14, 22, 35, 50],
      "Data Scientist": [6, 10, 18, 28, 42],
      "UI/UX Designer": [4, 7, 12, 18, 25],
      "Machine Learning Engineer": [7, 12, 20, 32, 48],
      "Business Analyst": [5, 8, 14, 22, 32],
      "DevOps Engineer": [6, 10, 16, 26, 38]
    };

    const pathway = locked_pathway?.title || active_pathway;
    const salaries = baseSalaries[pathway] || [5, 8, 14, 22, 32];

    // Apply location multiplier
    const locationMultipliers: Record<string, number> = {
      "Bangalore": 1.2,
      "Hyderabad": 1.05,
      "Pune": 1.0,
      "Mumbai": 1.15,
      "Delhi NCR": 1.1,
      "Chennai": 0.95,
      "Kolkata": 0.85,
      "Remote": 1.0
    };

    const multiplier = locationMultipliers[salaryLocation] || 1.0;

    return [
      { name: "Entry (0-2Y)", value: Math.round(salaries[0] * multiplier) },
      { name: "Junior (2-4Y)", value: Math.round(salaries[1] * multiplier) },
      { name: "Mid (4-6Y)", value: Math.round(salaries[2] * multiplier) },
      { name: "Senior (6-10Y)", value: Math.round(salaries[3] * multiplier) },
      { name: "Lead (10Y+)", value: Math.round(salaries[4] * multiplier) },
    ];
  }, [locked_pathway, active_pathway, salaryLocation]);

  // Hiring momentum data
  const momentumData = [
    { name: "Jan", value: 420 },
    { name: "Feb", value: 380 },
    { name: "Mar", value: 580 },
    { name: "Apr", value: 620 },
    { name: "May", value: 480 },
    { name: "Jun", value: 780 },
    { name: "Jul", value: 720 },
    { name: "Aug", value: 890 },
  ];

  // Skill demand data
  const skillDemandData = [
    { name: "Python", value: 85, color: "#D4AF37" },
    { name: "SQL", value: 78, color: "#3B82F6" },
    { name: "Tableau", value: 65, color: "#10B981" },
    { name: "ML/AI", value: 72, color: "#8B5CF6" },
    { name: "Excel", value: 55, color: "#F59E0B" },
    { name: "Power BI", value: 68, color: "#EF4444" },
  ];

  // Get salary for selected experience
  const getSalaryForExperience = () => {
    const expMap: Record<string, number> = {
      "0-2": dynamicSalaryData[0].value,
      "2-4": dynamicSalaryData[1].value,
      "4-6": dynamicSalaryData[2].value,
      "6-10": dynamicSalaryData[3].value,
      "10+": dynamicSalaryData[4].value
    };
    return expMap[salaryExperience] || dynamicSalaryData[0].value;
  };

  // Refresh data
  const refreshData = async () => {
    setIsLoadingData(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoadingData(false);
  };

  // Top companies for the pathway
  const topCompanies = [
    { name: "Google", roles: 45, logo: "G" },
    { name: "Amazon", roles: 38, logo: "A" },
    { name: "Microsoft", roles: 32, logo: "M" },
    { name: "Flipkart", roles: 28, logo: "F" },
    { name: "Meesho", roles: 24, logo: "M" },
    { name: "Cred", roles: 20, logo: "C" },
    { name: "Razorpay", roles: 18, logo: "R" },
    { name: "Dunzo", roles: 15, logo: "D" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[#10B981] text-sm font-medium tracking-[0.12em] uppercase mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Live Market Intelligence
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight max-w-2xl">
            Intelligence for <span className="text-[#10B981]">{locked_pathway?.title || active_pathway}</span>
          </h1>
        </div>
        <button
          onClick={refreshData}
          disabled={isLoadingData}
          className="flex items-center gap-2 px-5 py-3 bg-[#111827] border border-[#1F2937] rounded-xl text-gray-400 hover:text-white hover:border-[#10B981]/30 transition-all"
        >
          {isLoadingData ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh Data
        </button>
      </header>

      {/* Salary Benchmark Tool */}
      <div className="bg-gradient-to-r from-[#10B981]/10 to-transparent border border-[#10B981]/20 rounded-3xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="w-6 h-6 text-[#10B981]" />
          <h2 className="text-xl font-semibold text-white">Salary Benchmark Tool</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Location</label>
            <select
              value={salaryLocation}
              onChange={(e) => setSalaryLocation(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:border-[#10B981]/50 outline-none"
            >
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Chennai">Chennai</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Experience</label>
            <select
              value={salaryExperience}
              onChange={(e) => setSalaryExperience(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:border-[#10B981]/50 outline-none"
            >
              <option value="0-2">0-2 Years</option>
              <option value="2-4">2-4 Years</option>
              <option value="4-6">4-6 Years</option>
              <option value="6-10">6-10 Years</option>
              <option value="10+">10+ Years</option>
            </select>
          </div>
          <div className="md:col-span-2 bg-[#0B0F19] rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Estimated Salary</p>
              <p className="text-3xl font-bold text-[#10B981]">₹{getSalaryForExperience()}L<span className="text-lg text-gray-400">/yr</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Percentile</p>
              <p className="text-xl font-bold text-white">Top 35%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Salary Benchmark Chart */}
        <div className="lg:col-span-2 bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8 relative">
          <button
            onClick={() => togglePin("Salary Benchmark", { salaryData: dynamicSalaryData })}
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
              <MapPin className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={salaryLocation}
                onChange={(e) => setSalaryLocation(e.target.value)}
                className="bg-[#1A2236] border border-[#1F2937] text-sm text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-[#10B981]/50"
              >
                {["Bangalore", "Hyderabad", "Pune", "Mumbai", "Delhi NCR", "Chennai"].map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {mounted && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dynamicSalaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#1F2937", borderRadius: "12px", fontSize: "12px" }}
                  itemStyle={{ color: "#10B981" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  formatter={(value) => [`₹${Number(value)}L/yr`, "Salary"]}
                />
                <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Hiring Momentum Card */}
        <div className="bg-[#111827]/75 backdrop-blur-md border border-[#10B981]/20 rounded-3xl p-6 flex flex-col relative overflow-hidden">
          <button
            onClick={() => togglePin("Hiring Momentum", { momentumData })}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-all z-10 ${isPinned("Hiring Momentum") ? 'bg-[#10B981] text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none"></div>

          <h2 className="text-lg font-semibold text-white mb-1">Hiring Momentum</h2>
          <div className="flex items-center gap-3 mt-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">+18.4%</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest">Quarterly Growth</div>
            </div>
          </div>

          <div className="h-24 w-full mt-auto">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={momentumData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVal" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111827", borderColor: "#1F2937", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(value) => [`${Number(value)} jobs`, "Hiring"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Skill Demand */}
        <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8 relative">
          <button
            onClick={() => togglePin("Skill Demand", { skills: skillDemandData })}
            className={`absolute top-6 right-6 p-2 rounded-lg transition-all ${isPinned("Skill Demand") ? 'bg-[#10B981] text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-white font-semibold">Skill Demand</h2>
          </div>
          {mounted && (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillDemandData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {skillDemandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111827", borderColor: "#1F2937", borderRadius: "12px" }}
                    formatter={(value) => [`${Number(value)}%`, "Demand"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {skillDemandData.map((skill, idx) => (
              <span key={idx} className="text-xs flex items-center gap-1 bg-[#0B0F19] px-2 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: skill.color }} />
                {skill.name}
              </span>
            ))}
          </div>
        </div>

        {/* Strategic Alerts */}
        <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8 relative">
          <button
            onClick={() => togglePin("Strategic Alerts", { alert: "64% startup filter" })}
            className={`absolute top-6 right-6 p-2 rounded-lg transition-all ${isPinned("Strategic Alerts") ? 'bg-[#10B981] text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
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
                <h3 className="yellow-500 font-bold text-xs uppercase tracking-widest text-yellow-500">Startup Filter</h3>
                <button
                  onClick={() => saveSnippetToNotes({
                    title: "Recruitment Alert: Startup Filter",
                    content: "64% of top Indian startups are now skipping resumes without active GitHub/Portfolio URLs for this role.",
                    link: "/trends"
                  })}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-[10px] font-bold transition-all"
                >
                  <Plus className="w-3 h-3" /> Save
                </button>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                64% of top Indian startups skip resumes without active GitHub/Portfolio URLs.
              </p>
            </div>
            <div className="bg-[#10B981]/5 border border-[#10B981]/20 p-5 rounded-2xl group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[#10B981] font-bold text-xs uppercase tracking-widest">Remote Shift</h3>
                <button
                  onClick={() => saveSnippetToNotes({
                    title: "Market Shift: Remote Models",
                    content: "Transition to 'Hybrid' models in Pune and Hyderabad is increasing demand for async communication skills.",
                    link: "/trends"
                  })}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 text-[10px] font-bold transition-all"
                >
                  <Plus className="w-3 h-3" /> Save
                </button>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Pune & Hyderabad shifting to Hybrid, increasing demand for async communication skills.
              </p>
            </div>
          </div>
        </div>

        {/* Top Employers */}
        <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8 relative">
          <button
            onClick={() => togglePin("Top Employers", { employers: topCompanies.map(c => c.name) })}
            className={`absolute top-6 right-6 p-2 rounded-lg transition-all ${isPinned("Top Employers") ? 'bg-[#10B981] text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Building className="w-5 h-5 text-[#D4AF37]" />
            Active Employers - {salaryLocation}
          </h2>
          <div className="space-y-3">
            {topCompanies.map((company) => (
              <div key={company.name} className="flex items-center justify-between p-3 bg-[#1A2236] border border-[#1F2937] rounded-xl hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                    {company.logo}
                  </div>
                  <span className="text-sm font-medium text-white">{company.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#10B981] font-bold">{company.roles} roles</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-600 group-hover:text-[#10B981] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Emerging & Declining Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-6">
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
                      content: `${skill} is identified as an emerging skill in the current market for ${locked_pathway?.title || active_pathway}.`,
                      link: '/trends'
                    })}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all mr-1"
                    title="Send to Notes"
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

        <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h2 className="text-white font-semibold">Declining Skills</h2>
          </div>
          <div className="space-y-4">
            {market_trends.decliningSkills.map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#1A2236] border border-[#1F2937] rounded-2xl group">
                <span className="text-gray-400 text-sm">{skill}</span>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter bg-red-400/10 px-2 py-0.5 rounded">Declining</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}