import { createHmac, timingSafeEqual } from "crypto";
import { RETELL_API_KEY } from "@/lib/env";

/**
 * Retell signs every webhook with an HMAC-SHA256 over the exact raw request
 * body, keyed by your API key, delivered in the `x-retell-signature` header.
 * Verifying against the raw text (not the re-serialised JSON) matters — a
 * round-tripped JSON.stringify can reorder keys and break the signature.
 */
export function verifyRetellSignature(rawBody: string, signature: string | null): boolean {
  if (!RETELL_API_KEY || !signature) return false;
  const expected = createHmac("sha256", RETELL_API_KEY).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** the fields every one of our three webhook handlers actually needs */
export type RetellCallPayload = {
  event: "call_started" | "call_ended" | "call_analyzed";
  call: {
    call_id: string;
    agent_id?: string;
    from_number?: string;
    to_number?: string;
    call_status?: string;
    start_timestamp?: number;
    end_timestamp?: number;
    duration_ms?: number;
    recording_url?: string;
    transcript?: string;
    transcript_object?: Array<{ role: string; content: string }>;
    call_analysis?: {
      call_summary?: string;
      user_sentiment?: string;
      call_successful?: boolean;
      custom_analysis_data?: Record<string, unknown>;
    };
    metadata?: { tenant?: string; caller_name?: string; suburb?: string };
  };
};
