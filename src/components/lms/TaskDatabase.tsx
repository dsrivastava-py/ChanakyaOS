"use client";

import { useUserStore, WorkspaceTask, WorkspaceColumn } from "@/store/useUserStore";
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  createColumnHelper 
} from "@tanstack/react-table";
import { Plus, Tag, Calendar as CalendarIcon, Type, X, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskDatabaseProps {
  onEditTask: (task: Partial<WorkspaceTask> | null) => void;
}

export default function TaskDatabase({ onEditTask }: TaskDatabaseProps) {
  const { workspace, addTask, updateTask, addColumn, deleteTask } = useUserStore();
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [newColumn, setNewColumn] = useState({ header: "", type: "text" as WorkspaceColumn["type"] });

  const columnHelper = createColumnHelper<WorkspaceTask>();

  const columns = [
    ...workspace.customColumns.map(col => 
      columnHelper.accessor(col.id as any, {
        header: col.header,
        cell: (info: any) => {
          const value = info.getValue();
          const taskId = info.row.original.id;

          if (col.type === 'tag') {
            const rawValue = info.getValue();
            const tagsArray = Array.isArray(rawValue) ? rawValue : (typeof rawValue === 'string' ? [rawValue] : []);
            return (
              <div className="flex flex-wrap gap-1">
                {tagsArray.map((tag: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] text-accent font-bold uppercase">
                    {tag}
                  </span>
                ))}
                <button className="p-1 rounded-md hover:bg-white/5 text-gray-500">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            );
          }

          if (col.type === 'date') {
            return (
              <input 
                type="date"
                value={value ? format(new Date(value), 'yyyy-MM-dd') : ''}
                onChange={e => updateTask(taskId, { [col.id]: e.target.value })}
                className="bg-transparent border-none focus:ring-0 text-gray-300 text-sm w-full outline-none"
              />
            );
          }

          if (col.type === 'checkbox') {
            return (
              <input 
                type="checkbox"
                checked={!!value}
                onChange={e => updateTask(taskId, { [col.id]: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-black/20 text-accent focus:ring-accent"
              />
            );
          }

          return (
            <input 
              defaultValue={value as string || ""}
              onBlur={e => updateTask(taskId, { [col.id]: e.target.value })}
              className="bg-transparent border-none focus:ring-0 text-gray-300 text-sm w-full outline-none placeholder:text-gray-700"
              placeholder="..."
            />
          );
        }
      })
    ),
    columnHelper.display({
      id: 'actions',
      cell: (info: any) => (
        <button 
          onClick={() => deleteTask(info.row.original.id)}
          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
      header: () => (
        <button 
          onClick={() => setIsColumnModalOpen(true)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-accent transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      )
    })
  ];

  const table = useReactTable({
    data: workspace.tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleAddColumn = () => {
    if (!newColumn.header) return;
    addColumn({
      id: newColumn.header.toLowerCase().replace(/\s+/g, '_'),
      header: newColumn.header,
      type: newColumn.type
    });
    setIsColumnModalOpen(false);
    setNewColumn({ header: "", type: "text" });
  };

  // Grouping Logic
  const groupedTasks: Record<string, WorkspaceTask[]> = {};
  workspace.tasks.forEach(task => {
    const mainTag = task.tags?.[0] || 'Uncategorized';
    if (!groupedTasks[mainTag]) groupedTasks[mainTag] = [];
    groupedTasks[mainTag].push(task);
  });

  return (
    <div className="space-y-4">
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup: any) => (
                <tr key={headerGroup.id} className="border-b border-white/5">
                  {headerGroup.headers.map((header: any) => (
                    <th key={header.id} className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/2 space-x-2">
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                <React.Fragment key={groupName}>
                  <tr className="bg-white/[0.03]">
                    <td colSpan={columns.length} className="px-6 py-2 text-[10px] font-bold text-accent uppercase tracking-widest border-y border-white/5">
                      {groupName}
                    </td>
                  </tr>
                  {groupTasks.map((task) => {
                    // Manually finding the row for this task to use React Table's visible cells
                    const row = table.getRowModel().rows.find(r => r.original.id === task.id);
                    if (!row) return null;
                    return (
                      <tr 
                        key={row.id} 
                        onClick={() => onEditTask(row.original)}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors group cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell: any) => (
                          <td key={cell.id} className="px-6 py-3 min-w-[150px]">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        <button 
          onClick={() => onEditTask(null)}
          className="w-full py-4 text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 border-t border-white/5"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Add Column Modal */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-accent/20 rounded-3xl p-8 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Add Column</h3>
              <button onClick={() => setIsColumnModalOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Column Name</label>
                <input 
                  autoFocus
                  value={newColumn.header}
                  onChange={e => setNewColumn({ ...newColumn, header: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent outline-none transition-all"
                  placeholder="e.g. Priority, Est. Hours"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">Column Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'text', icon: Type, label: 'Text' },
                    { type: 'tag', icon: Tag, label: 'Tags' },
                    { type: 'date', icon: CalendarIcon, label: 'Date' },
                    { type: 'checkbox', icon: CheckCircle2, label: 'Checkbox' }
                  ].map(item => (
                    <button 
                      key={item.type}
                      onClick={() => setNewColumn({ ...newColumn, type: item.type as any })}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border transition-all",
                        newColumn.type === item.type 
                          ? "bg-accent/10 border-accent/40 text-accent" 
                          : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAddColumn}
                className="w-full py-4 rounded-xl bg-accent text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Create Column
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CheckCircle2 = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
