/**
 * send-otp — Edge Function placeholder for OTP via SMS (Twilio/Vonage/etc.)
 * 
 * Accepts: POST { phone: string, locale?: "fr" | "ar" }
 * Returns: { success: true, message: "OTP sent" }
 * 
 * TODO: Wire up real SMS provider (Twilio, Vonage, etc.)
 * The OTP code is stored in a `otp_codes` table with a 5-minute TTL.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { phone, locale = "fr" } = await req.json();

    if (!phone || typeof phone !== "string" || phone.length < 8) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Upsert OTP code (replace existing for same phone)
    const { error: dbError } = await supabase
      .from("otp_codes")
      .upsert(
        { phone, code, expires_at: expiresAt, verified: false },
        { onConflict: "phone" }
      );

    if (dbError) {
      console.error("OTP DB error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── TODO: Send SMS via provider ──
    // const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    // const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    // const TWILIO_FROM = Deno.env.get("TWILIO_PHONE_NUMBER");
    // const message = locale === "ar"
    //   ? `رمز التحقق الخاص بك هو: ${code}`
    //   : `Votre code de vérification Medicare est : ${code}`;
    // await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    //   method: "POST",
    //   headers: { Authorization: `Basic ${btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
    //   body: new URLSearchParams({ To: phone, From: TWILIO_FROM!, Body: message }),
    // });

    console.log(`[DEV] OTP for ${phone}: ${code}`);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent", _dev_code: code }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-otp error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
