"use client";

import { useEffect, useState } from "react";
import {
  checkAdminAccess,
  clearAdminAccessCache,
} from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Mail, LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    router.prefetch("/admin");
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setMessage("Email ou mot de passe administrateur incorrect.");
      setLoading(false);
      return;
    }

    const { isAdmin } = await checkAdminAccess(data.user);

    if (!isAdmin) {
      await supabase.auth.signOut();
      clearAdminAccessCache();
      setMessage("Ce compte ne possède pas les droits administrateur.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
  }

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <section className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-[#e9fbfc] lg:block">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#ffe773]/70 blur-3xl" />
          <div className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-[#f36f45]/20 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between p-12">
            <Link href="/" className="inline-block w-fit">
              <Image
                src="/logo-kidiclass.png"
                alt="KidiClass"
                width={240}
                height={96}
                priority
                className="h-20 w-auto object-contain"
              />
            </Link>

            <div>
              <p className="mb-4 inline-flex rounded-full bg-white px-5 py-2 text-sm font-black uppercase tracking-wide text-[#1db7bd] shadow-sm">
                Administration
              </p>

              <h1 className="max-w-xl text-6xl font-black leading-tight text-gray-950">
                Gérez votre boutique avec clarté
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-gray-700">
                Connectez-vous à l’espace administrateur pour gérer les produits,
                les commandes et le suivi KidiClass.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f36f45]">
                Accès sécurisé
              </p>

              <p className="mt-3 text-2xl font-black text-gray-950">
                Réservé à l’équipe KidiClass.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md rounded-[2.5rem] border border-gray-100 bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="mb-8 text-center">
              <Link href="/" className="inline-block lg:hidden">
                <Image
                  src="/logo-kidiclass.png"
                  alt="KidiClass"
                  width={240}
                  height={96}
                  priority
                  className="mx-auto h-20 w-auto object-contain"
                />
              </Link>

              <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
                <ShieldCheck size={36} strokeWidth={2.5} />
              </div>

              <p className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-[#f36f45]">
                Admin
              </p>

              <h1 className="mt-2 text-3xl font-black text-gray-950 sm:text-4xl">
                Connexion admin
              </h1>

              <p className="mt-3 text-sm font-bold leading-6 text-gray-500">
                Accédez au tableau de bord de la boutique KidiClass.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-gray-700">
                  Email admin
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 focus-within:border-[#1db7bd]">
                  <Mail size={20} className="text-[#1db7bd]" strokeWidth={2.5} />

                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="admin@email.com"
                    className="w-full bg-transparent py-3.5 text-black outline-none sm:py-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-gray-700">
                  Mot de passe
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 focus-within:border-[#1db7bd]">
                  <LockKeyhole
                    size={20}
                    className="text-[#f36f45]"
                    strokeWidth={2.5}
                  />

                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Mot de passe admin"
                    className="w-full bg-transparent py-3.5 text-black outline-none sm:py-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[#f36f45] px-4 py-3.5 text-sm font-black leading-tight text-white shadow-sm hover:bg-[#e85e33] disabled:cursor-wait disabled:opacity-60 sm:px-6 sm:py-4 sm:text-base"
            >
              {loading ? "Connexion..." : "Se connecter à l’admin"}
            </button>

            {message && (
              <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-500">
                {message}
              </p>
            )}

            <Link
              href="/"
              className="mt-7 block rounded-full px-5 py-3 text-center text-sm font-black text-[#1db7bd] hover:bg-[#e9fbfc]"
            >
              Retour à la boutique
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}
