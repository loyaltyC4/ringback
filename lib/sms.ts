import { SMS_LIVE, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } from "@/lib/env";

/**
 * One helper for every outbound confirmation text. Silently no-ops until the
 * three Twilio env vars exist — booking still succeeds, it just doesn't text
 * anyone yet, which is honest for an install mid-setup.
 */
export async function sendSms(to: string, body: string): Promise<{ ok: boolean; reason?: string }> {
  if (!SMS_LIVE) return { ok: false, reason: "sms_not_configured" };

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: TWILIO_FROM_NUMBER, Body: body }),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, reason: `twilio_${res.status}:${text.slice(0, 200)}` };
  }
  return { ok: true };
}
