"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import ProductSearch from "./ProductSearch";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

type CartItem = {
  quantity: number;
};

const mainLinks = [
  { label: "Accueil", href: "/" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Suivi", href: "/suivi" },
];

const categoryLinks = [
  { label: "Nouveautés", href: "/catalogue" },
  { label: "Packs scolaires", href: "/catalogue?category=Packs%20scolaires" },
  { label: "Plage", href: "/catalogue?category=Plage" },
  { label: "Accessoires & jeux", href: "/catalogue?category=Accessoires%20%26%20jeux" },
];

function isActiveLink(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href.split("?")[0]);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function updateAdminStatus(userId?: string) {
      if (!userId) {
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      setIsAdmin(profile?.role === "admin");
    }

    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      setIsConnected(Boolean(data.user));
      await updateAdminStatus(data.user?.id);
      setCheckingUser(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsConnected(Boolean(session?.user));
      await updateAdminStatus(session?.user?.id);
      setCheckingUser(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function updateCartCount() {
      try {
        const storedCart = localStorage.getItem("kidiclass_cart");
        const parsedCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

        setCartCount(
          parsedCart.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
          )
        );
      } catch {
        setCartCount(0);
      }
    }

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("kidiclass-cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("kidiclass-cart-updated", updateCartCount);
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    setIsConnected(false);
    setIsAdmin(false);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-[9999] border-b border-gray-100 bg-white shadow-sm">
      <div className="bg-[#17324d] px-3 py-1.5 text-center text-[11px] font-black leading-4 text-white sm:px-4 sm:py-2 sm:text-sm">
        Livraison : Abidjan 1 000 FCFA • sac à roulette 2 000 FCFA •
        Bassam/Songon/Anyama 2 500 FCFA
      </div>

      <div className="bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 md:gap-5 md:px-5 md:py-3">
          <Link href="/" className="shrink-0" aria-label="Accueil KidiClass">
            <Image
              src="/logo-kidiclass.png"
              alt="KidiClass"
              width={180}
              height={72}
              priority
              className="h-10 w-auto object-contain sm:h-12 md:h-16"
            />
          </Link>

          <div className="hidden min-w-0 justify-center md:flex">
            <div className="w-full max-w-xl">
              <ProductSearch />
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <nav className="hidden items-center gap-1 text-sm font-black text-gray-800 lg:flex">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-2 transition ${
                    isActiveLink(pathname, link.href)
                      ? "bg-[#e9fbfc] text-[#1db7bd]"
                      : "hover:bg-[#e9fbfc] hover:text-[#1db7bd]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/catalogue?highlight=Favoris"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-[#f36f45] hover:bg-[#fff1f5] md:flex"
              aria-label="Favoris"
            >
              <Heart size={20} strokeWidth={2.5} />
            </Link>

            {isConnected && (
              <Link
                href="/compte"
                className="hidden h-10 w-10 items-center justify-center rounded-full text-[#1db7bd] hover:bg-[#e9fbfc] md:flex"
                aria-label="Compte"
              >
                <UserRound size={20} strokeWidth={2.5} />
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden rounded-full border border-[#1db7bd] px-4 py-2 text-sm font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white md:block"
              >
                Espace admin
              </Link>
            )}

            {!checkingUser && !isConnected && (
              <Link
                href="/login"
                className="hidden rounded-full border border-[#f36f45] px-4 py-2 text-sm font-black text-[#f36f45] hover:bg-[#f36f45] hover:text-white md:block"
              >
                Connexion
              </Link>
            )}

            <Link
              href="/panier"
              className="relative flex h-10 items-center justify-center gap-2 rounded-full bg-[#f36f45] px-3 text-sm font-black text-white shadow-sm hover:bg-[#e85e33] sm:h-11 sm:px-4"
            >
              <ShoppingBag size={19} strokeWidth={2.5} />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#1db7bd] px-1 text-xs font-black text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-900 hover:border-[#1db7bd] hover:text-[#1db7bd] sm:h-11 sm:w-11 lg:hidden"
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X size={22} strokeWidth={2.5} />
              ) : (
                <Menu size={22} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>

        <div className="px-3 pb-3 sm:px-4 md:hidden">
          <ProductSearch />
        </div>
      </div>

      <nav className="hidden border-t border-gray-100 bg-white lg:block">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 px-5 py-3 text-sm font-black text-gray-800">
          {categoryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full bg-[#fffdf7] px-4 py-2 transition hover:bg-[#e9fbfc] hover:text-[#1db7bd]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto border-t border-gray-100 bg-white px-3 pb-5 pt-4 shadow-lg sm:px-4 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-4">
            <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-black ${
                    isActiveLink(pathname, link.href)
                      ? "bg-[#e9fbfc] text-[#1db7bd]"
                      : "bg-[#fffdf7] text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/catalogue?highlight=Favoris"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-[#fff1f5] px-4 py-3 text-sm font-black text-[#f36f45]"
              >
                <Heart size={17} strokeWidth={2.5} />
                Favoris
              </Link>

              {isConnected ? (
                <>
                  <Link
                    href="/compte"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl bg-[#e9fbfc] px-4 py-3 text-sm font-black text-[#1db7bd]"
                  >
                    <UserRound size={17} strokeWidth={2.5} />
                    Compte
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-left text-sm font-black text-red-500"
                  >
                    <LogOut size={17} strokeWidth={2.5} />
                    Déconnexion
                  </button>
                </>
              ) : (
                !checkingUser && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl bg-[#fff1f5] px-4 py-3 text-sm font-black text-[#f36f45]"
                  >
                    Connexion
                  </Link>
                )
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-[#e9fbfc] px-4 py-3 text-sm font-black text-[#1db7bd]"
                >
                  Espace admin
                </Link>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                <Search size={15} strokeWidth={2.5} />
                Rayons
              </div>

              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                {categoryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-black text-gray-800 shadow-sm hover:border-[#1db7bd] hover:text-[#1db7bd]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
