/**
 * Server-only DeepSeek AI configuration.
 * The key lives in DEEPSEEK_API_KEY (server-side only — never NEXT_PUBLIC_).
 * The AI features stay disabled until a real key is provided.
 */
export function getDeepSeekKey(): string | null {
  const key = process.env.DEEPSEEK_API_KEY?.trim();
  if (!key || key === "" || key.startsWith("sk-...")) return null;
  return key;
}

export function isDeepSeekConfigured(): boolean {
  return getDeepSeekKey() !== null;
}
