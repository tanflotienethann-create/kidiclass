"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserPlus,
  UserRound,
} from "lucide-react";

function translateAuthError(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("email rate limit exceeded")) {
    return "Trop de tentatives avec cette adresse email. Veuillez patienter quelques minutes avant de réessayer.";
  }

  if (lowerMessage.includes("user already registered")) {
    return "Un compte existe déjà avec cette adresse email.";
  }

  if (lowerMessage.includes("already registered")) {
    return "Un compte existe déjà avec cette adresse email.";
  }

  if (lowerMessage.includes("invalid email")) {
    return "L’adresse email renseignée n’est pas valide.";
  }

  if (lowerMessage.includes("password")) {
    return "Le mot de passe est invalide ou trop faible.";
  }

  if (lowerMessage.includes("signup disabled")) {
    return "La création de compte est temporairement désactivée.";
  }

  if (lowerMessage.includes("network")) {
    return "Problème de connexion. Vérifiez votre réseau puis réessayez.";
  }

  return "Une erreur est survenue. Veuillez réessayer.";
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setMessageType("error");
    setLoading(true);

    if (password.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(translateAuthError(error.message));
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert([
        {
          id: data.user.id,
          email,
          full_name: name,
          phone,
          role: "client",
        },
      ]);

      if (profileError) {
        setMessage(
          "Votre compte a été créé, mais vos informations client n’ont pas pu être enregistrées. Veuillez réessayer ou contacter KidiClass."
        );
        setLoading(false);
        return;
      }
    }

    setMessageType("success");
    setMessage("Compte créé avec succès. Vous allez être redirigé vers la connexion.");
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 900);
  }

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <section className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-[#fff9cf] lg:block">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#1db7bd]/20 blur-3xl" />
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
              <p className="mb-4 inline-flex rounded-full bg-white px-5 py-2 text-sm font-black uppercase tracking-wide text-[#f36f45] shadow-sm">
                Nouveau compte
              </p>

              <h1 className="max-w-xl text-6xl font-black leading-tight text-gray-950">
                Créez votre espace KidiClass.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-gray-700">
                Un compte client permet de mieux gérer vos commandes, vos
                informations de livraison et vos points fidélité.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1db7bd]">
                KidiClass
              </p>

              <p className="mt-3 text-2xl font-black text-gray-950">
                Les enfants sapés comme jamais.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12">
          <form
            onSubmit={handleRegister}
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

              <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1f5] text-[#f36f45]">
                <UserPlus size={34} strokeWidth={2.5} />
              </div>

              <p className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-[#1db7bd]">
                Inscription
              </p>

              <h1 className="mt-2 text-4xl font-black text-gray-950">
                Créer un compte
              </h1>

              <p className="mt-3 text-sm font-bold leading-6 text-gray-500">
                Remplissez les informations ci-dessous pour créer votre compte.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-gray-700">
                  Nom complet
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 focus-within:border-[#1db7bd]">
                  <UserRound
                    size={20}
                    className="text-[#1db7bd]"
                    strokeWidth={2.5}
                  />

                  <input
                    type="text"
                    placeholder="Nom complet"
                    className="w-full bg-transparent py-4 text-black outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-gray-700">
                  Téléphone
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 focus-within:border-[#1db7bd]">
                  <Phone
                    size={20}
                    className="text-[#f36f45]"
                    strokeWidth={2.5}
                  />

                  <input
                    type="tel"
                    placeholder="Numéro de téléphone"
                    className="w-full bg-transparent py-4 text-black outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </label>

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
                    placeholder="Créer un mot de passe"
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

                <p className="mt-2 text-xs font-bold text-gray-500">
                  Minimum 6 caractères.
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-gray-700">
                  Confirmer le mot de passe
                </span>

                <div
                  className={`flex items-center gap-3 rounded-2xl border bg-white px-4 focus-within:border-[#1db7bd] ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                >
                  <LockKeyhole
                    size={20}
                    className="text-[#1db7bd]"
                    strokeWidth={2.5}
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmer le mot de passe"
                    className="w-full bg-transparent py-4 text-black outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="text-gray-400 hover:text-[#1db7bd]"
                    aria-label={
                      showConfirmPassword
                        ? "Masquer la confirmation"
                        : "Afficher la confirmation"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={21} strokeWidth={2.5} />
                    ) : (
                      <Eye size={21} strokeWidth={2.5} />
                    )}
                  </button>
                </div>

                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-2 text-xs font-black text-red-500">
                    Les mots de passe ne correspondent pas.
                  </p>
                )}

                {confirmPassword && password === confirmPassword && (
                  <p className="mt-2 text-xs font-black text-green-600">
                    Les mots de passe correspondent.
                  </p>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[#1db7bd] px-6 py-4 font-black text-white shadow-sm hover:bg-[#159ca1] disabled:opacity-50"
            >
              {loading ? "Création du compte..." : "Créer mon compte"}
            </button>

            {message && (
              <p
                className={`mt-5 rounded-2xl p-4 text-sm font-bold ${
                  messageType === "success"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {message}
              </p>
            )}

            <p className="mt-7 text-center text-sm font-bold text-gray-600">
              Déjà un compte ?{" "}
              <Link href="/login" className="font-black text-[#f36f45]">
                Se connecter
              </Link>
            </p>

            <Link
              href="/"
              className="mt-4 block text-center text-sm font-black text-[#1db7bd]"
            >
              Retour à la boutique
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}