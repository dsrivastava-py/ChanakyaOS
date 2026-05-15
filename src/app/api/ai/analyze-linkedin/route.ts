import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { parsedText } = await req.json();

    if (!parsedText || typeof parsedText !== "string") {
      return NextResponse.json(
        { error: "No parsed text provided" },
        { status: 400 }
      );
    }

    // System prompt for elite recruiter analysis
    const systemPrompt = `You are an Elite LinkedIn Profile Recruiter and Brand Strategist. Your mission is to analyze LinkedIn profile exports and provide actionable feedback.

CRITICAL REQUIREMENTS:
1. You MUST return ONLY a raw, valid JSON object with the exact structure specified below.
2. Do NOT use markdown formatting, backticks, or explanations.
3. Output ONLY the JSON.

OUTPUT SCHEMA (MUST match exactly):
{
  "headline": {
    "originalText": "string - the actual headline text found in the PDF",
    "aiScore": "number - grade out of 10",
    "aiFeedback": "string - 1-2 sentence constructive feedback",
    "optimizedVersion": "string - a better headline version or null if already optimal"
  },
  "about": {
    "originalText": "string - the about/summary section text",
    "aiScore": "number - grade out of 10",
    "aiFeedback": "string - 1-2 sentence constructive feedback",
    "optimizedVersion": "string - an improved version or null"
  },
  "experience": {
    "originalText": "string - experience section text",
    "aiScore": "number - grade out of 10",
    "aiFeedback": "string - 1-2 sentence constructive feedback",
    "optimizedVersion": "string - improved version or null"
  },
  "skills": {
    "originalText": "string - skills section text",
    "aiScore": "number - grade out of 10",
    "aiFeedback": "string - 1-2 sentence constructive feedback",
    "optimizedVersion": "string - improved version or null"
  },
  "banner": {
    "originalText": "string - banner/background section text or 'not detected'",
    "aiScore": "number - grade out of 10",
    "aiFeedback": "string - feedback on visual branding",
    "optimizedVersion": "string - suggested banner text or null"
  },
  "pfp": {
    "originalText": "string - profile picture section or 'not detected'",
    "aiScore": "number - grade out of 10",
    "aiFeedback": "string - feedback on photo/visuals",
    "optimizedVersion": "string - suggestions or null"
  },
  "profileHealthScore": "number - overall score 0-100"
}

SCORING CRITERIA:
- Headline (10 pts): Clear value proposition, keywords, professional tone
- About (10 pts): Compelling story, quantified achievements, CTA, keywords
- Experience (10 pts): Results-focused, metrics, career progression, action verbs
- Skills (10 pts): Relevant to target role, industry keywords, balance of hard/soft
- Banner (10 pts): Professional, on-brand, not default/blank
- Profile Photo (10 pts): Professional, high-quality, friendly expression, proper framing

Calculate profileHealthScore as a weighted average:
- Headline: 15%
- About: 25%
- Experience: 30%
- Skills: 15%
- Banner: 7.5%
- Profile Photo: 7.5%

ANALYSIS RULES:
- Extract ACTUAL text from the PDF for each section
- If a section is missing or empty, score it 2/10 and note what's missing
- Be harsh but constructive - low scores for generic/weak content
- Generate optimized versions that are specific, metric-driven, and keyword-rich
- If content is already excellent (8+/10), set optimizedVersion to null`;

    const prompt = `Analyze this LinkedIn profile export and provide scores and feedback for each section. Extract the actual text from the profile and evaluate it.

LinkedIn Profile Text:
${parsedText}

Return the JSON object:`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: prompt,
    });

    try {
      // Clean and parse the response
      let cleanJson = text.replace(/```json|```/g, '').trim();

      const parsedData = JSON.parse(cleanJson);

      // Validate the response has the expected structure
      if (!parsedData.headline || !parsedData.about || !parsedData.experience || !parsedData.skills) {
        throw new Error("Invalid response structure - missing required fields");
      }

      return NextResponse.json({
        success: true,
        elements: {
          headline: parsedData.headline,
          about: parsedData.about,
          experience: parsedData.experience,
          skills: parsedData.skills,
          banner: parsedData.banner || { originalText: "Not detected", aiScore: 5, aiFeedback: "Could not detect banner", optimizedVersion: null },
          pfp: parsedData.pfp || { originalText: "Not detected", aiScore: 5, aiFeedback: "Could not detect profile photo", optimizedVersion: null },
        },
        profileHealthScore: parsedData.profileHealthScore || 0
      });

    } catch (parseError) {
      console.error("LinkedIn Analysis JSON Parse Error:", parseError, "Raw text:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error("LinkedIn analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze LinkedIn profile" },
      { status: 500 }
    );
  }
}