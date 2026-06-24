import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AdminAccessCache = {
  userId: string;
  isAdmin: boolean;
  expiresAt: number;
};

let adminAccessCache: AdminAccessCache | null = null;

export async function getSessionUser(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user || null;
}

export async function checkAdminAccess(user?: User | null) {
  const currentUser = user === undefined ? await getSessionUser() : user;

  if (!currentUser) {
    adminAccessCache = null;
    return { user: null, isAdmin: false };
  }

  if (
    adminAccessCache?.userId === currentUser.id &&
    adminAccessCache.expiresAt > Date.now()
  ) {
    return { user: currentUser, isAdmin: adminAccessCache.isAdmin };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .maybeSingle();

  const isAdmin = !error && profile?.role === "admin";

  adminAccessCache = {
    userId: currentUser.id,
    isAdmin,
    expiresAt: Date.now() + 60_000,
  };

  return { user: currentUser, isAdmin };
}

export function clearAdminAccessCache() {
  adminAccessCache = null;
}
