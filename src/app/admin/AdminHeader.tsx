"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <header className="mb-10 flex flex-col justify-between gap-4 rounded-2xl border border-pink-500/30 bg-zinc-950 p-5 md:flex-row md:items-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-pink-400">
          Espace administrateur
        </p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Administration KidiClass
        </h1>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full border border-white/20 px-5 py-3 font-bold text-white hover:border-pink-500 hover:text-pink-400"
        >
          ← Voir la boutique
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full bg-pink-500 px-5 py-3 font-bold text-white hover:bg-pink-600"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}