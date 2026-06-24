"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { type CSSProperties, useState } from "react";

type DepartmentNavProps = {
  title: string;
  homeHref: string;
  items: Array<{ label: string; href: string }>;
  palette: { accent: string; soft: string; ink: string };
};

export default function DepartmentNav({
  title,
  homeHref,
  items,
  palette,
}: DepartmentNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasSelection =
    searchParams.has("category") || searchParams.has("character");

  function isActive(href: string) {
    const url = new URL(href, "https://kidiclass.local");
    const category = url.searchParams.get("category");
    const character = url.searchParams.get("character");

    if (category) return searchParams.get("category") === category;
    if (character) return searchParams.get("character") === character;

    return pathname === homeHref && !hasSelection;
  }

  const themedStyle = {
    "--department-accent": palette.accent,
    "--department-soft": palette.soft,
    "--department-ink": palette.ink,
  } as CSSProperties;

  const linkClass = (active: boolean) =>
    `rounded-lg border text-sm font-black transition ${
      active
        ? "border-[var(--department-accent)] bg-[var(--department-soft)] text-[var(--department-ink)] shadow-sm"
        : "border-gray-200 bg-white text-gray-800 hover:border-[var(--department-accent)] hover:bg-[var(--department-soft)] hover:text-[var(--department-ink)]"
    }`;

  return (
    <nav
      className="border-b border-gray-100 bg-[#fffdf7]"
      aria-label={title}
      style={themedStyle}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-5">
        <div className="hidden flex-wrap items-center justify-center gap-2 md:flex">
          <Link
            href={homeHref}
            className={`${linkClass(!hasSelection)} px-4 py-2`}
          >
            Tout voir
          </Link>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkClass(isActive(item.href))} px-4 py-2`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-[var(--department-accent)] bg-white px-4 py-3 text-left text-sm font-black text-[var(--department-ink)] md:hidden"
          aria-label={`Ouvrir les catégories de ${title}`}
          aria-expanded={open}
        >
          <span className="flex items-center gap-3">
            <Menu size={21} strokeWidth={2.5} />
            Catégories de {title}
          </span>
          <span className="text-xs font-black text-[var(--department-accent)]">Voir</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[10001] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-gray-950/45"
            aria-label="Fermer les catégories"
            onClick={() => setOpen(false)}
          />

          <aside className="absolute left-0 top-0 flex h-full w-[min(88vw,380px)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
              <div>
                <p className="text-xs font-black uppercase text-[var(--department-accent)]">
                  Rayon
                </p>
                <p className="text-xl font-black text-gray-950">{title}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-800"
                aria-label="Fermer les catégories"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={homeHref}
                  onClick={() => setOpen(false)}
                  className={`${linkClass(!hasSelection)} px-3 py-3`}
                >
                  Tout voir
                </Link>
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`${linkClass(isActive(item.href))} px-3 py-3`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </nav>
  );
}
