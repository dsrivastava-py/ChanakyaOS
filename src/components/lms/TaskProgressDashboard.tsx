"use client";

import { useUserStore } from "@/store/useUserStore";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, CartesianGrid
} from "recharts";
import { Clock, CheckCircle2, Calendar, TrendingUp } from "lucide-react";
import { format, differenceInDays, isBefore, addDays, parseISO, startOfDay } from "date-fns";

export default function TaskProgressDashboard() {
  const { workspace } = useUserStore();
  const tasks = workspace.tasks;

  // 1. Precise Metric Calculations
  const now = startOfDay(new Date());
  const nextWeek = addDays(now, 7);

  const upcomingDeadlines = tasks.filter(t => {
    if (!t.dueDate || t.status === 'Done') return false;
    const parsedDate = parseISO(t.dueDate);
    return isBefore(parsedDate, nextWeek) && !isBefore(parsedDate, now);
  }).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. Chart Data Generation
  const statusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'To Do').length, color: '#4B5563' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#D4AF37' },
    { name: 'Done', value: tasks.filter(t => t.status === 'Done').length, color: '#10B981' },
  ].filter(d => d.value > 0);

  const tagCounts: Record<string, number> = {};
  tasks.forEach(t => {
    t.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const tagData = Object.entries(tagCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // 3. Workload Data (Next 14 Days)
  const workloadData = Array.from({ length: 14 }).map((_, i) => {
    const day = addDays(now, i);
    const dayStr = format(day, 'yyyy-MM-dd');
    const count = tasks.filter(t => t.dueDate === dayStr).length;
    return {
      date: format(day, 'MMM dd'),
      tasks: count
    };
  });

  const chartTooltipStyle = {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    fontSize: '12px'
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827]/80 border border-white/5 p-6 rounded-[32px] flex items-center gap-5 group hover:border-accent/20 transition-all">
          <div className="p-4 rounded-2xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Upcoming Deadlines</p>
            <h3 className="text-2xl font-bold text-white">{upcomingDeadlines} <span className="text-xs text-gray-500 font-normal">due this week</span></h3>
          </div>
        </div>

        <div className="bg-[#111827]/80 border border-white/5 p-6 rounded-[32px] flex items-center gap-5 group hover:border-green-500/20 transition-all">
          <div className="p-4 rounded-2xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Completion Rate</p>
            <h3 className="text-2xl font-bold text-white">{completionRate}% <span className="text-xs text-gray-500 font-normal">overall</span></h3>
          </div>
        </div>

        <div className="bg-[#111827]/80 border border-white/5 p-6 rounded-[32px] flex items-center gap-5 group hover:border-blue-500/20 transition-all">
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Tasks</p>
            <h3 className="text-2xl font-bold text-white">{totalTasks} <span className="text-xs text-gray-500 font-normal">active</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-[#111827]/80 border border-white/5 p-8 rounded-[40px]">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" /> Task Status
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: '#fff' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tag Distribution */}
        <div className="bg-[#111827]/80 border border-white/5 p-8 rounded-[40px]">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" /> Top Tags
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={chartTooltipStyle}
                />
                <Bar dataKey="value" fill="#D4AF37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Line Chart: Upcoming Workload */}
      <div className="bg-[#111827]/80 border border-white/5 p-8 rounded-[40px]">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" /> Upcoming Workload (Next 14 Days)
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={workloadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line 
                type="monotone" 
                dataKey="tasks" 
                stroke="#D4AF37" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#0F172A', stroke: '#D4AF37', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#D4AF37' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
