"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Sparkles, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { locked_pathway, career_readiness_score, pinned_trends } = useUserStore();

  // Initialize with a welcome message
  useEffect(() => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: `I am Chanakya. Your profile is ${career_readiness_score}% ready for ${locked_pathway?.title || "your target role"}. State your objective.`
    }]);
  }, [career_readiness_score, locked_pathway]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const contextFallback = "User is a new user with no locked pathways or generated profiles yet. Guide them to complete onboarding.";
      const hasContext = locked_pathway || pinned_trends.length > 0;
      const userContext = hasContext ? {
        locked_pathway,
        career_readiness_score,
        pinned_trends
      } : { fallback: contextFallback };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          userContext
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Read the streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again. If the issue persists, try refreshing the page."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [locked_pathway, career_readiness_score, pinned_trends, messages, isLoading]);

  const [showMentions, setShowMentions] = useState(false);
  const mentionOptions = ['pathways', 'resume', 'trends', 'dashboard', 'market_trends'];
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    
    const cursor = e.target.selectionStart;
    const lastAt = val.lastIndexOf('@', cursor - 1);
    
    if (lastAt !== -1 && (lastAt === 0 || val[lastAt - 1] === ' ' || val[lastAt - 1] === '\n')) {
      const textAfterAt = val.substring(lastAt + 1, cursor);
      if (!textAfterAt.includes(' ')) {
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (mention: string) => {
    const cursor = textAreaRef.current?.selectionStart || 0;
    const lastAt = input.lastIndexOf('@', cursor - 1);
    const newVal = input.slice(0, lastAt) + '@' + mention + ' ' + input.slice(cursor);
    setInput(newVal);
    setShowMentions(false);
    textAreaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full max-w-5xl mx-auto bg-background relative border-x border-[#1F2937]/50 shadow-2xl">
      {/* Header */}
      <header className="flex-shrink-0 py-4 px-6 border-b border-[#1F2937] bg-[#111827]/90 backdrop-blur-md z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#1A2236] border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Sparkles className="w-5 h-5 text-accent" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#111827]"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold font-display text-white leading-tight">Your Chanakya</h1>
            <p className="text-xs text-gray-400 font-medium">Strategic Career Operating System</p>
          </div>
        </div>
      </header>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8 custom-scrollbar scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-3 md:gap-4 max-w-[90%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

              {/* Avatar */}
              <div className="flex-shrink-0 mt-1">
                {msg.role === "assistant" ? (
                   <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1A2236] border border-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.2)]">
                     <Sparkles className="w-4 h-4 text-accent" />
                   </div>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1F2937] border border-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-5 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#D4AF37]/[0.08] text-white rounded-tr-sm border border-[#D4AF37]/20"
                      : "bg-[#111827] text-gray-200 border border-[#1F2937] rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>

            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#111827] border border-[#1F2937] px-4 py-2 rounded-xl flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" /> Chanakya is strategizing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Area */}
      <div className="flex-shrink-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-6 px-4 md:px-8 z-10">
        
        {/* Quick Actions Scrollable Row */}
        <div className="flex gap-2.5 overflow-x-auto pb-3 mb-2 custom-scrollbar hide-scroll-buttons mask-fade-edges">
          {["Analyze my skills", "Suggest a portfolio project", "How do I improve my ATS score?", "Draft a cold email", "Check market trends for Data Analytics"].map((action, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(action)}
              className="flex-shrink-0 px-4 py-2 bg-[#1A2236] border border-[#1F2937] hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/10 text-sm font-medium text-gray-300 hover:text-[#3B82F6] rounded-full transition-colors whitespace-nowrap"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Text Input Field with @mentions */}
        <form onSubmit={handleSubmit} className="relative flex flex-col bg-[#111827] border border-[#1F2937] rounded-2xl p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] focus-within:border-[#D4AF37]/50 focus-within:shadow-[0_4px_20px_rgba(212,175,55,0.1)] transition-all">
          
          {/* Mentions Dropdown */}
          <AnimatePresence>
            {showMentions && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 w-48 bg-[#1A2236] border border-[#D4AF37]/30 rounded-xl shadow-2xl overflow-hidden z-[100]"
              >
                <div className="p-2 border-b border-[#1F2937] bg-[#0B0F19]/50">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">Strategic Context</span>
                </div>
                {mentionOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => insertMention(opt)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                  >
                    <span className="text-[#D4AF37] font-bold">@</span>{opt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-3 w-full">
            <div className="relative flex-1">
              {/* Highlight layer */}
              <div 
                className="absolute inset-0 pointer-events-none px-4 py-2.5 text-transparent whitespace-pre-wrap break-words font-sans text-sm"
                aria-hidden="true"
              >
                {input.split(/(@\w+)/g).map((part, i) => (
                  mentionOptions.some(opt => part === '@' + opt) 
                    ? <span key={i} className="text-[#D4AF37] font-bold">{part}</span> 
                    : <span key={i}>{part}</span>
                ))}
              </div>
              <textarea 
                ref={textAreaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                rows={1}
                placeholder="Ask @dashboard, @market_trends, or @pathways..."
                className="w-full max-h-32 min-h-[44px] bg-transparent text-white/90 placeholder-gray-500 px-4 py-2.5 outline-none resize-none custom-scrollbar font-sans relative z-10"
                style={{ overflowY: 'auto' }}
              ></textarea>
            </div>
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8972A] text-[#0B0F19] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] hover:-translate-y-0.5 transition-all mb-0.5 mr-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
           <span className="text-[11px] text-gray-500 font-medium">Chanakya AI interprets market data, but always verify critical career decisions.</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll-buttons::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll-buttons {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 10px, black calc(100% - 20px), transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10px, black calc(100% - 20px), transparent);
        }
      `}} />
    </div>
  );
}
