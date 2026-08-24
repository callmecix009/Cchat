/**
 * Server-only Pesapal configuration.
 * Reads credentials from environment variables — never hard-code secrets here.
 *
 * Required in .env.local (dev) or hosting env vars (production):
 *   PESAPAL_CONSUMER_KEY
 *   PESAPAL_CONSUMER_SECRET
 *   PESAPAL_ENVIRONMENT=sandbox|live
 *   PESAPAL_CALLBACK_URL   (where the customer lands after paying)
 *
 * Do NOT prefix these with NEXT_PUBLIC_ — they must stay server-side.
 */
export type PesapalConfig = {
  consumerKey: string;
  consumerSecret: string;
  environment: "sandbox" | "live";
  callbackUrl: string;
};

export function getPesapalConfig(): PesapalConfig | null {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY?.trim();
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET?.trim();
  const environment = (process.env.PESAPAL_ENVIRONMENT?.trim() || "sandbox") as "sandbox" | "live";
  const callbackUrl = process.env.PESAPAL_CALLBACK_URL?.trim();

  if (!consumerKey || !consumerSecret) return null;

  return {
    consumerKey,
    consumerSecret,
    environment: environment === "live" ? "live" : "sandbox",
    callbackUrl: callbackUrl || "",
  };
}

export function isPesapalConfigured(): boolean {
  return getPesapalConfig() !== null;
}
