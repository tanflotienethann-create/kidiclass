"use client";

import { useTaxonomySettings } from "@/hooks/useTaxonomySettings";
import { getTaxonomyNavigationItems } from "@/lib/taxonomySettings";
import { ChevronDown, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { type CSSProperties, useId, useState } from "react";

type DepartmentNavProps = {
  title: string;
  homeHref: string;
  items: Array<{ label: string; href: string }>;
  departmentId?: string;
  palette: { accent: string; soft: string; ink: string };
};

export default function DepartmentNav({
  title,
  homeHref,
  items,
  departmentId,
  palette,
}: DepartmentNavProps) {
  const { settings: taxonomySettings } = useTaxonomySettings();
  const [open, setOpen] = useState(false);
  const categoriesId = useId();
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
    `rounded-lg border text-[13px] font-black leading-tight transition sm:text-sm ${
      active
        ? "border-[var(--department-accent)] bg-[var(--department-soft)] text-[var(--department-ink)] shadow-sm"
        : "border-gray-200 bg-white text-gray-800 hover:border-[var(--department-accent)] hover:bg-[var(--department-soft)] hover:text-[var(--department-ink)]"
    }`;

  const visibleItems = departmentId
    ? getTaxonomyNavigationItems(taxonomySettings, departmentId)
    : items;

  const selectedLabel =
    visibleItems.find((item) => isActive(item.href))?.label || "Tout voir";

  return (
    <nav
      className="border-b border-gray-100 bg-[#fffdf7]"
      aria-label={title}
      style={themedStyle}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--department-accent)] bg-white px-3 py-2.5 text-left text-[var(--department-ink)] shadow-sm transition hover:bg-[var(--department-soft)] sm:gap-4 sm:px-5 sm:py-3"
          aria-label={`${open ? "Fermer" : "Voir"} les catégories de ${title}`}
          aria-expanded={open}
          aria-controls={categoriesId}
        >
          <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--department-soft)] text-[var(--department-ink)] sm:h-10 sm:w-10">
              <LayoutGrid size={18} strokeWidth={2.5} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black uppercase leading-tight text-[var(--department-accent)] sm:text-xs">
                {title}
              </span>
              <span className="block text-[13px] font-black leading-tight text-gray-950 sm:text-base">
                Voir les catégories
              </span>
            </span>
          </span>
          <span className="flex min-w-0 items-center gap-3">
            <span className="hidden max-w-56 truncate text-sm font-black text-[var(--department-ink)] sm:block">
              {selectedLabel}
            </span>
            <ChevronDown
              size={20}
              strokeWidth={2.5}
              className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        {open && (
          <div
            id={categoriesId}
            className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-[var(--department-accent)] bg-white p-3 shadow-lg sm:p-4"
          >
            <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              <Link
                href={homeHref}
                onClick={() => setOpen(false)}
                className={`${linkClass(!hasSelection)} px-3 py-2.5 sm:py-3`}
              >
                Tout voir
              </Link>
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`${linkClass(isActive(item.href))} px-3 py-2.5 sm:py-3`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
