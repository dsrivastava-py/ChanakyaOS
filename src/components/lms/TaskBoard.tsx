"use client";

import { useUserStore, WorkspaceTask } from "@/store/useUserStore";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Calendar, Tag, MoreHorizontal, Plus, Clock } from "lucide-react";
import { format } from "date-fns";

const COLUMNS = ["To Do", "In Progress", "Done"] as const;

interface TaskBoardProps {
  onEditTask: (task: Partial<WorkspaceTask> | null) => void;
}

export default function TaskBoard({ onEditTask }: TaskBoardProps) {
  const { workspace, updateTask, addTask } = useUserStore();

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as WorkspaceTask['status'];
    
    updateTask(draggableId, { status: newStatus });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px]">
        {COLUMNS.map(columnId => {
          const tasks = workspace.tasks.filter(t => t.status === columnId);
          
          return (
            <div key={columnId} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">{columnId}</h3>
                  <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{tasks.length}</span>
                </div>
                <button 
                  onClick={() => onEditTask({ status: columnId as any })}
                  className="p-1 rounded-md hover:bg-white/5 text-gray-500 hover:text-accent transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Droppable droppableId={columnId}>
                {(provided: any, snapshot: any) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 flex flex-col gap-3 p-2 rounded-3xl transition-colors ${snapshot.isDraggingOver ? 'bg-white/2' : 'bg-transparent'}`}
                  >
                    {tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided: any, snapshot: any) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onEditTask(task)}
                            className={`group bg-[#111827] border border-white/5 rounded-2xl p-5 shadow-lg hover:border-accent/20 transition-all ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl z-50 border-accent/40' : 'cursor-pointer hover:bg-white/[0.02]'}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="text-sm font-bold text-white group-hover:text-accent transition-colors leading-tight">
                                {task.title}
                              </h4>
                              <button className="text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>

                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {task.tags.map((tag, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-full bg-accent/5 border border-accent/10 text-[9px] text-accent/80 font-bold uppercase tracking-tighter">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                              {task.dueDate ? (
                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
                                  <Calendar className="w-3 h-3 text-accent/60" />
                                  {format(new Date(task.dueDate), 'MMM dd')}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-700">
                                  <Clock className="w-3 h-3" />
                                  No deadline
                                </div>
                              )}
                              
                              <div className="flex -space-x-2">
                                <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-[8px] font-bold text-accent">AI</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
