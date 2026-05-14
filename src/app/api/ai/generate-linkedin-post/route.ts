import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic, context } = await req.json();

    // Universal Groq Patch: Using generateText for structured JSON delivery
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You MUST return ONLY a raw, valid JSON object matching the requested structure. Do not use markdown formatting, backticks, or blockquotes. Output ONLY the JSON.
      
      Structure:
      {
        "post": "string"
      }`,
      prompt: `Generate a high-engagement LinkedIn post about ${topic}.
      Context: ${context}
      Style: Professional, insightful, and slightly provocative. Use line breaks and 3 relevant hashtags.`,
    });

    try {
      // Step 1: Strip markdown blocks
      let cleanJson = text.replace(/```json|```/g, '').trim();
      
      // Step 2: Emergency repair for unescaped newlines within the string value
      // This looks for the content between "post": " and " and escapes internal newlines
      if (cleanJson.includes('"post":')) {
        const parts = cleanJson.split('"post":');
        if (parts.length > 1) {
          let value = parts[1].trim();
          // Remove leading and trailing quotes if they exist
          if (value.startsWith('"')) value = value.substring(1);
          if (value.endsWith('}')) value = value.substring(0, value.length - 1).trim();
          if (value.endsWith('"')) value = value.substring(0, value.length - 1);
          
          // Escape literal newlines and tabs
          const escapedValue = value
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t");
            
          cleanJson = `{"post": "${escapedValue}"}`;
        }
      }

      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("LinkedIn JSON Parse Error:", parseError, "Raw text:", text);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error("LinkedIn generation error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to generate post" 
    }, { status: 500 });
  }
}
