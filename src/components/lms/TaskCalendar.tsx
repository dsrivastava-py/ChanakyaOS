"use client";

import { useUserStore } from "@/store/useUserStore";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";
import { WorkspaceTask } from "@/store/useUserStore";

interface TaskCalendarProps {
  onEditTask: (task: Partial<WorkspaceTask> | null) => void;
}

export default function TaskCalendar({ onEditTask }: TaskCalendarProps) {
  const { workspace, addTask } = useUserStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-accent/10 text-accent">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-xl bg-white/5 text-xs font-bold text-gray-400 hover:text-white transition-all"
          >
            Today
          </button>
          <button 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 border-b border-white/5 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1 min-h-[500px]">
        {days.map((day: Date, idx: number) => {
          const dayTasks = workspace.tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={idx} 
              className={`min-h-[120px] border-[0.5px] border-white/5 p-2 flex flex-col gap-1.5 transition-all group hover:bg-white/2 cursor-pointer ${!isCurrentMonth ? 'opacity-20' : ''}`}
              onClick={() => onEditTask({ dueDate: format(day, 'yyyy-MM-dd') })}
            >
              <div className="flex justify-between items-center px-1 mb-1">
                <span className={`text-xs font-bold ${isToday ? 'text-accent bg-accent/20 w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-500'}`}>
                  {format(day, 'd')}
                </span>
                <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-accent/10 text-accent transition-all">
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                {dayTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTask(task);
                    }}
                    className="px-2 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-[9px] font-bold text-accent truncate flex items-center gap-1.5 hover:bg-accent/20 transition-all"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'Done' ? 'bg-green-500' : 'bg-accent'}`} />
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
