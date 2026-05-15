"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const supabase = createClient();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())          e.name    = "Name is required.";
    if (!form.email.includes("@"))  e.email   = "Valid email required.";
    if (form.message.length < 10)   e.message = "Message must be at least 10 characters.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setErrors({});
    setLoading(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          { 
            name: form.name, 
            email: form.email, 
            message: form.message 
          }
        ]);

      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      alert("Failed to send transmission: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0B0F19] min-h-screen pt-24">
      <section className="py-32 pb-40 container-marketing relative z-10">
        <div className="max-w-[650px] mx-auto">
          <p className="eyebrow mb-6">Contact</p>
          <h1
            className="font-display font-bold text-[#F3F4F6] tracking-tight leading-[1.06] mb-4"
            style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
          >
            Send a <span className="text-gradient-gold">transmission.</span>
          </h1>
          <p className="text-[#9CA3AF] text-base leading-relaxed mb-12">
            Questions, partnership enquiries, or just want to tell us we&apos;re building
            something important — we read everything.
          </p>

          {sent ? (
            <div className="glass-card rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="text-4xl mb-4 text-[#D4AF37]">◆</div>
              <h2 className="text-xl font-semibold text-[#F3F4F6] mb-2">Transmission received.</h2>
              <p className="text-sm text-[#9CA3AF]">We&apos;ll respond within 48 hours.</p>
              <button 
                onClick={() => setSent(false)}
                className="mt-6 text-[#D4AF37] text-sm font-medium hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Name */}
              <div>
                <label htmlFor="contact-name" className="eyebrow block mb-2" style={{ fontSize: "11px", color: "#6B7280" }}>
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Arjun Kumar"
                  disabled={loading}
                  className="w-full h-12 px-4 rounded-xl text-sm bg-[#111827] border border-[#1F2937] text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#D4AF37]/50 transition-colors disabled:opacity-50"
                />
                {errors.name && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="contact-email" className="eyebrow block mb-2" style={{ fontSize: "11px", color: "#6B7280" }}>
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="arjun@example.com"
                  disabled={loading}
                  className="w-full h-12 px-4 rounded-xl text-sm bg-[#111827] border border-[#1F2937] text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#D4AF37]/50 transition-colors disabled:opacity-50"
                />
                {errors.email && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.email}</p>}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="eyebrow block mb-2" style={{ fontSize: "11px", color: "#6B7280" }}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Your message here..."
                  rows={6}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-[#111827] border border-[#1F2937] text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#D4AF37]/50 transition-colors resize-none disabled:opacity-50"
                />
                {errors.message && <p className="mt-1.5 text-xs text-[#EF4444]">{errors.message}</p>}
              </div>

              {/* Submit */}
              <button
                id="contact-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary h-13 px-10 text-base rounded-xl self-start flex items-center gap-2.5 transition-all active:scale-95 disabled:opacity-70"
                style={{ height: "52px" }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? "Transmitting..." : "Transmit"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

