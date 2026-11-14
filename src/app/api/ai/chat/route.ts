import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { z } from 'zod';
import { guardJson, jsonError } from '@/lib/api-guard';

export const runtime = 'edge';

/** Most recent messages kept per request. Older turns are dropped to bound token cost. */
const MAX_MESSAGES = 30;
/** Upper bound on what the client may send before the route trims it. */
const MAX_INCOMING_MESSAGES = 500;
const MAX_MESSAGE_CHARS = 12000;
const MAX_CONTEXT_FIELD_CHARS = 4000;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(MAX_MESSAGE_CHARS),
      })
    )
    .min(1)
    .max(MAX_INCOMING_MESSAGES),
  userContext: z.record(z.string(), z.any()).optional(),
});

/** Serialize untrusted context to a bounded JSON string for the prompt. */
function boundedJson(value: unknown, fallback: unknown): string {
  let out: string;
  try {
    out = JSON.stringify(value ?? fallback) ?? JSON.stringify(fallback);
  } catch {
    out = JSON.stringify(fallback);
  }
  return out.slice(0, MAX_CONTEXT_FIELD_CHARS);
}

export async function POST(req: Request) {
  try {
    const guard = await guardJson(req, bodySchema, { route: 'chat', limit: 30, guestLimit: 8, maxBytes: 200_000 });
    if (!guard.ok) return guard.response;
    const { userContext } = guard.data;
    // Trim long histories to the most recent turns instead of rejecting them.
    const messages = guard.data.messages.slice(-MAX_MESSAGES);

    const lastMessageContent = messages[messages.length - 1]?.content || "";
    const readiness = Number(userContext?.career_readiness_score);
    const readinessScore = Number.isFinite(readiness) ? Math.min(100, Math.max(0, readiness)) : 0;
    const pathwayTitle = typeof userContext?.locked_pathway?.title === "string" ? userContext.locked_pathway.title.slice(0, 200) : "None";
    
    let dynamicContext = "";
    
    // @dashboard logic
    if (lastMessageContent.includes("@dashboard")) {
      dynamicContext += `
[DASHBOARD CONTEXT ACTIVE]
- Current Readiness Score: ${readinessScore}%
- Skill Acquisition Status: ${boundedJson(userContext?.locked_pathway?.skillChecklist, [])}
- Strategic Projects: ${boundedJson(userContext?.locked_pathway?.projects, [])}
      `;
    }

    // @market_trends or @trends logic
    if (lastMessageContent.includes("@market_trends") || lastMessageContent.includes("@trends")) {
      dynamicContext += `
[MARKET TRENDS CONTEXT ACTIVE]
- Pinned Market Insights: ${boundedJson(userContext?.pinned_trends, [])}
      `;
    }

    const systemPrompt = `
Your name is 'Your Chanakya'. You are an elite, strategic career operating system assistant. 
Provide direct, highly tactical advice based on the user's provided state. Do not use generic pleasantries.

User Profile Context:
- Locked Pathway: ${JSON.stringify(pathwayTitle)}
${dynamicContext}

Instructions:
1. Use the injected [CONTEXT] blocks to provide hyper-specific advice.
2. If @dashboard is mentioned, analyze their specific missing skills and suggest immediate next steps.
3. If @market_trends is mentioned, correlate their skills with the pinned trends.
4. Keep responses concise, authoritative, and high-impact.
    `.trim();

    // Map messages to ensure compatibility with ModelMessage schema
    // Client-supplied "system" messages are rejected by the schema (prompt injection surface).
    const coreMessages = messages.map((m) => ({ role: m.role, content: m.content }));

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages: coreMessages,
      system: systemPrompt,
    });

    // Use toTextStreamResponse as fallback if toDataStreamResponse is still erroring in this environment
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("GROQ CHAT ERROR:", error);
    return jsonError("Failed to generate response", 500);
  }
}
