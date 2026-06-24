import Link from "next/link";

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
  return (
    <nav className="border-b border-gray-100 bg-[#fffdf7]" aria-label={title}>
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-5">
        <div className="hidden flex-wrap items-center justify-center gap-2 md:flex">
          <Link
            href={homeHref}
            className="rounded-lg bg-[#17324d] px-4 py-2 text-sm font-black text-white"
          >
            Tout voir
          </Link>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-800 hover:border-[#1db7bd] hover:text-[#087f83]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <details className="md:hidden">
          <summary className="cursor-pointer list-none rounded-lg bg-[#17324d] px-4 py-3 text-center text-sm font-black text-white">
            Voir les catégories de {title}
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href={homeHref}
              className="rounded-lg bg-[#e9fbfc] px-3 py-3 text-sm font-black text-[#087f83]"
            >
              Tout voir
            </Link>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-black text-gray-800"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </nav>
  );
}
