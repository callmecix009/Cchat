import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { chatWithAI, type ChatMessage } from "@/lib/ai-service";
import { checkRateLimit, getClientIp, rateLimitedResponse, RL_CHAT } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Per-IP pre-auth limit (cost protection even if auth fails)
  {
    const ip = getClientIp(req);
    const rl = checkRateLimit({ key: `chat:ip:${ip}`, limit: RL_CHAT.limit, windowMs: RL_CHAT.windowMs });
    if (!rl.success) return rateLimitedResponse(rl);
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Per-user limit (stricter, prevents one account burning credits)
  {
    const rl = checkRateLimit({ key: `chat:user:${userId}`, limit: RL_CHAT.limit, windowMs: RL_CHAT.windowMs });
    if (!rl.success) return rateLimitedResponse(rl);
  }

  let body: { messages?: ChatMessage[]; mode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const msgs = body?.messages;
  if (!Array.isArray(msgs) || msgs.length === 0) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  const mode = body?.mode === "general" ? ("general" as const) : ("business" as const);

  const trimmed = msgs.slice(-20).map((m) => ({
    role: m.role === "user" ? ("user" as const) : m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: String(m.content || "").slice(0, 2000),
  }));

  const result = await chatWithAI(userId, trimmed, { mode });

  if (result.error === "DEEPSEEK_NOT_CONFIGURED") {
    return NextResponse.json(
      { error: "AI not configured. Add DEEPSEEK_API_KEY to your environment." },
      { status: 503 }
    );
  }

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ reply: result.reply });
}
