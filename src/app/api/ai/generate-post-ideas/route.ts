import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextResponse } from "next/server";

interface ResumeData {
  personalInfo?: { name?: string; email?: string; phone?: string; links?: Record<string, string> };
  summary?: string;
  sections?: Array<{ title?: string; items?: Array<Record<string, unknown>> }>;
}

interface LockedPathway {
  title?: string;
  skillChecklist?: Array<{ skill: string; status?: string }>;
}

interface GlobalContext {
  resumeData?: ResumeData;
  lockedPathway?: LockedPathway;
  profile?: { name?: string };
}

export async function POST(req: Request) {
  try {
    const { globalContext } = await req.json();

    // Parse global context
    let contextData: GlobalContext = {};
    if (globalContext) {
      try {
        contextData = typeof globalContext === "string" ? JSON.parse(globalContext) : globalContext;
      } catch {
        contextData = { resumeData: {}, lockedPathway: {}, profile: {} };
      }
    }

    // Extract relevant user data
    const resumeData = contextData.resumeData || {};
    const lockedPathway = contextData.lockedPathway || {};
    const profile = contextData.profile || {};

    const userSkills = (lockedPathway?.skillChecklist as Array<{ skill: string }> | undefined)?.map((s) => s.skill) || [];
    const targetRole = lockedPathway?.title || "Professional";
    const userName = profile?.name || resumeData?.personalInfo?.name || "User";
    const userSummary = resumeData?.summary || "";
    const userExperience = (resumeData?.sections as Array<{ title: string; items: unknown[] }> | undefined)?.find((s) => s.title?.toLowerCase()?.includes("experience"))?.items || [];

    const systemPrompt = `You are a LinkedIn Content Strategist and Growth Expert. Your mission is to generate strategic post ideas that help professionals build their personal brand and attract opportunities.

CRITICAL REQUIREMENTS:
1. You MUST return ONLY a raw, valid JSON array with exactly 3 post ideas.
2. Do NOT use markdown, backticks, or explanations - only JSON.
3. Each object MUST have exactly these 4 fields:
   - "idea": The core concept/theme of the post (1-2 sentences)
   - "hook": A scroll-stopping headline/opening sentence (concise, intriguing)
   - "targetAudience": Who this post is meant to attract (e.g., "FinTech Founders", "Data Science Recruiters", "Startup CTOs")
   - "resourceLinks": An array of 2-3 helpful resource links (Google search query URLs or relevant industry links)

OUTPUT FORMAT (JSON Array):
[
  {
    "idea": "string",
    "hook": "string",
    "targetAudience": "string",
    "resourceLinks": ["string", "string", "string"]
  },
  {
    "idea": "string",
    "hook": "string",
    "targetAudience": "string",
    "resourceLinks": ["string", "string", "string"]
  },
  {
    "idea": "string",
    "hook": "string",
    "targetAudience": "string",
    "resourceLinks": ["string", "string", "string"]
  }
]

STRATEGY GUIDELINES:
- Posts should be relevant to ${targetRole} career trajectory
- Mix of content types: insights, stories, tips, industry commentary
- Each should be unique and offer different value
- Hooks should be attention-grabbing and spark curiosity
- Resource links should be practical and help the user research further
- Keep posts authentic to ${userName}'s journey as a ${targetRole}`;

    const prompt = `Generate 3 strategic LinkedIn post ideas for ${userName}, who is a ${targetRole}.

Their background:
- Skills: ${userSkills.join(", ")}
- Summary: ${userSummary}
- Experience: ${JSON.stringify(userExperience.slice(0, 3))}

Create diverse post concepts that would help them:
1. Build thought leadership in their field
2. Attract relevant opportunities (jobs, collaborations, connections)
3. Demonstrate expertise and value

Return exactly 3 ideas in the specified JSON format:`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: prompt,
    });

    try {
      let cleanJson = text.replace(/```json|```/g, '').trim();

      // Handle potential array wrapping
      if (!cleanJson.startsWith('[')) {
        // Try to find the array in the response
        const arrayMatch = cleanJson.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          cleanJson = arrayMatch[0];
        }
      }

      const parsedData = JSON.parse(cleanJson);

      // Validate it's an array with 3 items
      if (!Array.isArray(parsedData) || parsedData.length !== 3) {
        throw new Error("Invalid response format - expected array of 3 items");
      }

      // Validate each item has required fields
      const validItems = parsedData.every((item: { idea: string; hook: string; targetAudience: string; resourceLinks: string[] }) =>
        item.idea && item.hook && item.targetAudience && Array.isArray(item.resourceLinks)
      );

      if (!validItems) {
        throw new Error("Invalid item structure in response");
      }

      // Generate Google search URLs for resourceLinks if needed
      const enhancedData = parsedData.map((item: { idea: string; hook: string; targetAudience: string; resourceLinks: string[] }) => ({
        ...item,
        resourceLinks: item.resourceLinks.map((link: string, idx: number) => {
          // If it's not a full URL, create a Google search
          if (!link.startsWith('http')) {
            const searchQuery = encodeURIComponent(`${item.targetAudience} ${item.idea.split(' ').slice(0, 3).join(' ')}`);
            return `https://www.google.com/search?q=${searchQuery}`;
          }
          return link;
        })
      }));

      return NextResponse.json({
        success: true,
        postIdeas: enhancedData
      });

    } catch (parseError) {
      console.error("Generate Post Ideas JSON Parse Error:", parseError, "Raw text:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error("Generate post ideas error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate post ideas" },
      { status: 500 }
    );
  }
}