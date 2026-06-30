"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Mail, MapPin, Music2, Phone, Truck } from "lucide-react";

const footerLinks = [
  { label: "Accueil", href: "/" },
  { label: "Promotions", href: "/promotions" },
  { label: "École et sorties", href: "/ecole-sorties" },
  { label: "Repas et goûters", href: "/repas-gouters" },
  { label: "Piscine et plage", href: "/piscine-plage" },
  { label: "Accessoires et jeux", href: "/accessoires-jeux" },
  { label: "Personnages", href: "/personnages" },
  { label: "Suivi colis", href: "/suivi" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/kidiclass",
    shortLabel: "f",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/kidiclass",
    shortLabel: "ig",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@kidiclass",
    shortLabel: "tt",
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
    <footer className="border-t border-[#eadfce] bg-[#fffdf7]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-5 lg:grid-cols-[1.1fr_1fr_1fr] lg:py-12">
        <div>
          <Link
            href="/"
            className="relative block h-20 w-52 overflow-hidden sm:h-24 sm:w-64"
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

          <p className="mt-4 max-w-md text-sm font-bold leading-6 text-gray-600">
            KidiClass sélectionne des articles utiles, colorés et tendance pour
            accompagner les enfants à l’école, aux sorties, à la plage et dans
            leurs petits moments de tous les jours.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-[#f36f45]/25 bg-white px-3 py-2 text-sm font-black text-[#e85035] transition hover:border-[#087f83] hover:text-[#087f83]"
              >
                {social.label === "TikTok" ? (
                  <Music2 size={17} strokeWidth={2.5} />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e85035] text-[10px] uppercase text-white">
                    {social.shortLabel}
                  </span>
                )}
                {social.label}
                <ExternalLink size={14} strokeWidth={2.5} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.22em] text-[#087f83]">
            Boutique
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl bg-white px-3 py-2.5 text-sm font-black text-gray-800 shadow-sm transition hover:bg-[#e9fbfc] hover:text-[#087f83]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.22em] text-[#f36f45]">
            Infos utiles
          </h2>

          <div className="mt-4 space-y-3">
            <a
              href="tel:+2250779311555"
              className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Phone
                className="mt-0.5 shrink-0 text-[#087f83]"
                size={22}
                strokeWidth={2.5}
              />
              <div>
                <p className="text-sm font-black text-gray-950">Contact</p>
                <p className="mt-1 text-sm font-bold text-gray-600">
                  0779311555
                </p>
              </div>
            </a>

            <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <Truck
                className="mt-0.5 shrink-0 text-[#f36f45]"
                size={22}
                strokeWidth={2.5}
              />
              <div>
                <p className="text-sm font-black text-gray-950">Livraison</p>
                <p className="mt-1 text-sm font-bold leading-6 text-gray-600">
                  Abidjan et alentours, avec expéditions locales et
                  internationales selon la destination.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <MapPin
                className="mt-0.5 shrink-0 text-[#c28b00]"
                size={22}
                strokeWidth={2.5}
              />
              <div>
                <p className="text-sm font-black text-gray-950">Commande</p>
                <p className="mt-1 text-sm font-bold leading-6 text-gray-600">
                  Suivi colis, paiement mobile money sécurisé et confirmation
                  de commande par WhatsApp.
                </p>
              </div>
            </div>

            <a
              href="mailto:contact@kidiclass.com"
              className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Mail
                className="mt-0.5 shrink-0 text-[#087f83]"
                size={22}
                strokeWidth={2.5}
              />
              <div>
                <p className="text-sm font-black text-gray-950">Email</p>
                <p className="mt-1 text-sm font-bold text-gray-600">
                  contact@kidiclass.com
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#eadfce] px-4 py-4 text-center text-xs font-black uppercase tracking-[0.18em] text-gray-500">
        © KidiClass
      </div>
    </footer>
  );
}
