"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Music2, Phone, Truck } from "lucide-react";

const shopLinks = [
  { label: "Promotions", href: "/promotions" },
  { label: "École et sorties", href: "/ecole-sorties" },
  { label: "Repas et goûters", href: "/repas-gouters" },
  { label: "Piscine et plage", href: "/piscine-plage" },
  { label: "Accessoires et jeux", href: "/accessoires-jeux" },
  { label: "Personnages", href: "/personnages" },
];

const helpLinks = [
  { label: "Suivi colis", href: "/suivi" },
  { label: "Mon compte", href: "/compte" },
  { label: "Panier", href: "/panier" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/kidiclass",
    mark: "f",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/kidiclass",
    mark: "ig",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@kidiclass",
    mark: "tt",
  },
];

export default function Footer() {
  const pathname = usePathname();
  const hideFooter =
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register";

  if (hideFooter) {
    return null;
  }

  return (
    <footer className="border-t border-[#eadfce] bg-white">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:gap-7 sm:px-5 sm:py-9 lg:grid-cols-[1.15fr_1fr_0.9fr] lg:gap-10">
        <div className="text-center sm:text-left">
          <Link
            href="/"
            className="relative mx-auto block h-14 w-40 overflow-hidden sm:mx-0 sm:h-20 sm:w-56"
            aria-label="Accueil KidiClass"
          >
            <Image
              src="/logo-kidiclass.png"
              alt="KidiClass"
              width={1024}
              height={1024}
              className="absolute left-1/2 top-1/2 h-auto w-full max-w-none -translate-x-1/2 -translate-y-[46%] object-contain"
            />
          </Link>

          <p className="mx-auto mt-2 max-w-sm text-sm font-bold leading-6 text-gray-600 sm:mx-0 sm:mt-3">
            Les essentiels kids pour l’école, les sorties, les repas et les
            loisirs.
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:mt-4 sm:justify-start">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center gap-2 rounded-full border border-[#eadfce] bg-[#fffdf7] px-3 text-sm font-black text-gray-900 transition hover:border-[#f36f45] hover:text-[#e85035]"
                aria-label={social.label}
              >
                {social.label === "TikTok" ? (
                  <Music2 size={17} strokeWidth={2.5} />
                ) : (
                  <span className="text-xs uppercase">{social.mark}</span>
                )}
                <span className="hidden sm:inline">{social.label}</span>
              </a>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:hidden">
            {[
              { label: "Promos", href: "/promotions" },
              { label: "Suivi", href: "/suivi" },
              { label: "Panier", href: "/panier" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-[#eadfce] bg-[#fffdf7] px-2 py-2 text-center text-xs font-black text-gray-800"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <nav className="hidden grid-cols-2 gap-6 text-sm sm:grid sm:grid-cols-3 lg:grid-cols-2">
          <div>
            <h2 className="font-black uppercase tracking-[0.18em] text-[#087f83]">
              Boutique
            </h2>
            <div className="mt-3 space-y-2">
              {shopLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block font-bold text-gray-600 transition hover:text-[#e85035]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-black uppercase tracking-[0.18em] text-[#f36f45]">
              Univers
            </h2>
            <div className="mt-3 space-y-2">
              {shopLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block font-bold text-gray-600 transition hover:text-[#087f83]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 lg:hidden">
            <h2 className="font-black uppercase tracking-[0.18em] text-[#6f4e00]">
              Aide
            </h2>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {helpLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-bold text-gray-600 transition hover:text-[#e85035]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="space-y-2 rounded-2xl bg-[#fffdf7] p-3 text-sm sm:space-y-3 sm:p-5">
          <a
            href="tel:+2250779311555"
            className="flex items-center gap-3 font-black text-gray-950 transition hover:text-[#087f83]"
          >
            <Phone className="text-[#087f83]" size={19} strokeWidth={2.5} />
            0779311555
          </a>

          <p className="flex items-start gap-3 font-bold leading-5 text-gray-600 sm:leading-6">
            <Truck
              className="mt-0.5 shrink-0 text-[#f36f45]"
              size={19}
              strokeWidth={2.5}
            />
            Livraison Abidjan et alentours. Expédition locale et
            internationale.
          </p>

          <a
            href="mailto:contact@kidiclass.com"
            className="hidden items-center gap-3 font-bold text-gray-600 transition hover:text-[#e85035] sm:flex"
          >
            <Mail className="text-[#087f83]" size={19} strokeWidth={2.5} />
            contact@kidiclass.com
          </a>

          <div className="hidden border-t border-[#eadfce] pt-3 lg:block">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {helpLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-bold text-gray-600 transition hover:text-[#e85035]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#eadfce] px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
        © 2026 KidiClass
      </div>
    </footer>
  );
}
