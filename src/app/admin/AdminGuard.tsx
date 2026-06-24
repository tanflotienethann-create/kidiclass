"use client";

import { useEffect, useState } from "react";
import { checkAdminAccess, clearAdminAccessCache } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const access = await checkAdminAccess();

      if (!access.user) {
        router.replace("/admin/login");
        return;
      }

      if (!access.isAdmin) {
        await supabase.auth.signOut();
        clearAdminAccessCache();
        router.replace("/admin/login");
        return;
      }

      setAuthorized(true);
      setChecking(false);
    }

    checkAdmin();
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Vérification de l’accès admin...
      </main>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
