import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, restaurant, email, phone } = await req.json();

    if (!name || !restaurant || !email) {
      return new Response(
        JSON.stringify({ error: "name, restaurant and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessCode = generateCode();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase.from("demo_leads").insert({
      name,
      restaurant,
      email,
      phone: phone || null,
      access_code: accessCode,
    });

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save lead" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NOOWE <notification@noowebr.com>",
        to: [email],
        subject: "Seu código de acesso à demo NOOWE",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:#0A1628;padding:32px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:28px;margin:0;font-weight:700;letter-spacing:-0.5px;">NOOWE</h1>
    </div>
    <div style="padding:40px 32px;text-align:center;">
      <p style="color:#374151;font-size:16px;margin:0 0 8px;">Olá, <strong>${name}</strong>!</p>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px;line-height:1.5;">
        Seu código de acesso para explorar a demo da NOOWE está pronto:
      </p>
      <div style="background:#f0f4ff;border-radius:12px;padding:24px;margin:0 0 32px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#0A1628;">${accessCode}</span>
      </div>
      <p style="color:#9ca3af;font-size:13px;margin:0;line-height:1.5;">
        Acesse <a href="https://noowebr.com/access" style="color:#3b82f6;text-decoration:none;font-weight:600;">noowebr.com/access</a> e insira o código acima.
      </p>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="color:#d1d5db;font-size:11px;margin:0;">© ${new Date().getFullYear()} NOOWE · Transformando experiências gastronômicas</p>
    </div>
  </div>
</body>
</html>`,
      }),
    });

    if (!emailRes.ok) {
      const emailError = await emailRes.text();
      console.error("Resend error:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
