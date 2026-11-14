export const runtime = 'nodejs';

import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { authorize, readPdfUpload, serverError } from "@/lib/api-guard";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Switched to pdf-extraction to avoid canvas issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfExtract = require('pdf-extraction');
  
  try {
    const auth = await authorize(req, { route: "extractResume", limit: 10, guestLimit: 3 });
    if (!auth.ok) return auth.response;

    const upload = await readPdfUpload(req);
    if (!upload.ok) return upload.response;
    const buffer = upload.buffer;
    
    // Local extraction using pdf-extraction
    const pdfData = await pdfExtract(buffer);
    const extractedText = String(pdfData.text ?? "").slice(0, 60000);

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 422 });
    }

    // Bypass Groq Structured Output Limits by using generateText and manual parsing
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are a data extraction bot. You MUST return ONLY a raw, valid JSON object. Do not wrap it in markdown blockquotes (\`\`\`json). Do not add any conversational text. Return ONLY the JSON.
      
      Schema:
      {
        "name": "string",
        "dob": "string",
        "education": [{"institution": "string", "degree": "string", "year": "string"}],
        "experience": [{"company": "string", "role": "string", "duration": "string", "description": "string"}],
        "skills": ["string"],
        "links": ["string"]
      }`,
      prompt: `Extract resume data:
      ${extractedText}`,
    });

    // Safety catch for hallucinations
    try {
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw text:", text);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error("Extraction error:", error);
    return serverError("extractResume", error, "Failed to extract resume");
  }
}
