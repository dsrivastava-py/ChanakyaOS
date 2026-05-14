"use client";

import { useState, useEffect } from "react";
import { useUserStore, WorkspaceTask } from "@/store/useUserStore";
import { X, Calendar, Tag, CheckCircle2, Trash2, Clock, AlignLeft } from "lucide-react";
import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskModalProps {
  task: Partial<WorkspaceTask> | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  const { updateTask, addTask, deleteTask } = useUserStore();
  const [editedTask, setEditedTask] = useState<Partial<WorkspaceTask>>({});

  useEffect(() => {
    if (task) {
      setEditedTask(task);
    } else {
      setEditedTask({
        title: "",
        status: "To Do",
        description: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
        tags: [],
      });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (editedTask.id) {
      await updateTask(editedTask.id, editedTask);
    } else {
      await addTask(editedTask);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (editedTask.id) {
      await deleteTask(editedTask.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md">
      <div 
        className="bg-[#0B0F19] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_32px_64px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-2 h-2 rounded-full",
              editedTask.status === 'Done' ? 'bg-green-500' : 
              editedTask.status === 'In Progress' ? 'bg-accent' : 'bg-gray-600'
            )} />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Task Detail
            </span>
          </div>
          <div className="flex items-center gap-2">
            {editedTask.id && (
              <button 
                onClick={handleDelete}
                className="p-2 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Title */}
          <input 
            value={editedTask.title || ""}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            placeholder="Untitled Task"
            className="w-full bg-transparent border-none text-4xl font-bold text-white placeholder:text-white/10 focus:ring-0 outline-none p-0"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Status */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" /> Status
              </label>
              <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl gap-1">
                {['To Do', 'In Progress', 'Done'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setEditedTask({ ...editedTask, status: status as any })}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all",
                      editedTask.status === status 
                        ? "bg-accent text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <Calendar className="w-3 h-3" /> Due Date
              </label>
              <input 
                type="date"
                value={editedTask.dueDate || ""}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-accent outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <Tag className="w-3 h-3" /> Tags
            </label>
            <div className="flex flex-wrap gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl min-h-[60px]">
              {editedTask.tags?.map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-slate-800 border border-accent/20 text-[10px] text-accent font-bold uppercase flex items-center gap-2 group">
                  {tag}
                  <button 
                    onClick={() => setEditedTask({
                      ...editedTask,
                      tags: editedTask.tags?.filter(t => t !== tag)
                    })}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input 
                placeholder="Type and press Enter..."
                className="bg-transparent border-none text-xs text-white focus:ring-0 outline-none flex-1 min-w-[120px] placeholder:text-gray-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim().replace(/,$/, '');
                    if (val && !editedTask.tags?.includes(val)) {
                      setEditedTask({
                        ...editedTask,
                        tags: [...(editedTask.tags || []), val]
                      });
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <AlignLeft className="w-3 h-3" /> Description
            </label>
            <textarea 
              value={editedTask.description || ""}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-gray-300 min-h-[150px] focus:border-accent outline-none resize-none transition-all placeholder:text-gray-700"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-white/[0.02]">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-white/5 text-sm font-bold text-gray-400 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-3 rounded-xl bg-accent text-sm font-bold text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
