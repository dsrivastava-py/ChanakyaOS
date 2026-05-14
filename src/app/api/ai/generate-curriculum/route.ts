import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { courseName } = await req.json();

    const prompt = `
      Generate a 4-week study curriculum for the course: "${courseName}".
      The curriculum should be tactical, high-intensity, and optimized for career readiness in the Indian tech market.
      
      Return ONLY raw JSON. No markdown, no prose.
      Format: { "weeks": [ { "week": 1, "topics": ["string"], "completed": false } ] }
    `;

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: prompt,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("CURRICULUM ERROR:", error);
    return new Response(JSON.stringify({ error: "Failed to generate curriculum" }), { status: 500 });
  }
}
