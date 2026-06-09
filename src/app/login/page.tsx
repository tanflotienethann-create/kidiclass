"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Erreur : email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/compte");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <section className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-[#e9fbfc] lg:block">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#ffe773]/70 blur-3xl" />
          <div className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-[#f36f45]/20 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between p-12">
            <Link href="/" className="inline-block w-fit">
              <img
                src="/logo-kidiclass.png"
                alt="KidiClass"
                className="h-20 w-auto object-contain"
              />
            </Link>

            <div>
              <p className="mb-4 inline-flex rounded-full bg-white px-5 py-2 text-sm font-black uppercase tracking-wide text-[#1db7bd] shadow-sm">
                Espace client
              </p>

              <h1 className="max-w-xl text-6xl font-black leading-tight text-gray-950">
                Retrouvez vos articles préférés.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-gray-700">
                Connectez-vous pour accéder à votre compte KidiClass, retrouver
                vos commandes et suivre vos points fidélité.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-[#1db7bd]">Mode</p>
                <p className="mt-1 text-xs font-bold text-gray-500">
                  enfant
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-[#f36f45]">Locale</p>
                <p className="mt-1 text-xs font-bold text-gray-500">
                  livraison
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-[#c7a900]">Points</p>
                <p className="mt-1 text-xs font-bold text-gray-500">
                  fidélité
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm"
          >
            <div className="mb-8 text-center">
              <Link href="/" className="inline-block lg:hidden">
                <img
                  src="/logo-kidiclass.png"
                  alt="KidiClass"
                  className="mx-auto h-20 w-auto object-contain"
                />
              </Link>

              <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
                <LogIn size={34} strokeWidth={2.5} />
              </div>

              <p className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-[#f36f45]">
                Connexion
              </p>

              <h1 className="mt-2 text-4xl font-black text-gray-950">
                Bon retour
              </h1>

              <p className="mt-3 text-sm font-bold leading-6 text-gray-500">
                Connectez-vous à votre compte client KidiClass.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-gray-700">
                  Email
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 focus-within:border-[#1db7bd]">
                  <Mail
                    size={20}
                    className="text-[#1db7bd]"
                    strokeWidth={2.5}
                  />

                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="w-full bg-transparent py-4 text-black outline-none"
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    className="w-full bg-transparent py-4 text-black outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-[#1db7bd]"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={21} strokeWidth={2.5} />
                    ) : (
                      <Eye size={21} strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[#f36f45] px-6 py-4 font-black text-white shadow-sm hover:bg-[#e85e33] disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            {message && (
              <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-500">
                {message}
              </p>
            )}

            <p className="mt-7 text-center text-sm font-bold text-gray-600">
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-black text-[#1db7bd]">
                Créer un compte
              </Link>
            </p>

            <Link
              href="/"
              className="mt-4 block text-center text-sm font-black text-[#f36f45]"
            >
              Retour à la boutique
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}
