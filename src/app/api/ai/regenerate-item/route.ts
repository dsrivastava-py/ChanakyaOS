import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { z } from 'zod';
import { guardJson, jsonError } from '@/lib/api-guard';

const bodySchema = z.object({
  type: z.enum(['project', 'cert']),
  currentList: z.array(z.any()).max(100).optional(),
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const guard = await guardJson(req, bodySchema, { route: 'regenerateItem', limit: 20, guestLimit: 4, maxBytes: 50_000 });
    if (!guard.ok) return guard.response;
    const { type, currentList } = guard.data;

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
    return jsonError("Failed to regenerate item", 500);
  }
}
