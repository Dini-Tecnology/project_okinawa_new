import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { EMBEDDED_LOGO_DATA_URI } from "./embedded-logo.ts";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://noowebr.com",
  "https://www.noowebr.com",
];

const DEFAULT_REDIRECT_ALLOW_LIST = [
  "okinawa-restaurant://auth/callback",
  "okinawa-client://auth/callback",
  "https://noowebr.com/auth/callback",
  "https://www.noowebr.com/auth/callback",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** NOOWE Restaurant app palette (platform/mobile/apps/restaurant/src/theme) */
const RESTAURANT_BRAND = {
  primary: "#A855F7",
  primaryDark: "#9333EA",
  primaryLight: "#C084FC",
  secondary: "#FF6B35",
  logoBg: "#FFF3EE",
  text: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  surface: "#FFFFFF",
  background: "#F9FAFB",
  border: "#E5E7EB",
  appLabel: "app NOOWE Restaurant",
  defaultLogoUrl: "https://noowebr.com/email/logo-restaurant.png",
} as const;

/** NOOWE Client app palette (shared theme) */
const CLIENT_BRAND = {
  primary: "#EA580C",
  primaryDark: "#C2410C",
  primaryLight: "#F59E0B",
  secondary: "#FF6B35",
  logoBg: "#FFF7ED",
  text: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  surface: "#FFFFFF",
  background: "#F9FAFB",
  border: "#E5E7EB",
  appLabel: "app NOOWE",
  defaultLogoUrl: "https://noowebr.com/email/logo-client.png",
} as const;

type EmailBrand = typeof RESTAURANT_BRAND;

function resolveEmailBrand(emailRedirectTo: string): EmailBrand {
  if (emailRedirectTo.includes("okinawa-client")) {
    return CLIENT_BRAND;
  }
  return RESTAURANT_BRAND;
}

function resolveLogoUrl(emailRedirectTo: string) {
  const configured = Deno.env.get("EMAIL_LOGO_URL");
  if (configured) return configured;

  const restaurantLogo = Deno.env.get("EMAIL_LOGO_URL_RESTAURANT");
  const clientLogo = Deno.env.get("EMAIL_LOGO_URL_CLIENT");
  const hostedLogo = emailRedirectTo.includes("okinawa-client") ? clientLogo : restaurantLogo;
  if (hostedLogo) return hostedLogo;

  return EMBEDDED_LOGO_DATA_URI;
}

function buildSignupConfirmationEmailHtml(params: {
  fullName: string;
  actionLink: string;
  brand: EmailBrand;
  logoUrl: string;
}) {
  const safeName = escapeHtml(params.fullName || "tudo bem");
  const safeActionLink = escapeHtml(params.actionLink);
  const safeLogoUrl = escapeHtml(params.logoUrl);
  const year = new Date().getFullYear();
  const { brand } = params;
  const buttonShadow = brand.primary === RESTAURANT_BRAND.primary
    ? "0 10px 24px rgba(168,85,247,0.28)"
    : "0 10px 24px rgba(234,88,12,0.28)";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme sua conta NOOWE</title>
</head>
<body style="margin:0;padding:0;background:${brand.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${brand.surface};border-radius:16px;overflow:hidden;border:1px solid ${brand.border};box-shadow:0 8px 30px rgba(17,24,39,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg, ${brand.primaryDark} 0%, ${brand.primary} 55%, ${brand.primaryLight} 100%);padding:28px 24px 24px;text-align:center;">
              <div style="display:inline-block;background:${brand.logoBg};border-radius:14px;padding:14px 18px;box-shadow:0 4px 14px rgba(0,0,0,0.08);">
                <img src="${safeLogoUrl}" alt="NOOWE" width="72" style="display:block;width:72px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;" />
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 28px;text-align:center;">
              <p style="margin:0 0 10px;color:${brand.text};font-size:18px;line-height:1.4;font-weight:600;">
                Olá, <span style="color:${brand.primaryDark};">${safeName}</span>!
              </p>
              <p style="margin:0 0 28px;color:${brand.textSecondary};font-size:15px;line-height:1.6;">
                Confirme seu e-mail para ativar sua conta no ${escapeHtml(brand.appLabel)}.
              </p>
              <a href="${safeActionLink}" style="display:inline-block;background:${brand.primary};color:#ffffff;text-decoration:none;border-radius:12px;padding:15px 28px;font-size:15px;font-weight:700;box-shadow:${buttonShadow};">
                Confirmar minha conta
              </a>
              <p style="margin:28px 0 0;color:${brand.textMuted};font-size:12px;line-height:1.6;">
                Se o botão não funcionar, copie e cole este link no navegador:
              </p>
              <p style="margin:8px 0 0;color:${brand.textSecondary};font-size:12px;line-height:1.6;word-break:break-all;">
                ${safeActionLink}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px 24px;border-top:1px solid ${brand.border};text-align:center;background:${brand.background};">
              <p style="margin:0 0 6px;color:${brand.textMuted};font-size:11px;line-height:1.5;">
                Você recebeu este e-mail porque criou uma conta na NOOWE.
              </p>
              <p style="margin:0;color:${brand.textMuted};font-size:11px;line-height:1.5;">
                © ${year} NOOWE · <span style="color:${brand.secondary};">Experiência gastronômica reinventada</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

type SupabaseAdmin = ReturnType<typeof createClient>;

function getAllowedOrigins() {
  const configured = Deno.env.get("ALLOWED_ORIGINS");
  if (!configured) return DEFAULT_ALLOWED_ORIGINS;
  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getRedirectAllowList() {
  const configured = Deno.env.get("AUTH_REDIRECT_ALLOW_LIST");
  if (!configured) return DEFAULT_REDIRECT_ALLOW_LIST;
  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin: string | null) {
  if (!origin) return true;
  return getAllowedOrigins().includes(origin);
}

function isAllowedRedirect(url: string) {
  return getRedirectAllowList().some((allowed) => url === allowed || url.startsWith(`${allowed}?`));
}

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const fallbackOrigin = getAllowedOrigins()[0] ?? "https://noowebr.com";
  return {
    "Access-Control-Allow-Origin": origin && isAllowedOrigin(origin) ? origin : fallbackOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function jsonResponse(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getClientIp(req: Request) {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function enforceRateLimit(
  supabase: SupabaseAdmin,
  req: Request,
  action: string,
  identity: string,
  limit: number,
  windowSeconds: number,
) {
  const key = await sha256(`${action}:${getClientIp(req)}:${identity}`);
  const now = new Date();
  const { data, error } = await supabase
    .from("edge_rate_limits")
    .select("window_start, request_count")
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    const windowStart = new Date(data.window_start);
    const inWindow = now.getTime() - windowStart.getTime() < windowSeconds * 1000;
    if (inWindow && data.request_count >= limit) {
      return false;
    }

    const { error: updateError } = await supabase
      .from("edge_rate_limits")
      .update({
        window_start: inWindow ? data.window_start : now.toISOString(),
        request_count: inWindow ? data.request_count + 1 : 1,
        updated_at: now.toISOString(),
      })
      .eq("key", key);
    if (updateError) throw updateError;
    return true;
  }

  const { error: insertError } = await supabase.from("edge_rate_limits").insert({
    key,
    window_start: now.toISOString(),
    request_count: 1,
    updated_at: now.toISOString(),
  });
  if (insertError) throw insertError;
  return true;
}

function createSupabaseAdmin() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase admin environment is not configured");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function sendConfirmationEmail(params: {
  email: string;
  fullName: string;
  actionLink: string;
  emailRedirectTo: string;
}) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const from = Deno.env.get("RESEND_FROM_EMAIL") ?? "NOOWE <notification@noowebr.com>";
  const brand = resolveEmailBrand(params.emailRedirectTo);
  const logoUrl = resolveLogoUrl(params.emailRedirectTo);
  const html = buildSignupConfirmationEmailHtml({
    fullName: params.fullName,
    actionLink: params.actionLink,
    brand,
    logoUrl,
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.email],
      subject: "Confirme sua conta NOOWE",
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Resend error:", details);
    throw new Error("Failed to send confirmation email");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req) });
  }

  if (!isAllowedOrigin(req.headers.get("origin"))) {
    return jsonResponse(req, { error: "Origin is not allowed" }, 403);
  }

  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed" }, 405);
  }

  try {
    const payload = await req.json().catch(() => null);
    const email = normalizeEmail(payload?.email);
    const password = typeof payload?.password === "string" ? payload.password : "";
    const fullName = sanitizeText(payload?.fullName ?? payload?.full_name, 120);
    const emailRedirectTo = typeof payload?.emailRedirectTo === "string" ? payload.emailRedirectTo : "";

    if (!EMAIL_REGEX.test(email) || password.length < 6 || !fullName || !isAllowedRedirect(emailRedirectTo)) {
      return jsonResponse(req, { error: "Invalid registration payload" }, 400);
    }

    const supabase = createSupabaseAdmin();
    const allowed = await enforceRateLimit(supabase, req, "register-with-resend", email, 3, 15 * 60);
    if (!allowed) {
      return jsonResponse(req, { error: "Too many requests" }, 429);
    }

    if (!Deno.env.get("RESEND_API_KEY")) {
      return jsonResponse(req, { error: "RESEND_API_KEY is not configured" }, 500);
    }

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        redirectTo: emailRedirectTo,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error("Supabase generateLink error:", error);
      return jsonResponse(req, { error: error.message || "Failed to create confirmation link" }, 400);
    }

    if (!data.properties?.action_link) {
      console.error("Supabase generateLink did not return action_link");
      return jsonResponse(req, { error: "Failed to create confirmation link" }, 500);
    }

    try {
      await sendConfirmationEmail({
        email,
        fullName,
        actionLink: data.properties.action_link,
        emailRedirectTo,
      });
    } catch (emailError) {
      if (data.user?.id) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id);
        if (deleteError) {
          console.error("Failed to roll back user after email error:", deleteError);
        }
      }
      throw emailError;
    }

    return jsonResponse(req, {
      success: true,
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      needsEmailConfirmation: true,
    });
  } catch (err) {
    console.error("Error:", err);
    return jsonResponse(req, { error: "Internal server error" }, 500);
  }
});
