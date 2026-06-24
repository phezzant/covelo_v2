/**
 * send-invite-email
 *
 * Supabase Edge Function — triggered by a Postgres webhook on
 * INSERT INTO journey_partner WHERE status = 'pending'.
 *
 * Setup in Supabase dashboard:
 *   Database → Webhooks → Create webhook
 *   Table: journey_partner
 *   Events: INSERT
 *   Type: Supabase Edge Function
 *   Function: send-invite-email
 *
 * Required env vars (set in Supabase project secrets):
 *   RESEND_API_KEY   — from resend.com
 *   SITE_URL         — e.g. https://covelo.co
 *
 * Resend free tier: 3,000 emails/month, 100/day. Sufficient for early-stage.
 * Alternative: swap the Resend call for any SMTP/sendgrid/postmark call.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: {
    id: string;
    invited_email: string | null;
    invited_name: string | null;
    child_id: string | null;
    adult_id: string | null;
    initiated_by: string;
    status: string;
  };
}

serve(async (req: Request) => {
  // Supabase sends a POST with JSON body
  const payload: WebhookPayload = await req.json();

  if (payload.type !== "INSERT" || payload.record.status !== "pending") {
    return new Response("skipped", { status: 200 });
  }

  const { id, invited_email, invited_name, initiated_by } = payload.record;
  if (!invited_email) {
    return new Response("no invited_email — skipping", { status: 200 });
  }

  const siteUrl = Deno.env.get("SITE_URL") ?? "https://covelo.co";
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("RESEND_API_KEY not set");
    return new Response("missing api key", { status: 500 });
  }

  const isChildInvitingAdult = initiated_by === "child_invited_adult";
  const inviteLink = `${siteUrl}/signup?invite=${id}&email=${encodeURIComponent(invited_email)}`;

  const subject = isChildInvitingAdult
    ? `${invited_name ?? "Someone"} wants you as their Investment Partner on Covelo`
    : `You've been invited to join Covelo`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px 24px;">
      <h1 style="font-size: 24px; margin-bottom: 8px;">
        ${isChildInvitingAdult ? "You've been invited! 🎉" : "Join Covelo"}
      </h1>
      <p style="color: #666; margin-bottom: 24px;">
        ${
          isChildInvitingAdult
            ? `<strong>${invited_name ?? "A young investor"}</strong> has chosen you as their Investment Partner on Covelo — a paper-trading game that teaches kids about investing.`
            : `You've been invited to join Covelo as a young investor.`
        }
      </p>
      <a href="${inviteLink}"
         style="display: inline-block; background: #D4A843; color: #1a1a1a; font-weight: 600;
                padding: 12px 28px; border-radius: 999px; text-decoration: none; font-size: 15px;">
        Accept invite &amp; join Covelo
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 32px;">
        If you weren't expecting this, you can ignore it. This invite expires in 14 days.
      </p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Covelo <hello@covelo.co>",
      to: [invited_email],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend error:", body);
    return new Response("email send failed", { status: 500 });
  }

  return new Response("sent", { status: 200 });
});
