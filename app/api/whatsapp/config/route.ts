import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isEmbeddedSignupConfigured, getEmbeddedSignupConfig } from '@/lib/whatsapp';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const cfg = getEmbeddedSignupConfig();
  if (!cfg || !isEmbeddedSignupConfigured()) {
    return NextResponse.json(
      { error: 'NOT_CONFIGURED', message: 'WhatsApp connection is not available yet. The platform is being set up — try again shortly.' },
      { status: 503 }
    );
  }
  return NextResponse.json({ appId: cfg.appId, configId: cfg.configId });
}