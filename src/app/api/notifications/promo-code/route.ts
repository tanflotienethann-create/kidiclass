import { NextResponse } from "next/server";
import {
  escapeHtml,
  sendBrevoEmail,
  verifyAdminRequest,
} from "@/lib/server/notifications";
import { SITE_URL } from "@/lib/site";

type PromoNotificationBody = {
  code?: string;
  percentage?: number;
};

type ClientEmailProfile = {
  email: string | null;
  full_name: string | null;
};

export async function POST(request: Request) {
  const verification = await verifyAdminRequest(request);
  if (!verification.authorized) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.status },
    );
  }

  let body: PromoNotificationBody;
  try {
    body = (await request.json()) as PromoNotificationBody;
  } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const code = body.code?.trim().toUpperCase() || "";
  const percentage = Number(body.percentage);
  if (!code || !Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
    return NextResponse.json(
      { error: "Code promo ou pourcentage invalide." },
      { status: 400 },
    );
  }

  const { data: profiles, error: profilesError } = await verification.supabase
    .from("profiles")
    .select("email,full_name")
    .eq("role", "client")
    .not("email", "is", null);

  if (profilesError) {
    return NextResponse.json(
      { error: "Impossible de charger les emails des clients." },
      { status: 500 },
    );
  }

  const clientProfiles = (profiles || []) as ClientEmailProfile[];
  const recipients = clientProfiles
    .filter((profile) => Boolean(profile.email))
    .map((profile) => ({
      email: String(profile.email),
      name: profile.full_name ? String(profile.full_name) : undefined,
    }));
  const safeCode = escapeHtml(code);
  const safePercentage = escapeHtml(String(percentage));
  const catalogueUrl = `${SITE_URL}/catalogue`;

  const htmlContent = `<!doctype html>
  <html lang="fr">
    <body style="margin:0;background:#f7fbfb;font-family:Arial,sans-serif;color:#17324d">
      <div style="max-width:620px;margin:0 auto;padding:28px 16px">
        <div style="overflow:hidden;border:1px solid #d7eeee;border-radius:18px;background:#ffffff">
          <div style="padding:28px;text-align:center;background:#087f83;border-bottom:6px solid #f36f45">
            <div style="font-size:38px;font-weight:900;line-height:1">
              <span style="color:#12a7ae">Kidi</span><span style="color:#ff6b00">Class</span>
            </div>
            <p style="margin:10px 0 0;color:#ffffff;font-size:14px;font-weight:700">Les enfants sapés comme jamais...</p>
          </div>
          <div style="padding:34px 28px;text-align:center">
            <p style="margin:0;color:#f36f45;font-size:13px;font-weight:900;text-transform:uppercase">Une surprise pour vous</p>
            <h1 style="margin:12px 0 10px;font-size:30px;line-height:1.2;color:#17324d">Profitez de ${safePercentage}% de remise</h1>
            <p style="margin:0 auto 24px;max-width:450px;color:#5f6f7f;font-size:16px;line-height:1.6">Utilisez ce code lors de votre prochaine commande KidiClass.</p>
            <div style="display:inline-block;border:2px dashed #12a7ae;border-radius:12px;background:#e9fbfc;padding:16px 28px;color:#087f83;font-size:26px;font-weight:900;letter-spacing:2px">${safeCode}</div>
            <div style="margin-top:28px">
              <a href="${catalogueUrl}" style="display:inline-block;border-radius:999px;background:#f36f45;padding:14px 26px;color:#ffffff;font-size:15px;font-weight:900;text-decoration:none">Découvrir la boutique</a>
            </div>
          </div>
          <div style="border-top:1px solid #e5eeee;padding:18px 28px;text-align:center;color:#687887;font-size:12px;line-height:1.5">
            KidiClass • 0779311555
          </div>
        </div>
      </div>
    </body>
  </html>`;

  const result = await sendBrevoEmail({
    recipients,
    subject: `${percentage}% de remise chez KidiClass avec le code ${code}`,
    htmlContent,
    textContent: `Profitez de ${percentage}% de remise chez KidiClass avec le code ${code}. Boutique : ${catalogueUrl}`,
  });

  if (!result.sent) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({
    sent: true,
    recipientCount: result.recipientCount || 0,
  });
}
