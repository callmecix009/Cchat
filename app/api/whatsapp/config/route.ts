import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isEmbeddedSignupConfigured, getEmbeddedSignupConfig } from '@/lib/whatsapp';
import { checkRateLimit, getClientIp, rateLimitedResponse, RL_INBOX } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rlIp = checkRateLimit({ key: `wa:config:ip:${ip}`, limit: RL_INBOX.limit, windowMs: RL_INBOX.windowMs });
  if (!rlIp.success) return rateLimitedResponse(rlIp);

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rlUser = checkRateLimit({ key: `wa:config:user:${userId}`, limit: RL_INBOX.limit, windowMs: RL_INBOX.windowMs });
  if (!rlUser.success) return rateLimitedResponse(rlUser);
  const cfg = getEmbeddedSignupConfig();
  if (!cfg || !isEmbeddedSignupConfigured()) {
    return NextResponse.json(
      { error: 'NOT_CONFIGURED', message: 'WhatsApp connection is not available yet. The platform is being set up — try again shortly.' },
      { status: 503 }
    );
  }
  return NextResponse.json({ appId: cfg.appId, configId: cfg.configId });
}