"use client";

import { useEffect, useState } from "react";
import { Block } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import dynamic from "next/dynamic";
import { useUserStore } from "@/store/useUserStore";
import { Sparkles, Plus } from "lucide-react";

// Use dynamic with the suggested BlockNoteViewRaw fallback if BlockNoteView is missing
const BlockNoteView = dynamic<any>(
  () => import("@blocknote/react").then((mod: any) => mod.BlockNoteView || mod.BlockNoteViewRaw),
  {
    ssr: false,
    loading: () => <div className="h-[600px] bg-white/5 rounded-3xl animate-pulse" />
  }
);

interface WorkspaceEditorProps {
  locked_pathway: any;
  lms_tasks: Block[];
  setLmsTasks: (tasks: Block[]) => Promise<void>;
}

export default function WorkspaceEditor({ locked_pathway, lms_tasks, setLmsTasks }: WorkspaceEditorProps) {
  const { lms_data } = useUserStore();
  const editor = useCreateBlockNote();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (editor && locked_pathway && mounted) {
      // Only set initial content once or when locked_pathway changes significantly
      const isEditorEmpty = editor.document.length === 1 && 
        (editor.document[0].content as any).length === 0;

      if (isEditorEmpty) {
        if (lms_tasks && lms_tasks.length > 0) {
          editor.replaceBlocks(editor.document, lms_tasks);
        } else if (locked_pathway?.skillChecklist) {
          const initialBlocks: Block[] = [
            {
              id: crypto.randomUUID(),
              type: "heading" as const,
              props: { level: 1, textColor: "default" as const, backgroundColor: "default" as const, textAlignment: "left" as const },
              content: [{ type: "text" as const, text: "My Career Strategic Workspace", styles: {} }],
              children: [],
            },
            {
              id: crypto.randomUUID(),
              type: "paragraph" as const,
              props: { textColor: "default" as const, backgroundColor: "default" as const, textAlignment: "left" as const },
              content: [{ type: "text" as const, text: `This workspace is auto-synced with your ${locked_pathway.title} pathway.`, styles: {} }],
              children: [],
            },
            {
              id: crypto.randomUUID(),
              type: "heading" as const,
              props: { level: 2, textColor: "default" as const, backgroundColor: "default" as const, textAlignment: "left" as const },
              content: [{ type: "text" as const, text: "Active Skill Checklist", styles: {} }],
              children: [],
            },
            ...locked_pathway.skillChecklist.map((item: any) => ({
              id: crypto.randomUUID(),
              type: "checkListItem" as const,
              props: { checked: item.status === "acquired", textColor: "default" as const, backgroundColor: "default" as const, textAlignment: "left" as const },
              content: [{ type: "text" as const, text: item.skill, styles: {} }],
              children: [],
            })),
            {
              id: crypto.randomUUID(),
              type: "heading" as const,
              props: { level: 2, textColor: "default" as const, backgroundColor: "default" as const, textAlignment: "left" as const },
              content: [{ type: "text" as const, text: "Strategic Projects", styles: {} }],
              children: [],
            },
            ...locked_pathway.projects.map((proj: any) => ({
              id: crypto.randomUUID(),
              type: "paragraph" as const,
              props: { textColor: "default" as const, backgroundColor: "default" as const, textAlignment: "left" as const },
              content: [{ type: "text" as const, text: `Project Idea: ${proj.title} - ${proj.description}`, styles: {} }],
              children: [],
            })),
          ];
          editor.replaceBlocks(editor.document, initialBlocks);
          setLmsTasks(initialBlocks);
        }
      }
    }
  }, [editor, locked_pathway, mounted]);

  const insertSnippet = (snippet: { title: string, content: string, link: string }) => {
    if (!editor) return;
    
    const blocks: any[] = [
      {
        type: "heading",
        props: { level: 3 },
        content: [{ type: "text", text: snippet.title, styles: { bold: true } }]
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: snippet.content, styles: {} }]
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: `Source: ${snippet.link}`, styles: { italic: true } }]
      }
    ];

    editor.insertBlocks(blocks, editor.getTextCursorPosition().block, "after");
  };

  return (
    <div className="flex gap-6 w-full h-full">
      <div className="flex-1 bg-[#111827]/50 backdrop-blur-xl border border-[#1F2937] rounded-3xl p-8 min-h-[600px] shadow-2xl text-left">
        {mounted && (
          <BlockNoteView 
            editor={editor} 
            theme="dark"
            onChange={() => {
              if (editor) {
                setLmsTasks(editor.document);
              }
            }}
          />
        )}
      </div>

      {/* Snippets Sidebar */}
      <div className="w-80 flex flex-col gap-4">
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 h-full overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Saved Snippets</h3>
          </div>

          <div className="space-y-4">
            {(!lms_data.lms_snippets || lms_data.lms_snippets.length === 0) ? (
              <p className="text-[10px] text-gray-500 text-center py-8">No snippets saved yet. Pin insights from Market Trends.</p>
            ) : (
              lms_data.lms_snippets.map((snippet: any, i: number) => (
                <button 
                  key={i}
                  onClick={() => insertSnippet(snippet)}
                  className="w-full text-left p-4 bg-white/2 border border-white/5 rounded-2xl hover:border-accent/30 hover:bg-white/[0.04] transition-all group"
                >
                  <h4 className="text-xs font-bold text-white group-hover:text-accent transition-colors mb-1 line-clamp-1">{snippet.title}</h4>
                  <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{snippet.content}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
