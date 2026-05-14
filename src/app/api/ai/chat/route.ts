import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, userContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages array");
    }

    const lastMessageContent = messages[messages.length - 1]?.content || "";
    
    let dynamicContext = "";
    
    // @dashboard logic
    if (lastMessageContent.includes("@dashboard")) {
      dynamicContext += `
[DASHBOARD CONTEXT ACTIVE]
- Current Readiness Score: ${userContext?.career_readiness_score || 0}%
- Skill Acquisition Status: ${JSON.stringify(userContext?.locked_pathway?.skillChecklist || [])}
- Strategic Projects: ${JSON.stringify(userContext?.locked_pathway?.projects || [])}
      `;
    }

    // @market_trends or @trends logic
    if (lastMessageContent.includes("@market_trends") || lastMessageContent.includes("@trends")) {
      dynamicContext += `
[MARKET TRENDS CONTEXT ACTIVE]
- Pinned Market Insights: ${JSON.stringify(userContext?.pinned_trends || [])}
      `;
    }

    const systemPrompt = `
Your name is 'Your Chanakya'. You are an elite, strategic career operating system assistant. 
Provide direct, highly tactical advice based on the user's provided state. Do not use generic pleasantries.

User Profile Context:
- Locked Pathway: ${JSON.stringify(userContext?.locked_pathway?.title || "None")}
${dynamicContext}

Instructions:
1. Use the injected [CONTEXT] blocks to provide hyper-specific advice.
2. If @dashboard is mentioned, analyze their specific missing skills and suggest immediate next steps.
3. If @market_trends is mentioned, correlate their skills with the pinned trends.
4. Keep responses concise, authoritative, and high-impact.
    `.trim();

    // Map messages to ensure compatibility with ModelMessage schema
    const coreMessages = messages.map((m: any) => ({
      role: m.role === 'user' || m.role === 'assistant' || m.role === 'system' ? m.role : 'user',
      content: m.content || (Array.isArray(m.parts) ? m.parts[0]?.text : "") || "",
    }));

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages: coreMessages,
      system: systemPrompt,
    });

    // Use toTextStreamResponse as fallback if toDataStreamResponse is still erroring in this environment
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("GROQ CHAT ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to generate response",
      details: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
