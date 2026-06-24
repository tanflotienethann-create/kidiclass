import {
  schoolOfferCategories,
  schoolOfferGroups,
  type SchoolOfferGroup,
} from "@/lib/schoolOffer";
import {
  Backpack,
  BookOpen,
  GraduationCap,
  PackageCheck,
  Sandwich,
} from "lucide-react";
import Link from "next/link";

const groupStyles: Record<
  SchoolOfferGroup,
  { band: string; accent: string; icon: typeof BookOpen }
> = {
  levels: {
    band: "bg-[#e9fbfc]",
    accent: "text-[#087f83]",
    icon: GraduationCap,
  },
  packs: {
    band: "bg-[#fff1f5]",
    accent: "text-[#e85035]",
    icon: PackageCheck,
  },
  bags: {
    band: "bg-[#fff9cf]",
    accent: "text-[#8b7100]",
    icon: Backpack,
  },
  snacks: {
    band: "bg-[#edf5ff]",
    accent: "text-[#315ea8]",
    icon: Sandwich,
  },
};

export default function SchoolOfferPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-[#cdebed] bg-[#e9fbfc] px-4 py-10 sm:px-5 sm:py-14">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-[#087f83]">
              Rentrée 2026
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-[#111827] sm:text-6xl">
              Offre scolaire KidiClass
            </h1>
            <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-gray-700 sm:text-lg">
              Choisissez d&apos;abord le niveau ou le type d&apos;article, puis retrouvez
              les personnages préférés des enfants dans les filtres.
            </p>
          </div>

          <div className="hidden h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-white text-[#087f83] shadow-sm md:flex">
            <BookOpen size={84} strokeWidth={1.8} />
          </div>
        </div>
      </section>

      {schoolOfferGroups.map((group) => {
        const style = groupStyles[group.id];
        const Icon = style.icon;
        const categories = schoolOfferCategories.filter(
          (category) => category.group === group.id,
        );

        return (
          <section
            id={group.id}
            key={group.id}
            className={`scroll-mt-40 px-4 py-10 sm:px-5 sm:py-14 ${style.band}`}
          >
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white ${style.accent}`}
                >
                  <Icon size={30} strokeWidth={2.3} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-[#111827]">
                    {group.label}
                  </h2>
                  <p className="mt-1 font-bold text-gray-600">
                    {group.shortDescription}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/offre-scolaire/${category.slug}`}
                    className="group rounded-lg border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#1db7bd] hover:shadow-lg"
                  >
                    <h3 className={`text-lg font-black ${style.accent}`}>
                      {category.label}
                    </h3>
                    <p className="mt-2 text-sm font-bold leading-6 text-gray-600">
                      {category.description}
                    </p>
                    <span className="mt-4 inline-flex items-center text-sm font-black text-[#111827] group-hover:text-[#1db7bd]">
                      Voir les articles
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </main>
  );
}
