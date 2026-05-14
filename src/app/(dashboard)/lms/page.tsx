"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useUserStore, WorkspaceTask } from "@/store/useUserStore";
import {
  Clock,
  Layout,
  Sparkles,
  BookOpen,
  Calendar,
  Columns,
  Database,
  FileText,
  Loader2,
  LineChart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Dynamic imports
const WorkspaceEditor = dynamic(() => import("@/components/lms/WorkspaceEditor"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-white/2 rounded-3xl animate-pulse" />
});

const TaskDatabase = dynamic(() => import("@/components/lms/TaskDatabase"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-white/2 rounded-3xl animate-pulse" />
});

const TaskBoard = dynamic(() => import("@/components/lms/TaskBoard"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-white/2 rounded-3xl animate-pulse" />
});

const TaskCalendar = dynamic(() => import("@/components/lms/TaskCalendar"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-white/2 rounded-3xl animate-pulse" />
});

const TaskProgressDashboard = dynamic(() => import("@/components/lms/TaskProgressDashboard"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-white/2 rounded-3xl animate-pulse" />
});

const TaskModal = dynamic(() => import("@/components/lms/TaskModal"), {
  ssr: false
});

type TabType = 'notes' | 'board' | 'calendar' | 'tasks' | 'tracker';

export default function LMSPage() {
  const { locked_pathway, lms_data, updateLmsData, lms_tasks, setLmsTasks, workspace } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>('tasks');

  // Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Partial<WorkspaceTask> | null>(null);

  const openTaskModal = (task: Partial<WorkspaceTask> | null = null) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const tabs = [
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'board', label: 'Board', icon: Columns },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: Database },
    { id: 'tracker', label: 'Tracker', icon: LineChart },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-accent text-sm font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-4 h-4" />
            Strategic Workspace
          </div>
          <h1 className="text-4xl font-display font-semibold text-white tracking-tight">Mission Control LMS</h1>
        </div>

        <nav className="flex items-center p-1.5 bg-[#111827]/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative",
                activeTab === tab.id
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-accent rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className={cn("w-4 h-4 relative z-10", activeTab === tab.id ? "text-black" : "text-gray-500")} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="min-h-[700px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'notes' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3">
                  <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl sticky top-24">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 px-2">Path Selection</h3>
                    <div className="space-y-2">
                      {locked_pathway ? (
                        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20">
                          <h4 className="text-sm font-bold text-white mb-1">{locked_pathway.title}</h4>
                          <p className="text-[10px] text-accent font-bold uppercase tracking-tighter">Active Pathway</p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-gray-500 text-xs italic">
                          No pathway locked
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5">
                      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Stage Checklist</h3>
                      <div className="space-y-3">
                        {lms_data.stages.map((stage, i) => (
                          <div key={i} className={cn("flex items-center gap-3 px-2 transition-opacity", stage.locked ? "opacity-30" : "opacity-100")}>
                            <div className={cn("w-2 h-2 rounded-full", stage.completed ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-gray-700")} />
                            <span className="text-xs text-gray-400 font-medium">{stage.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-9">
                  {locked_pathway ? (
                    <WorkspaceEditor
                      locked_pathway={locked_pathway}
                      lms_tasks={lms_tasks}
                      setLmsTasks={setLmsTasks}
                    />
                  ) : (
                    <div className="h-[600px] flex flex-col items-center justify-center bg-[#111827]/50 border border-white/5 rounded-[40px] text-center p-12">
                      <FileText className="w-16 h-16 text-gray-800 mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-2">Editor Offline</h3>
                      <p className="text-gray-500 max-w-sm">Lock a strategic career pathway in the dashboard to initialize your workspace document.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tasks' && <TaskDatabase onEditTask={openTaskModal} />}
            {activeTab === 'board' && <TaskBoard onEditTask={openTaskModal} />}
            {activeTab === 'calendar' && <TaskCalendar onEditTask={openTaskModal} />}
            {activeTab === 'tracker' && <TaskProgressDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}
