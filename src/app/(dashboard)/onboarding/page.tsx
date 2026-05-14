"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UploadCloud, ArrowRight, ArrowLeft, Loader2, Plus, Trash2, CheckCircle2, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/useUserStore";

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  year: z.string()
});

const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  duration: z.string(),
  description: z.string()
});

const onboardingSchema = z.object({
  name: z.string().optional(),
  dob: z.string().optional(),
  education: z.array(educationSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  skills: z.array(z.string()).optional(),
  links: z.array(z.string()).optional(),
  currentStatus: z.string().min(1, "Current status is required"),
  targetCareer: z.string().min(1, "Target career is required"),
  transitionGoals: z.string().optional(),
  timeline: z.string().min(1, "Timeline is required"),
  budgetConstraints: z.string().min(1, "Budget is required")
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface Pathway {
  title: string;
  readinessScore: number;
  reasoning: string;
  timeline: string;
  salary: string;
  requirements: { name: string; provider: string; type: string; reason: string }[];
  skillChecklist: { skill: string; status: "missing" | "acquired" }[];
  projects: { title: string; description: string; techStack: string[] }[];
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newLink, setNewLink] = useState("");

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    control,
    reset,
    formState: { errors }
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      dob: "",
      education: [],
      experience: [],
      skills: [],
      links: [],
      currentStatus: "",
      targetCareer: "",
      transitionGoals: "",
      timeline: "",
      budgetConstraints: ""
    },
  });

  useEffect(() => {
    const checkExistingProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: pathways } = await supabase
        .from('career_pathways')
        .select('*')
        .eq('user_id', user.id);

      if (profile || (pathways && pathways.length > 0)) {
        if (profile) {
          reset({
            skills: profile.skills || [],
            // Pre-fill other fields if they match schema
          });
        }
        if (pathways && pathways.length > 0) {
          setPathways(pathways.map(p => ({ ...p.pathway_data, id: p.id })));
          setStep(4); // Go to selection if pathways exist
        } else if (profile?.skills?.length > 0) {
          setStep(2); // Go to review if skills exist
        }
      }
    };
    checkExistingProfile();
  }, [reset]);

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });

  const currentSkills = watch("skills") || [];
  const currentLinks = watch("links") || [];

  const addSkill = () => {
    if (newSkill.trim() && !currentSkills.includes(newSkill.trim())) {
      setValue("skills", [...currentSkills, newSkill.trim()], { shouldValidate: true });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue("skills", currentSkills.filter(s => s !== skillToRemove), { shouldValidate: true });
  };

  const addLink = () => {
    if (newLink.trim() && !currentLinks.includes(newLink.trim())) {
      setValue("links", [...currentLinks, newLink.trim()], { shouldValidate: true });
      setNewLink("");
    }
  };

  const removeLink = (linkToRemove: string) => {
    setValue("links", currentLinks.filter(l => l !== linkToRemove), { shouldValidate: true });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user session");

      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // 2. Save to user_profiles and resumes table
      await supabase.from('user_profiles').update({ resume_url: publicUrl }).eq('user_id', user.id);
      await supabase.from('resumes').insert({
        user_id: user.id,
        file_url: publicUrl,
        version_name: file.name
      });

      // 3. Extract data via API
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to extract PDF");

      const extractedData = await res.json();
      
      const currentValues = watch();
      reset({
        ...currentValues,
        ...extractedData,
      });
      
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Processing failed. You can skip or try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) isValid = true; 
    if (step === 2) isValid = true; 
    if (step === 3) {
      isValid = await trigger(["currentStatus", "targetCareer", "timeline", "budgetConstraints"]);
      if (isValid) {
        // Trigger generation
        setIsGenerating(true);
        setStep(4);
        try {
          const res = await fetch("/api/ai/generate-pathway", {
            method: "POST",
            body: JSON.stringify({ profile: watch() }),
          });
          const data = await res.json();
          const generatedPathways = data.pathways || [];
          setPathways(generatedPathways);

          // Save to Supabase
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user && generatedPathways.length > 0) {
            // Delete old active ones
            await supabase.from('career_pathways').delete().eq('user_id', user.id).eq('status', 'active');
            
            const insertData = generatedPathways.map((pw: Pathway) => ({
              user_id: user.id,
              pathway_name: pw.title,
              pathway_data: pw,
              compatibility_score: pw.readinessScore,
              status: 'active'
            }));
            await supabase.from('career_pathways').insert(insertData);
            
            // Update profile skills
            await supabase.from('user_profiles').update({ 
              skills: watch('skills'),
              background: watch('currentStatus'),
              current_education: watch('education')?.[0]?.degree || ""
            }).eq('user_id', user.id);
          }
        } catch (err) {
          console.error(err);
          alert("Failed to generate pathways. Please try again.");
          setStep(3);
        } finally {
          setIsGenerating(false);
        }
        return;
      }
    }
    if (step === 4) isValid = true;

    if (isValid) {
      if (step < totalSteps) {
        setStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleLockPathway = async (pathway: Pathway) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user session");

      // 1. Update status in career_pathways
      // We need the ID if it exists, otherwise we'll have to find it or it's a new generation
      // For now, let's assume we want to mark THIS one as locked and others as active
      const { data: dbPathways } = await supabase
        .from('career_pathways')
        .select('id, pathway_name')
        .eq('user_id', user.id);

      const dbMatch = dbPathways?.find(p => p.pathway_name === pathway.title);
      
      if (dbMatch) {
        await supabase.from('career_pathways').update({ status: 'active' }).eq('user_id', user.id);
        await supabase.from('career_pathways').update({ status: 'locked' }).eq('id', dbMatch.id);
        
        // 2. Update user_profiles
        await supabase.from('user_profiles').update({ 
          locked_pathway_id: dbMatch.id,
          onboarding_completed: true // wait, onboarding_completed is in 'users' table
        }).eq('user_id', user.id);

        await supabase.from('users').update({ onboarding_completed: true }).eq('id', user.id);
      }

      // 3. Hydrate Zustand
      const { hydrateStore } = useUserStore.getState();
      await hydrateStore();

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to lock pathway. Please try again.");
    }
  };

  const onSubmit = (data: OnboardingFormValues) => {
    // This is handled by handleLockPathway in step 4
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 relative w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span key={i} className={`text-xs font-semibold uppercase tracking-wider ${step >= i + 1 ? 'text-[#D4AF37]' : 'text-gray-500'}`}>
              Step {i + 1}
            </span>
          ))}
        </div>
        <div className="h-2 w-full bg-[#111827] rounded-full overflow-hidden border border-[#1F2937]">
          <div 
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8972A] transition-all duration-500 ease-in-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-[#111827]/75 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-[#D4AF37]/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">
        
        {/* STEP 1: Document Upload */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-display font-semibold text-white mb-2">Upload your resume</h2>
            <p className="text-gray-400 mb-8">Let AI extract your profile. You can review and edit in the next step.</p>
            
            <label className={`border-2 border-dashed border-[#D4AF37]/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-[#D4AF37]/[0.02] hover:bg-[#D4AF37]/[0.05] transition-colors cursor-pointer group ${isExtracting ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-16 h-16 rounded-full bg-[#1A2236] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {isExtracting ? <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" /> : <UploadCloud className="w-8 h-8 text-[#D4AF37]" />}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {isExtracting ? "Extracting Profile (This takes a moment)..." : "Drag & drop your PDF resume"}
              </h3>
              <p className="text-sm text-gray-400 mb-6">Supports PDF up to 5MB</p>
              <div className="px-6 py-2.5 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] font-medium transition-colors">
                {isExtracting ? "Processing..." : "Browse Files"}
              </div>
              <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isExtracting} />
            </label>
            <div className="flex justify-center mt-6">
              <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-white transition-colors">
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Auto-filled Data Review */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            <h2 className="text-3xl font-display font-semibold text-white mb-2">Review Profile</h2>
            <p className="text-gray-400 mb-8">We&apos;ve extracted this from your resume. Feel free to make adjustments.</p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input {...register("name")} className="w-full bg-[#1A2236] border border-[#1F2937] rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">DOB</label>
                  <input {...register("dob")} placeholder="YYYY-MM-DD" className="w-full bg-[#1A2236] border border-[#1F2937] rounded-lg px-4 py-2 text-white" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-400">Education</label>
                  <button onClick={() => appendEdu({ institution: "", degree: "", year: "" })} className="text-[#D4AF37] text-xs flex items-center"><Plus className="w-3 h-3 mr-1"/> Add</button>
                </div>
                {eduFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <input {...register(`education.${index}.institution`)} placeholder="Institution" className="flex-1 bg-[#1A2236] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm text-white" />
                    <input {...register(`education.${index}.degree`)} placeholder="Degree" className="w-1/4 bg-[#1A2236] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm text-white" />
                    <input {...register(`education.${index}.year`)} placeholder="Year" className="w-1/4 bg-[#1A2236] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm text-white" />
                    <button onClick={() => removeEdu(index)} className="text-red-400 p-1"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-400">Experience</label>
                  <button onClick={() => appendExp({ company: "", role: "", duration: "", description: "" })} className="text-[#D4AF37] text-xs flex items-center"><Plus className="w-3 h-3 mr-1"/> Add</button>
                </div>
                {expFields.map((field, index) => (
                  <div key={field.id} className="bg-[#1A2236] border border-[#1F2937] rounded-lg p-3 mb-3">
                    <div className="flex gap-2 mb-2">
                      <input {...register(`experience.${index}.company`)} placeholder="Company" className="flex-1 bg-[#0B0F19] border border-[#1F2937] rounded px-3 py-1.5 text-sm text-white" />
                      <input {...register(`experience.${index}.role`)} placeholder="Role" className="flex-1 bg-[#0B0F19] border border-[#1F2937] rounded px-3 py-1.5 text-sm text-white" />
                      <button onClick={() => removeExp(index)} className="text-red-400 p-1"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    <input {...register(`experience.${index}.duration`)} placeholder="Duration" className="w-full bg-[#0B0F19] border border-[#1F2937] rounded px-3 py-1.5 text-sm text-white mb-2" />
                    <textarea {...register(`experience.${index}.description`)} placeholder="Description" className="w-full bg-[#0B0F19] border border-[#1F2937] rounded px-3 py-1.5 text-sm text-white h-20 resize-none" />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentSkills.map((skill) => (
                    <span key={skill} className="bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {skill} <button onClick={() => removeSkill(skill)} className="hover:text-red-400">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    value={newSkill} 
                    onChange={e => setNewSkill(e.target.value)} 
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    placeholder="Add a skill and press Enter" 
                    className="flex-1 bg-[#1A2236] border border-[#1F2937] rounded-lg px-4 py-2 text-white text-sm" 
                  />
                  <button onClick={addSkill} type="button" className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-sm font-semibold">Add</button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Links</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentLinks.map((link) => (
                    <span key={link} className="bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {link} <button onClick={() => removeLink(link)} className="hover:text-red-400">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    value={newLink} 
                    onChange={e => setNewLink(e.target.value)} 
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                    placeholder="Add a link (LinkedIn, Portfolio) and press Enter" 
                    className="flex-1 bg-[#1A2236] border border-[#1F2937] rounded-lg px-4 py-2 text-white text-sm" 
                  />
                  <button onClick={addLink} type="button" className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-sm font-semibold">Add</button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: Career Details */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-display font-semibold text-white mb-2">Career Goals</h2>
            <p className="text-gray-400 mb-8">Tell us what you want to achieve.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Current Status</label>
                <select {...register("currentStatus")} className="w-full bg-[#1A2236] border border-[#1F2937] rounded-lg px-4 py-3 text-white">
                  <option value="">Select status...</option>
                  <option value="student">Student</option>
                  <option value="employed">Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="freelancer">Freelancer</option>
                </select>
                {errors.currentStatus && <p className="text-red-500 text-xs mt-1">{errors.currentStatus.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Career</label>
                <input {...register("targetCareer")} placeholder="e.g. Full Stack Developer" className="w-full bg-[#1A2236] border border-[#1F2937] rounded-lg px-4 py-3 text-white" />
                {errors.targetCareer && <p className="text-red-500 text-xs mt-1">{errors.targetCareer.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Transition Goals</label>
                <textarea {...register("transitionGoals")} placeholder="What do you want to achieve?" className="w-full bg-[#1A2236] border border-[#1F2937] rounded-lg px-4 py-3 text-white h-24 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Timeline</label>
                  <select {...register("timeline")} className="w-full bg-[#1A2236] border border-[#1F2937] rounded-lg px-4 py-3 text-white">
                    <option value="">Select timeline...</option>
                    <option value="0-3">0-3 months</option>
                    <option value="3-6">3-6 months</option>
                    <option value="6-12">6-12 months</option>
                    <option value="12+">1+ year</option>
                  </select>
                  {errors.timeline && <p className="text-red-500 text-xs mt-1">{errors.timeline.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Budget</label>
                  <select {...register("budgetConstraints")} className="w-full bg-[#1A2236] border border-[#1F2937] rounded-lg px-4 py-3 text-white">
                    <option value="">Select budget...</option>
                    <option value="free">Free / Self-taught</option>
                    <option value="low">Under ₹10k</option>
                    <option value="medium">₹10k - ₹50k</option>
                    <option value="high">Premium Bootcamp</option>
                  </select>
                  {errors.budgetConstraints && <p className="text-red-500 text-xs mt-1">{errors.budgetConstraints.message}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Pathway Selection */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
              <h2 className="text-3xl font-display font-semibold text-white">Select Your Pathway</h2>
            </div>
            <p className="text-gray-400 mb-8">AI has generated 3 strategic pathways based on your profile and market trends.</p>
            
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
                <p className="text-white font-medium">Strategizing unconventional paths...</p>
                <p className="text-gray-500 text-sm mt-2">Grounding with Google Search</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pathways.map((pw, i) => (
                  <div 
                    key={i} 
                    className="group bg-[#1A2236] border border-[#1F2937] hover:border-[#D4AF37]/50 rounded-2xl p-6 transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => handleLockPathway(pw)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">{pw.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{pw.reasoning}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#D4AF37]">{pw.readinessScore}%</div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-500">Readiness</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="text-xs bg-[#0B0F19] px-3 py-1.5 rounded-lg border border-[#1F2937] text-gray-300">
                        <span className="text-gray-500 mr-2">Timeline:</span> {pw.timeline || "N/A"}
                      </div>
                      <div className="text-xs bg-[#0B0F19] px-3 py-1.5 rounded-lg border border-[#1F2937] text-gray-300">
                        <span className="text-gray-500 mr-2">Est. Salary:</span> {pw.salary || "N/A"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {pw.requirements?.slice(0, 3).map((req, idx: number) => (
                          <div key={idx} className="w-8 h-8 rounded-full bg-[#D4AF37] border-2 border-[#1A2236] flex items-center justify-center text-[10px] font-bold text-[#0B0F19]" title={req.name}>
                            {req.name?.[0] || "?"}
                          </div>
                        ))}
                        {(pw.requirements?.length || 0) > 3 && (
                          <div className="w-8 h-8 rounded-full bg-[#1F2937] border-2 border-[#1A2236] flex items-center justify-center text-[10px] font-bold text-gray-400">
                            +{(pw.requirements?.length || 0) - 3}
                          </div>
                        )}
                      </div>
                      <button className="flex items-center gap-2 text-sm font-bold text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">
                        Lock Pathway <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="mt-10 flex items-center justify-between pt-6 border-t border-[#1F2937]">
            {step > 1 ? (
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div></div>}

            <button 
              onClick={handleNext}
              disabled={isGenerating || isExtracting}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8972A] text-[#0B0F19] font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Pathways...
                </>
              ) : step === 3 ? "Generate Pathways" : "Continue"}
              {!isGenerating && step < totalSteps && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
