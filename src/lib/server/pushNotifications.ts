import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import webpush, { type PushSubscription } from "web-push";

export type AdminPushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

type StoredPushSubscription = {
  id?: string;
  endpoint: string | null;
  subscription: PushSubscription | string | null;
};

let configuredVapidPublicKey = "";

export function getVapidPublicKey() {
  return (
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    process.env.VAPID_PUBLIC_KEY ||
    ""
  ).trim();
}

export function getPushSetupError() {
  if (!getVapidPublicKey() || !process.env.VAPID_PRIVATE_KEY) {
    return "Les clés VAPID ne sont pas encore configurées.";
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return "L'URL Supabase est manquante.";
  }

  if (!getSupabaseServerKey()) {
    return "La clé serveur Supabase est manquante.";
  }

  return "";
}

function getSupabaseServerKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ""
  ).trim();
}

export function getSupabaseServiceClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = getSupabaseServerKey();

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function configureWebPush() {
  const setupError = getPushSetupError();
  if (setupError) {
    return { configured: false as const, error: setupError };
  }

  const publicKey = getVapidPublicKey();

  if (configuredVapidPublicKey !== publicKey) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:contact@kidiclass.com",
      publicKey,
      process.env.VAPID_PRIVATE_KEY || "",
    );
    configuredVapidPublicKey = publicKey;
  }

  return { configured: true as const };
}

function parseSubscription(
  storedSubscription: StoredPushSubscription["subscription"],
) {
  if (!storedSubscription) return null;

  if (typeof storedSubscription === "string") {
    try {
      return JSON.parse(storedSubscription) as PushSubscription;
    } catch {
      return null;
    }
  }

  return storedSubscription;
}

export async function sendAdminPushNotification(payload: AdminPushPayload) {
  const pushConfig = configureWebPush();
  if (!pushConfig.configured) {
    return { sent: 0, error: pushConfig.error };
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return { sent: 0, error: "Configuration Supabase serveur manquante." };
  }

  const { data, error } = await supabase
    .from("admin_push_subscriptions")
    .select("id,endpoint,subscription");

  if (error) {
    return { sent: 0, error: error.message };
  }

  const subscriptions = ((data || []) as StoredPushSubscription[]).filter(
    (subscription) => subscription.endpoint && subscription.subscription,
  );

  let sent = 0;

  await Promise.all(
    subscriptions.map(async (storedSubscription) => {
      const subscription = parseSubscription(storedSubscription.subscription);
      if (!subscription || !storedSubscription.endpoint) return;

      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url || "/admin/commandes",
            tag: payload.tag || "kidiclass-admin",
            icon: "/icon-192.png?v=8",
            badge: "/icon-96.png?v=8",
          }),
        );
        sent += 1;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;

        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from("admin_push_subscriptions")
            .delete()
            .eq("endpoint", storedSubscription.endpoint);
        }
      }
    }),
  );

  return { sent, error: "" };
}
