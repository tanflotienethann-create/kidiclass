"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { checkAdminAccess, clearAdminAccessCache } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  BarChart3,
  BadgePercent,
  History,
  LogOut,
  Menu,
  PackageCheck,
  Settings,
  ShoppingBag,
  Store,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type AdminShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Produits", href: "/admin/produits", icon: ShoppingBag },
  { label: "Commandes", href: "/admin/commandes", icon: PackageCheck },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Promotions", href: "/admin/promotions", icon: BadgePercent },
  { label: "Réglages", href: "/admin/reglages", icon: Settings },
  { label: "Historique", href: "/admin/historique", icon: History },
];

export default function AdminShell({
  title,
  subtitle,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function verifyAdminAccess() {
      const access = await checkAdminAccess();

      if (!access.user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        router.replace("/admin/login");
        return;
      }

      if (!access.isAdmin) {
        await supabase.auth.signOut();
        clearAdminAccessCache();
        setIsAdmin(false);
        setCheckingAdmin(false);
        router.replace("/admin/login");
        return;
      }

      setIsAdmin(true);
      setCheckingAdmin(false);
    }

    void verifyAdminAccess();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    clearAdminAccessCache();
    router.push("/admin/login");
    router.refresh();
  }

  function isActiveLink(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (checkingAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-5">
        <div className="max-w-md rounded-[2.5rem] border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
          <Image
            src="/logo-kidiclass.png"
            alt="KidiClass"
            width={240}
            height={96}
            priority
            className="mx-auto h-20 w-auto object-contain"
          />

          <p className="mt-6 text-sm font-black uppercase tracking-[0.3em] text-[#1db7bd]">
            Vérification
          </p>

          <h1 className="mt-3 text-3xl font-black text-gray-950">
            Accès administrateur
          </h1>

          <p className="mt-3 font-bold leading-7 text-gray-500">
            Nous vérifions vos droits avant d’afficher l’espace admin.
          </p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffdf7]">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1700px] items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <Link href="/admin" className="flex shrink-0 items-center gap-2">
            <span className="relative h-11 w-28 overflow-hidden">
              <Image
                src="/logo-kidiclass.png"
                alt="KidiClass"
                width={1024}
                height={1024}
                priority
                className="absolute left-1/2 top-1/2 h-auto w-full max-w-none -translate-x-1/2 -translate-y-[46%] object-contain"
              />
            </span>

            <span className="hidden text-[11px] font-black uppercase tracking-[0.16em] text-[#087f83] min-[1750px]:block">
              Espace admin
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 2xl:flex">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveLink(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2.5 text-[13px] font-black transition ${
                    active
                      ? "bg-[#1db7bd] text-white shadow-sm"
                      : "text-gray-700 hover:bg-[#e9fbfc] hover:text-[#1db7bd]"
                  }`}
                >
                  <Icon size={17} strokeWidth={2.5} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 2xl:flex">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full border-2 border-[#1db7bd] px-4 py-2.5 text-[13px] font-black text-[#1db7bd] transition hover:bg-[#1db7bd] hover:text-white"
            >
              <Store size={18} strokeWidth={2.5} />
              Boutique
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full bg-[#f36f45] px-4 py-2.5 text-[13px] font-black text-white transition hover:bg-[#e85e33]"
            >
              <LogOut size={18} strokeWidth={2.5} />
              Quitter
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9fbfc] text-[#1db7bd] 2xl:hidden"
            aria-label="Ouvrir le menu administrateur"
          >
            {mobileMenuOpen ? (
              <X size={24} strokeWidth={2.5} />
            ) : (
              <Menu size={24} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-5 py-4 2xl:hidden">
            <div className="grid gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActiveLink(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-5 py-4 font-black transition ${
                      active
                        ? "bg-[#1db7bd] text-white shadow-sm"
                        : "bg-[#fffdf7] text-gray-700 hover:bg-[#e9fbfc] hover:text-[#1db7bd]"
                    }`}
                  >
                    <Icon size={20} strokeWidth={2.5} />
                    {item.label}
                  </Link>
                );
              })}

              <div className="mt-3 grid gap-2 border-t border-gray-100 pt-4">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#1db7bd] px-5 py-4 font-black text-[#1db7bd] transition hover:bg-[#1db7bd] hover:text-white"
                >
                  <Store size={20} strokeWidth={2.5} />
                  Boutique
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#f36f45] px-5 py-4 font-black text-white transition hover:bg-[#e85e33]"
                >
                  <LogOut size={20} strokeWidth={2.5} />
                  Quitter
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="w-full overflow-x-hidden">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-6 rounded-[2.5rem] border border-gray-100 bg-white p-5 shadow-sm sm:mb-8 sm:p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1db7bd] sm:text-sm sm:tracking-[0.3em]">
              Espace administrateur
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight text-gray-950 sm:text-4xl md:text-6xl">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-3 max-w-4xl text-base font-bold leading-7 text-gray-500 md:text-lg">
                {subtitle}
              </p>
            )}
          </div>

          <div className="w-full min-w-0 overflow-x-hidden">{children}</div>
        </div>
      </section>
    </main>
  );
}
