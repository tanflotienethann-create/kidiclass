import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server/notifications";
import {
  getPushSetupError,
  getSupabaseServiceClient,
} from "@/lib/server/pushNotifications";

export const runtime = "nodejs";

type SubscribeBody = {
  subscription?: {
    endpoint?: string;
    expirationTime?: number | null;
    keys?: Record<string, string>;
  };
};

export async function POST(request: Request) {
  const verification = await verifyAdminRequest(request);

  if (!verification.authorized) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.status },
    );
  }

  const setupError = getPushSetupError();
  if (setupError) {
    return NextResponse.json({ error: setupError }, { status: 503 });
  }

  let body: SubscribeBody;

  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return NextResponse.json(
      { error: "Abonnement notification invalide." },
      { status: 400 },
    );
  }

  const subscription = body.subscription;

  if (!subscription?.endpoint || !subscription.keys?.auth || !subscription.keys?.p256dh) {
    return NextResponse.json(
      { error: "Données de notification incomplètes." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Configuration Supabase serveur manquante." },
      { status: 500 },
    );
  }

  const { error } = await supabase.from("admin_push_subscriptions").upsert(
    [
      {
        admin_user_id: verification.user.id,
        endpoint: subscription.endpoint,
        subscription,
        user_agent: request.headers.get("user-agent") || "",
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "endpoint" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscribed: true });
}
