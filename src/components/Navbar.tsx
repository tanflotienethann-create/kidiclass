"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProductSearch from "./ProductSearch";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, LogOut, ShoppingBag, UserRound } from "lucide-react";

type CartItem = {
  quantity: number;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isConnected, setIsConnected] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }

      setCheckingUser(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsConnected(!!session?.user);
      setCheckingUser(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function updateCartCount() {
      const storedCart = localStorage.getItem("kidiclass_cart");
      const parsedCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

      setCartCount(
        parsedCart.reduce((total, item) => total + Number(item.quantity || 0), 0)
      );
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
    router.push("/");
    router.refresh();
  }

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-[9999] bg-white shadow-sm">
      <div className="bg-[#1db7bd] px-4 py-1.5 text-center text-sm font-bold text-white">
        Livraison : Abidjan 1 000 FCFA, sac à roulette 2 000 FCFA, Bassam/Songon/Anyama 2 500 FCFA
      </div>

      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3">
          <Link href="/" className="shrink-0">
            <img
              src="/logo-kidiclass.png"
              alt="KidiClass"
              className="h-14 w-auto object-contain md:h-16"
            />
          </Link>

          <div className="hidden w-full max-w-md md:block">
            <ProductSearch />
          </div>

          <div className="flex shrink-0 items-center gap-2 text-sm font-bold text-gray-800">
            <Link
              href="/"
              className="hidden rounded-full px-3 py-2 hover:bg-[#e9fbfc] hover:text-[#1db7bd] md:block"
            >
              Accueil
            </Link>

            <Link
              href="/catalogue"
              className="hidden rounded-full px-3 py-2 hover:bg-[#e9fbfc] hover:text-[#1db7bd] md:block"
            >
              Catalogue
            </Link>

            <Link
              href="/suivi"
              className="hidden rounded-full px-3 py-2 hover:bg-[#e9fbfc] hover:text-[#1db7bd] md:block"
            >
              Suivi
            </Link>

            <Link
              href="/catalogue?highlight=Favoris"
              className="hidden items-center gap-2 rounded-full px-3 py-2 hover:bg-[#fff1f5] hover:text-[#f36f45] md:flex"
            >
              <Heart size={18} strokeWidth={2.5} />
              Favoris
            </Link>

            {isConnected && (
              <Link
                href="/compte"
                className="hidden items-center gap-2 rounded-full px-3 py-2 hover:bg-[#e9fbfc] hover:text-[#1db7bd] md:flex"
              >
                <UserRound size={18} strokeWidth={2.5} />
                Compte
              </Link>
            )}

            {!checkingUser && !isConnected && (
              <Link
                href="/login"
                className="hidden rounded-full border border-[#f36f45] px-4 py-2 font-bold text-[#f36f45] hover:bg-[#f36f45] hover:text-white md:block"
              >
                Connexion
              </Link>
            )}

            {isConnected && (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-full border border-[#f36f45] px-4 py-2 font-bold text-[#f36f45] hover:bg-[#f36f45] hover:text-white md:flex"
              >
                <LogOut size={18} strokeWidth={2.5} />
                Déconnexion
              </button>
            )}

            <Link
              href="/admin"
              className="hidden rounded-full border border-[#1db7bd] px-4 py-2 font-bold text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white md:block"
            >
              Admin
            </Link>

            <Link
              href="/panier"
              className="relative flex items-center gap-2 rounded-full bg-[#f36f45] px-5 py-2 font-bold text-white shadow-sm hover:bg-[#e85e33]"
            >
              <ShoppingBag size={18} strokeWidth={2.5} />
              Panier
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#1db7bd] px-1 text-xs font-black text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="px-5 pb-3 md:hidden">
          <ProductSearch />
        </div>
      </div>

      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-5 py-3 text-sm font-black uppercase tracking-wide text-gray-800">
          <Link
            href="/catalogue"
            className="whitespace-nowrap hover:text-[#1db7bd]"
          >
            Nouveautés
          </Link>

          <Link
            href="/catalogue?category=Packs%20scolaires"
            className="whitespace-nowrap hover:text-[#1db7bd]"
          >
            Packs scolaires
          </Link>

          <Link
            href="/catalogue?productType=Sac%20%C3%A0%20go%C3%BBter"
            className="whitespace-nowrap hover:text-[#1db7bd]"
          >
            Sacs à goûter
          </Link>

          <Link
            href="/catalogue?productType=Bo%C3%AEte%20%C3%A0%20go%C3%BBter"
            className="whitespace-nowrap hover:text-[#1db7bd]"
          >
            Boîtes à goûter
          </Link>

          <Link
            href="/catalogue?category=Plage"
            className="whitespace-nowrap hover:text-[#1db7bd]"
          >
            Plage
          </Link>

          <Link
            href="/catalogue?productType=Sac"
            className="whitespace-nowrap hover:text-[#1db7bd]"
          >
            Sacs
          </Link>

          <Link
            href="/catalogue?productType=Sac%20%C3%A0%20roulette"
            className="whitespace-nowrap hover:text-[#1db7bd]"
          >
            Sacs à roulette
          </Link>

          <Link
            href="/catalogue?category=Accessoires%20%26%20jeux"
            className="whitespace-nowrap hover:text-[#1db7bd]"
          >
            Accessoires & jeux
          </Link>

          <Link
            href="/catalogue?category=Chaussures"
            className="whitespace-nowrap hover:text-[#1db7bd]"
          >
            Chaussures
          </Link>

          <Link
            href="/catalogue?category=V%C3%AAtements"
            className="whitespace-nowrap hover:text-[#1db7bd]"
          >
            Vêtements
          </Link>

          {isConnected && (
            <Link
              href="/compte"
              className="whitespace-nowrap text-[#1db7bd] hover:text-[#f36f45] md:hidden"
            >
              Compte
            </Link>
          )}

          {!checkingUser && !isConnected && (
            <Link
              href="/login"
              className="whitespace-nowrap text-[#f36f45] hover:text-[#1db7bd] md:hidden"
            >
              Connexion
            </Link>
          )}

          {isConnected && (
            <button
              type="button"
              onClick={handleLogout}
              className="whitespace-nowrap text-left font-black uppercase tracking-wide text-[#f36f45] hover:text-[#1db7bd] md:hidden"
            >
              Déconnexion
            </button>
          )}

          <Link
            href="/admin"
            className="whitespace-nowrap text-[#f36f45] hover:text-[#1db7bd] md:hidden"
          >
            Admin
          </Link>

          <Link
            href="/catalogue?highlight=Favoris"
            className="whitespace-nowrap text-[#f36f45] hover:text-[#1db7bd] md:hidden"
          >
            Favoris
          </Link>
        </div>
      </nav>
    </header>
  );
}
