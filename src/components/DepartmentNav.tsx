"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type DepartmentNavProps = {
  title: string;
  homeHref: string;
  items: Array<{ label: string; href: string }>;
};

export default function DepartmentNav({
  title,
  homeHref,
  items,
}: DepartmentNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-gray-100 bg-[#fffdf7]" aria-label={title}>
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-5">
        <div className="hidden flex-wrap items-center justify-center gap-2 md:flex">
          <Link
            href={homeHref}
            className="rounded-lg border border-[#1db7bd] bg-[#e9fbfc] px-4 py-2 text-sm font-black text-[#075e62]"
          >
            Tout voir
          </Link>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-800 hover:border-[#1db7bd] hover:bg-[#e9fbfc] hover:text-[#075e62]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-[#bfedf0] bg-white px-4 py-3 text-left text-sm font-black text-[#17324d] md:hidden"
          aria-label={`Ouvrir les catégories de ${title}`}
          aria-expanded={open}
        >
          <span className="flex items-center gap-3">
            <Menu size={21} strokeWidth={2.5} />
            Catégories de {title}
          </span>
          <span className="text-xs font-black text-[#087f83]">Voir</span>
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
                <p className="text-xs font-black uppercase text-[#087f83]">
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
                  className="rounded-lg border border-[#1db7bd] bg-[#e9fbfc] px-3 py-3 text-sm font-black text-[#075e62]"
                >
                  Tout voir
                </Link>
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-black text-gray-800"
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
