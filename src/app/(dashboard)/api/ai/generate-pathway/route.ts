import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { profile } = await req.json();

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are an elite career strategist operating strictly in INDIA. You MUST return ONLY a raw, valid JSON object. Do not use markdown formatting or blockquotes. 
      
      CRITICAL LOCALIZATION: 
      - All salaries MUST use the Indian Rupee symbol (₹) and the Lakhs/Crores numbering system (e.g., '₹12,00,000' or '12 LPA'). 
      - NEVER output USD or '$'. 
      - Suggest ONLY certifications globally recognized or highly valued in India (e.g., NPTEL, IIT/IISc programs, ISB executive courses, popular Indian tech hubs like Bangalore/Hyderabad context).
      
      CRITICAL EDUCATIONAL LOGIC:
      - Analyze the user's current education: ${profile.current_education || "Not specified"}. 
      - NEVER suggest a lower degree. If the user has a Master's or PG degree, do NOT suggest a Bachelor's degree. 
      - Only suggest advanced certifications, executive programs, or PhDs for those already holding higher degrees.
      
      OUTPUT REQUIREMENTS:
      - Generate exactly 3 pathways.
      - Each pathway MUST have at least 8 highly specific, technical skills (NOT generic ones like 'Communication' or 'Teamwork').
      - STRICT HARD LIMIT: Each pathway MUST have EXACTLY 6 high-value certification options in the 'requirements' array. DO NOT generate fewer than 6 under any circumstances.
      - STRICT HARD LIMIT: Each pathway MUST have EXACTLY 6 highly detailed practical GitHub project ideas in the 'projects' array. DO NOT generate fewer than 6 under any circumstances.
      
      The JSON must exactly match this structure: 
      { 
        "pathways": [ 
          { 
            "title": "string", 
            "readinessScore": number (integer between 0-100), 
            "reasoning": "string",
            "timeline": "string",
            "salary": "string",
            "requirements": [{"name": "string", "provider": "string", "type": "string", "reason": "string"}],
            "skillChecklist": [{"skill": "string", "status": "missing" | "acquired"}],
            "projects": [{"title": "string", "description": "string", "techStack": ["string"]}]
          } 
        ] 
      }`,
      prompt: `Analyze this user profile and generate 3 strategic career pathways:
      User Profile: ${JSON.stringify(profile, null, 2)}`,
    });

    try {
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("Pathway JSON Parse Error:", parseError, "Raw text:", text);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error("Pathway generation error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to generate pathways" 
    }, { status: 500 });
  }
}
