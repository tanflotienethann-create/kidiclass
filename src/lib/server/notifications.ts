import "server-only";

import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

type AdminVerification =
  | { authorized: true; supabase: SupabaseClient; user: User }
  | { authorized: false; status: number; error: string };

type BrevoEmail = {
  email: string;
  name?: string | null;
};

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
}

export async function verifyAdminRequest(
  request: Request,
): Promise<AdminVerification> {
  const token = getBearerToken(request);
  if (!token) {
    return { authorized: false, status: 401, error: "Session administrateur manquante." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return { authorized: false, status: 500, error: "Configuration Supabase manquante." };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return { authorized: false, status: 401, error: "Session administrateur invalide." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { authorized: false, status: 403, error: "Accès administrateur requis." };
  }

  return { authorized: true, supabase, user: userData.user };
}

export function normalizeSmsRecipient(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = `225${digits}`;
  }
  return digits ? `+${digits}` : "";
}

export async function sendBrevoSms(recipient: string, content: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { sent: false, error: "Le service SMS n’est pas encore configuré." };
  }

  const response = await fetch(
    "https://api.brevo.com/v3/transactionalSMS/sms",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: process.env.BREVO_SMS_SENDER || "KidiClass",
        recipient,
        content,
        type: "transactional",
        unicodeEnabled: true,
      }),
    },
  );

  if (!response.ok) {
    return { sent: false, error: "Brevo a refusé l’envoi du SMS." };
  }

  return { sent: true, error: "" };
}

export async function sendBrevoEmail({
  recipients,
  subject,
  htmlContent,
  textContent,
}: {
  recipients: BrevoEmail[];
  subject: string;
  htmlContent: string;
  textContent: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) {
    return { sent: false, error: "Le service email n’est pas encore configuré." };
  }

  if (recipients.length === 0) {
    return { sent: true, error: "", recipientCount: 0 };
  }

  const batches: BrevoEmail[][] = [];
  for (let index = 0; index < recipients.length; index += 45) {
    batches.push(recipients.slice(index, index + 45));
  }

  for (const batch of batches) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "KidiClass",
          email: senderEmail,
        },
        to: [{ name: "KidiClass", email: senderEmail }],
        bcc: batch.map((recipient) => ({
          email: recipient.email,
          name: recipient.name || undefined,
        })),
        subject,
        htmlContent,
        textContent,
      }),
    });

    if (!response.ok) {
      return { sent: false, error: "Brevo a refusé l’envoi de l’email." };
    }
  }

  return { sent: true, error: "", recipientCount: recipients.length };
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
