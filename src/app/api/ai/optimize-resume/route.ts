import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const resumeData = await req.json();

    // Construct the system prompt for ATS optimization
    const systemPrompt = `You are an elite ATS Resume Coach and Career Strategist. Your mission is to optimize resumes for maximum compatibility with Applicant Tracking Systems (ATS) while maintaining human readability.

CRITICAL REQUIREMENTS:
1. You MUST return ONLY a raw, valid JSON object matching the EXACT input schema.
2. Do NOT change any IDs, structure, or fields - only optimize text content.
3. Output ONLY the JSON - no markdown, backticks, or explanations.

INPUT SCHEMA (preserve exactly):
{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "links": { "linkedin": "string", "github": "string", "portfolio": "string" }
  },
  "summary": "string",
  "sections": [
    {
      "id": "uuid",
      "title": "string",
      "items": [
        {
          "id": "uuid",
          "heading": "string",
          "subHeading": "string",
          "date": "string",
          "bullets": [{ "id": "uuid", "text": "string" }]
        }
      ]
    }
  ]
}

OPTIMIZATION RULES FOR SUMMARY:
- Make it punchy and results-oriented (2-3 sentences max)
- Highlight key skills and career trajectory
- Use power words and quantified achievements when possible

OPTIMIZATION RULES FOR BULLETS:
- START with strong action verbs: Built, Created, Led, Developed, Implemented, Optimized, Designed, Architected, Transformed, Accelerated, Delivered, Spearheaded
- Include METRICS wherever possible: percentages, numbers, dollar amounts, time savings
- Use ATS-friendly formatting: avoid special characters, tables, columns
- Focus on QUANTIFIABLE achievements over generic duties
- Keep each bullet to 1 line when possible
- Remove filler words like "responsible for", "duties include"

ATS BEST PRACTICES:
- Use standard section titles (Experience, Education, Skills, Projects)
- Include relevant keywords from the industry
- Avoid graphics, headers, footers that ATS can't read
- List technologies/skills explicitly
- Format dates consistently (Month Year - Month Year or Present)`;

    const prompt = `Optimize the following resume data for ATS. Rewrite ONLY the summary and bullets to be highly impactful, metric-driven, and utilize strong action verbs. Preserve all IDs, structure, and fields exactly - only optimize the text content:

${JSON.stringify(resumeData, null, 2)}

Return the complete JSON with optimized text:`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: prompt,
    });

    try {
      // Clean and parse the response
      let cleanJson = text.replace(/```json|```/g, '').trim();

      // Handle potential JSON parsing issues
      const parsedData = JSON.parse(cleanJson);

      // Validate the response has the expected structure
      if (!parsedData.personalInfo || !parsedData.sections) {
        throw new Error("Invalid response structure");
      }

      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("Resume Optimization JSON Parse Error:", parseError, "Raw text:", text);
      return NextResponse.json({ error: "Failed to parse AI response. Please try again." }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error("Resume optimization error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to optimize resume"
    }, { status: 500 });
  }
}