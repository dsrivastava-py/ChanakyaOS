import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { Block } from "@blocknote/core";
import { debounce } from '@/utils/debounce';

export interface Pathway {
  title: string;
  readinessScore: number;
  reasoning: string;
  timeline: string;
  salary: string;
  requirements: { name: string; provider: string; type: string; reason: string; completed?: boolean }[];
  skillChecklist: { skill: string; status: "missing" | "acquired" }[];
  projects: { title: string; description: string; techStack: string[]; completed?: boolean }[];
}

interface LmsData {
  stages: { name: string; completed: boolean; locked: boolean }[];
  active_certs: string[];
  active_projects: string[];
  mastered_skills: string[];
  curriculum_tracker: Record<string, any>;
  lms_snippets: { title: string; content: string; link: string }[];
}

export interface WorkspaceTask {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate?: string;
  tags?: string[];
  [key: string]: any;
}

export interface WorkspaceColumn {
  id: string;
  header: string;
  type: 'text' | 'tag' | 'date' | 'checkbox';
}

export interface Workspace {
  tasks: WorkspaceTask[];
  customColumns: WorkspaceColumn[];
}

interface UserState {
  session: Session | null;
  user_id: string | null;
  career_readiness_score: number;
  active_pathway: string;
  locked_pathway: Pathway | null;
  completed_stages: string[];
  linkedin_health_score: number;
  pinned_trends: { title: string; [key: string]: unknown }[];
  lms_tasks: Block[];
  lms_data: LmsData;
  workspace: Workspace;
  market_trends: {
    salaryBenchmark: number;
    emergingSkills: string[];
    decliningSkills: string[];
  };
  isHydrated: boolean;
  isEditProfileModalOpen: boolean;
  hasUnsavedChanges: boolean;
  profile: { name: string } | null;
  updateProfile: (profile: { name: string }) => void;
  
  // Actions
  setSession: (session: Session | null) => void;
  setCareerReadinessScore: (score: number) => void;
  setActivePathway: (pathway: string) => void;
  setLockedPathway: (pathway: Pathway | null) => void;
  setCompletedStages: (stages: string[]) => void;
  completeStage: (stage: string) => void;
  setHydrated: (status: boolean) => void;
  setEditProfileModalOpen: (open: boolean) => void;
  clearUnsavedChanges: () => void;
  
  // Persistent Actions
  pinTrend: (trend: { title: string; [key: string]: unknown }) => Promise<void>;
  unpinTrend: (title: string) => Promise<void>;
  setLmsTasks: (tasks: Block[]) => Promise<void>;
  updateLmsData: (data: Partial<LmsData>) => Promise<void>;
  updateReadinessScore: () => Promise<void>;
  hydrateStore: () => Promise<void>;
  hydrateWorkspace: (dbData: any) => void;
  toggleProjectCompletion: (projectTitle: string) => Promise<void>;
  toggleCertCompletion: (certName: string) => Promise<void>;

  // Sync Engine

  // Workspace Actions
  addTask: (task: Partial<WorkspaceTask>) => Promise<void>;
  updateTask: (id: string, updates: Partial<WorkspaceTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addColumn: (column: WorkspaceColumn) => Promise<void>;
  updateColumn: (id: string, updates: Partial<WorkspaceColumn>) => Promise<void>;
  syncWorkspace: (newWorkspace: Workspace) => Promise<void>;
  saveSnippetToNotes: (snippet: { title: string; content: string; link: string }) => Promise<void>;
  lockPathway: (pathway: Pathway) => void;
}


export const useUserStore = create<UserState>((set, get) => ({
  session: null,
  user_id: null,
  career_readiness_score: 0,
  active_pathway: "Data Analytics",
  locked_pathway: null,
  completed_stages: ["Foundation"],
  linkedin_health_score: 55,
  pinned_trends: [],
  lms_tasks: [],
  lms_data: {
    stages: [
      { name: "Foundation", completed: false, locked: false },
      { name: "Projects", completed: false, locked: true },
      { name: "Certifications", completed: false, locked: true },
      { name: "Market Ready", completed: false, locked: true },
    ],
    active_certs: [],
    active_projects: [],
    mastered_skills: [],
    curriculum_tracker: {},
    lms_snippets: [],
  },
  workspace: {
    tasks: [],
    customColumns: [
      { id: "title", header: "Title", type: "text" },
      { id: "status", header: "Status", type: "tag" },
      { id: "dueDate", header: "Due Date", type: "date" },
    ],
  },
  market_trends: {
    salaryBenchmark: 750000,
    emergingSkills: ["AI Ethics", "Predictive Analytics", "Cloud Data Warehouses"],
    decliningSkills: ["Manual Data Entry", "Basic Excel", "Legacy On-Prem Systems"],
  },
  isHydrated: false,
  isEditProfileModalOpen: false,
  hasUnsavedChanges: false,
  profile: null,
  
  setSession: (session) => set({ session, user_id: session?.user?.id || null }),
  setCareerReadinessScore: (score) => set({ career_readiness_score: score, hasUnsavedChanges: true }),
  setActivePathway: (pathway) => set({ active_pathway: pathway, hasUnsavedChanges: true }),
  setLockedPathway: (pathway) => set({ locked_pathway: pathway, hasUnsavedChanges: true }),
  setCompletedStages: (stages) => set({ completed_stages: stages, hasUnsavedChanges: true }),
  completeStage: (stage) => set((state) => ({ 
    completed_stages: [...state.completed_stages, stage],
    hasUnsavedChanges: true 
  })),
  setHydrated: (status) => set({ isHydrated: status }),
  setEditProfileModalOpen: (open) => set({ isEditProfileModalOpen: open }),
  clearUnsavedChanges: () => set({ hasUnsavedChanges: false }),
  updateProfile: (profile) => set({ profile, hasUnsavedChanges: true }),

  hydrateWorkspace: (dbData) => set({ workspace: dbData, isHydrated: true, hasUnsavedChanges: false }),
  lockPathway: (pathway) => set({ locked_pathway: pathway, hasUnsavedChanges: true }),

  saveSnippetToNotes: async (snippet) => {
    const { lms_data } = get();
    const newSnippets = [...(lms_data.lms_snippets || []), snippet];
    set({ lms_data: { ...lms_data, lms_snippets: newSnippets }, hasUnsavedChanges: true });
  },

  pinTrend: async (trend) => {
    const { pinned_trends } = get();
    set({ pinned_trends: [...pinned_trends, trend], hasUnsavedChanges: true });
  },

  unpinTrend: async (title) => {
    const { pinned_trends } = get();
    set({ pinned_trends: pinned_trends.filter(t => t.title !== title), hasUnsavedChanges: true });
  },

  setLmsTasks: async (tasks) => {
    set({ lms_tasks: tasks, hasUnsavedChanges: true });
    await get().updateReadinessScore();
  },

  updateLmsData: async (data) => {
    const { lms_data } = get();
    set({ lms_data: { ...lms_data, ...data }, hasUnsavedChanges: true });
    await get().updateReadinessScore();
  },

  updateReadinessScore: async () => {
    const { locked_pathway, lms_data } = get();
    if (!locked_pathway) return;

    const baseAiScore = locked_pathway.readinessScore || 0;
    const masteredSkillsCount = locked_pathway.skillChecklist.filter(s => s.status === 'acquired').length;
    const completedCertsCount = locked_pathway.requirements.filter(r => r.completed).length;
    const completedProjectsCount = locked_pathway.projects.filter(p => p.completed).length;

    const newScore = Math.min(100, baseAiScore + (masteredSkillsCount * 2) + (completedCertsCount * 5) + (completedProjectsCount * 8));
    
    const updatedStages = [...lms_data.stages];
    updatedStages[0].completed = masteredSkillsCount >= 3;
    updatedStages[1].locked = !updatedStages[0].completed;
    updatedStages[1].completed = completedProjectsCount >= 1;
    updatedStages[2].locked = !updatedStages[1].completed;
    updatedStages[2].completed = completedCertsCount >= 1;
    updatedStages[3].locked = !updatedStages[2].completed;
    updatedStages[3].completed = newScore >= 90;

    set({ 
      career_readiness_score: newScore,
      lms_data: { ...lms_data, stages: updatedStages },
      hasUnsavedChanges: true
    });
  },

  toggleProjectCompletion: async (projectTitle) => {
    const { locked_pathway, addTask } = get();
    if (!locked_pathway) return;

    const updatedProjects = locked_pathway.projects.map(p => 
      p.title === projectTitle ? { ...p, completed: !p.completed } : p
    );

    const project = locked_pathway.projects.find(p => p.title === projectTitle);
    if (project && !project.completed) {
      await addTask({
        title: `Deliverable: ${projectTitle}`,
        status: 'To Do',
        tags: ['Project', ...project.techStack],
      });
    }

    const updatedPathway = { ...locked_pathway, projects: updatedProjects };
    set({ locked_pathway: updatedPathway, hasUnsavedChanges: true });
    await get().updateReadinessScore();
  },

  toggleCertCompletion: async (certName) => {
    const { locked_pathway, addTask } = get();
    if (!locked_pathway) return;

    const updatedCerts = locked_pathway.requirements.map(r => 
      r.name === certName ? { ...r, completed: !r.completed } : r
    );

    const cert = locked_pathway.requirements.find(r => r.name === certName);
    if (cert && !cert.completed) {
      await addTask({
        title: `Get Certified: ${certName}`,
        status: 'To Do',
        tags: ['Certification', cert.provider],
      });
    }

    const updatedPathway = { ...locked_pathway, requirements: updatedCerts };
    set({ locked_pathway: updatedPathway, hasUnsavedChanges: true });
    await get().updateReadinessScore();
  },

  addTask: async (task) => {
    const { workspace, syncWorkspace } = get();
    const newTask: WorkspaceTask = {
      id: crypto.randomUUID(),
      title: task.title || 'New Task',
      status: task.status || 'To Do',
      ...task
    };
    await syncWorkspace({ ...workspace, tasks: [...workspace.tasks, newTask] });
  },

  updateTask: async (id, updates) => {
    const { workspace, syncWorkspace } = get();
    const newTasks = workspace.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    await syncWorkspace({ ...workspace, tasks: newTasks });
  },

  deleteTask: async (id) => {
    const { workspace, syncWorkspace } = get();
    const newTasks = workspace.tasks.filter(t => t.id !== id);
    await syncWorkspace({ ...workspace, tasks: newTasks });
  },

  addColumn: async (column) => {
    const { workspace, syncWorkspace } = get();
    await syncWorkspace({ ...workspace, customColumns: [...workspace.customColumns, column] });
  },

  updateColumn: async (id, updates) => {
    const { workspace, syncWorkspace } = get();
    const newColumns = workspace.customColumns.map(c => c.id === id ? { ...c, ...updates } : c);
    await syncWorkspace({ ...workspace, customColumns: newColumns });
  },

  syncWorkspace: async (newWorkspace) => {
    set({ workspace: newWorkspace, hasUnsavedChanges: true });
  },

  hydrateStore: async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const user_id = session.user.id;
      set({ session, user_id });

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user_id)
        .maybeSingle();

      if (profile) {
        set({
          pinned_trends: profile.pinned_trends || [],
          lms_tasks: profile.lms_tasks || [],
          lms_data: profile.lms_data || get().lms_data,
          workspace: profile.lms_workspace || get().workspace,
          career_readiness_score: profile.career_readiness_score || 0,
          linkedin_health_score: profile.linkedin_health_score || 55,
          profile: { name: profile.name || "" },
          hasUnsavedChanges: false
        });
      }

      const { data: pathway } = await supabase
        .from('career_pathways')
        .select('*')
        .eq('user_id', user_id)
        .eq('status', 'locked')
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pathway) {
        set({ locked_pathway: pathway.pathway_data as Pathway });
        await get().updateReadinessScore();
      }

      set({ isHydrated: true });
    }
  }
}));
