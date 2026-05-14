import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { type, currentList } = await req.json();

    const prompt = `
      You are an elite career strategist. 
      Generate a NEW, highly specific technical ${type === 'project' ? 'GitHub project' : 'professional certification'} for the Indian job market that is not in the current list: ${JSON.stringify(currentList)}.
      
      Requirements:
      - If project: Return a title, a brief 2-sentence description, and a techStack array of 3-4 technologies.
      - If cert: Return a name, a provider (e.g., Google, AWS, Coursera), and a type (e.g., 'Professional Certificate').
      
      Return ONLY raw JSON. No markdown, no prose.
      Format for project: { "title": "", "description": "", "techStack": [] }
      Format for cert: { "name": "", "provider": "", "type": "" }
    `;

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: prompt,
    });

    // Extract JSON if model wraps it in markdown blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("REGENERATE ERROR:", error);
    return new Response(JSON.stringify({ error: "Failed to regenerate item" }), { status: 500 });
  }
}
