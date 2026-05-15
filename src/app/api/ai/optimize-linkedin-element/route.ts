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
    const { elementName, originalText, globalContext } = await req.json();

    if (!elementName || !originalText) {
      return NextResponse.json(
        { error: "Missing required fields: elementName and originalText" },
        { status: 400 }
      );
    }

    // Parse global context
    let contextData: GlobalContext = {};
    if (globalContext) {
      try {
        contextData = typeof globalContext === "string" ? JSON.parse(globalContext) : globalContext;
      } catch {
        console.warn("Failed to parse globalContext, using as raw string");
        contextData = { resumeData: {}, lockedPathway: {}, profile: {} };
      }
    }

    // Extract relevant info from context
    const resumeData = contextData.resumeData || {};
    const lockedPathway = contextData.lockedPathway || {};
    const profile = contextData.profile || {};

    const userSkills = (lockedPathway?.skillChecklist as Array<{ skill: string }> | undefined)?.map((s) => s.skill).join(", ") || "Not specified";
    const targetRole = lockedPathway?.title || "Professional";
    const userName = profile?.name || resumeData?.personalInfo?.name || "User";
    const userSummary = resumeData?.summary || "";
    const userExperience = (resumeData?.sections as Array<{ title: string; items: unknown[] }> | undefined)?.find((s) => s.title?.toLowerCase()?.includes("experience"))?.items || [];

    // Build element-specific prompt context
    let elementContext = "";
    switch (elementName.toLowerCase()) {
      case "headline":
        elementContext = `Create a compelling LinkedIn headline (under 220 characters) for ${userName}, a ${targetRole}. Current headline: "${originalText}". Key skills: ${userSkills}. Make it include: job title, key value proposition, and relevant keywords for recruiters.`;
        break;
      case "about":
        elementContext = `Write a powerful "About" section (2-3 paragraphs) for ${userName}, a ${targetRole}. Current about: "${originalText}". Background: ${userSummary}. Experience: ${JSON.stringify(userExperience)}. Include: career story, key achievements with metrics, and what they're looking for. Make it engaging and ATS-friendly.`;
        break;
      case "experience":
        elementContext = `Enhance experience descriptions for ${userName}, a ${targetRole}. Current description: "${originalText}". Skills: ${userSkills}. Rewrite with: strong action verbs, quantifiable achievements (%), dollar amounts, and impact statements. Keep it concise but compelling.`;
        break;
      case "skills":
        elementContext = `Suggest a refined skills list for ${userName}, a ${targetRole}. Current skills section: "${originalText}". Their field: ${userSkills}. Provide: 15-25 relevant skills ordered by relevance, including both technical and soft skills that recruiters in this field value.`;
        break;
      case "banner":
        elementContext = `Suggest a professional banner/background image concept for ${userName}, a ${targetRole}. Current banner context: "${originalText}". Their expertise: ${userSkills}. Give: a visual theme description, recommended colors, and design elements that convey professionalism.`;
        break;
      case "pfp":
        elementContext = `Provide suggestions for an optimal LinkedIn profile picture for ${userName}, a ${targetRole}. Current context: "${originalText}". Give: pose recommendations, background suggestions, attire advice, and tips for a welcoming yet professional expression.`;
        break;
      default:
        elementContext = `Optimize the following LinkedIn element for ${userName}, a ${targetRole}: "${originalText}". Context: Skills - ${userSkills}, Background - ${userSummary}. Make it highly attractive to recruiters.`;
    }

    const systemPrompt = `You are a LinkedIn Optimization Expert and Elite Career Strategist. Your mission is to rewrite specific LinkedIn profile elements to be highly attractive to top recruiters and hiring managers.

CRITICAL RULES:
1. You MUST return ONLY a raw, valid JSON object with the exact structure below.
2. Do NOT use markdown, backticks, or explanations - only JSON.
3. Output the exact schema provided below.

OUTPUT SCHEMA:
{
  "optimizedVersion": "string - the rewritten element text",
  "explanation": "string - brief 1-2 sentence explanation of what was improved",
  "score": "number - your estimate of the new score out of 10"
}

QUALITY STANDARDS:
- Use power words and action verbs
- Include quantifiable achievements where possible
- Incorporate relevant keywords for the target role/industry
- Maintain authenticity - don't over-hype
- Keep appropriate length for the element type
- Make it ATS-friendly (Applicant Tracking Systems)`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: elementContext,
    });

    try {
      let cleanJson = text.replace(/```json|```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);

      if (!parsedData.optimizedVersion) {
        throw new Error("Invalid response - missing optimizedVersion");
      }

      return NextResponse.json({
        success: true,
        optimizedVersion: parsedData.optimizedVersion,
        explanation: parsedData.explanation || "Improved based on best practices",
        score: parsedData.score || 8
      });

    } catch (parseError) {
      console.error("Optimize LinkedIn Element JSON Parse Error:", parseError, "Raw text:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error("Optimize LinkedIn element error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to optimize element" },
      { status: 500 }
    );
  }
}