import { createHmac, timingSafeEqual } from 'crypto';

const GRAPH = 'https://graph.facebook.com/v21.0';

export function isEmbeddedSignupConfigured() {
  return !!(
    process.env.META_APP_ID &&
    process.env.META_APP_SECRET &&
    process.env.META_CONFIG_ID &&
    process.env.META_WEBHOOK_VERIFY_TOKEN
  );
}

export function getEmbeddedSignupConfig(): { appId: string; configId: string } | null {
  if (!process.env.META_APP_ID || !process.env.META_CONFIG_ID) return null;
  return { appId: process.env.META_APP_ID, configId: process.env.META_CONFIG_ID };
}

export function normalizeWhatsAppNumber(raw: string) {
  let digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '255' + digits.slice(1);
  return digits;
}

/**
 * Exchanges the authorization code from the WhatsApp Business Embedded Signup
 * popup for a long-lived token + the customer's WABA / phone number info.
 * Everything is stored per-user — nothing is shared or global.
 */
export async function exchangeAuthCode(authorizationCode: string) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) throw new Error('META_NOT_CONFIGURED');

  const short = await fetch(`${GRAPH}/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: appId,
      client_secret: appSecret,
      code: authorizationCode,
      redirect_uri: '',
    }),
  });
  if (!short.ok) {
    const detail = await short.text().catch(() => '');
    throw new Error('CODE_EXCHANGE_FAILED: ' + detail.slice(0, 300));
  }
  const shortJson = await short.json();
  const shortToken: string = shortJson.access_token;
  if (!shortToken) throw new Error('CODE_EXCHANGE_FAILED: no access_token');

  let wabaId: string | null = null;
  let phoneNumberId: string | null = null;
  let displayPhoneNumber: string | null = null;
  const data = Array.isArray(shortJson.data) ? shortJson.data : [];
  const first = data[0] as Record<string, unknown> | undefined;
  if (first && typeof first.whatsapp_business_account_id === 'string') {
    wabaId = first.whatsapp_business_account_id;
    if (typeof first.phone_number_id === 'string') phoneNumberId = first.phone_number_id;
    if (typeof first.phone_number === 'string') displayPhoneNumber = first.phone_number;
  }

  const long = await fetch(
    `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${encodeURIComponent(shortToken)}`
  );
  if (!long.ok) {
    const detail = await long.text().catch(() => '');
    throw new Error('TOKEN_EXCHANGE_FAILED: ' + detail.slice(0, 300));
  }
  const longJson = await long.json();
  const longToken: string = longJson.access_token;
  if (!longToken) throw new Error('TOKEN_EXCHANGE_FAILED: no access_token');

  if (!wabaId) {
    const debug = await fetch(
      `${GRAPH}/debug_token?input_token=${encodeURIComponent(longToken)}&access_token=${appId}|${appSecret}`
    );
    if (debug.ok) {
      const debugJson = await debug.json();
      const scopes: { scope?: string; target_ids?: string[] }[] = debugJson?.data?.granular_scopes ?? [];
      const waScope = scopes.find((s) => (s.scope || '').includes('whatsapp_business'));
      if (waScope?.target_ids?.length) wabaId = waScope.target_ids[0];
    }
  }

  if (!wabaId) {
    const apps = await fetch(
      `${GRAPH}/${appId}/whatsapp_business_accounts?access_token=${encodeURIComponent(longToken)}`
    );
    if (apps.ok) {
      const appsJson = await apps.json();
      if (appsJson?.data?.length && typeof appsJson.data[0].id === 'string') {
        wabaId = appsJson.data[0].id;
      }
    }
  }

  if (!wabaId) throw new Error('NO_WABA');

  if (!phoneNumberId) {
    const nums = await fetch(
      `${GRAPH}/${wabaId}/phone_numbers?access_token=${encodeURIComponent(longToken)}`
    );
    if (!nums.ok) {
      const detail = await nums.text().catch(() => '');
      throw new Error('PHONE_FETCH_FAILED: ' + detail.slice(0, 300));
    }
    const numsJson = await nums.json();
    const num = (numsJson?.data ?? [])[0] as
      | { id?: string; display_phone_number?: string; verified_name?: string }
      | undefined;
    if (num?.id) {
      phoneNumberId = num.id;
      displayPhoneNumber = displayPhoneNumber || num.display_phone_number || null;
    }
  }

  if (!phoneNumberId || !displayPhoneNumber) throw new Error('NO_PHONE_NUMBER');

  return {
    accessToken: longToken,
    wabaId,
    phoneNumberId,
    displayPhoneNumber,
  };
}

export async function sendWhatsAppText(
  accessToken: string,
  phoneNumberId: string,
  to: string,
  text: string
) {
  const res = await fetch(`${GRAPH}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalizeWhatsAppNumber(to),
      type: 'text',
      text: { body: text },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error('WHATSAPP_SEND_FAILED' + (detail ? ': ' + detail.slice(0, 300) : ''));
  }
  return res.json();
}

export function verifyMetaSignature(rawBody: string, signature: string | null | undefined) {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = signature.replace(/^sha256=/, '');
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function webhookVerifyToken() {
  return process.env.META_WEBHOOK_VERIFY_TOKEN || '';
}