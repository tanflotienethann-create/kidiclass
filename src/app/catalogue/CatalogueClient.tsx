"use client";

import KidiclassSelect from "@/components/KidiclassSelect";
import { getProductAvailabilityLabel } from "@/lib/productAvailability";
import {
  characterThemes as offerCharacterThemes,
  schoolLevels as offerSchoolLevels,
} from "@/lib/schoolOffer";
import { shopCategoryLabels, shopProductTypes } from "@/lib/shopNavigation";
import { supabase } from "@/lib/supabase";
import {
  Heart,
  PackageCheck,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  old_price: number | null;
  stock: number;
  availability_status: string | null;
  image_url: string | null;
  images: string[] | null;
  category: string;
  product_type: string | null;
  character_theme: string | null;
  school_level: string | null;
  brand: string | null;
  colors: string | null;
  target_age: string | null;
  gender: string | null;
  is_promo: boolean | null;
  is_favorite: boolean | null;
  is_new: boolean | null;
  is_pack: boolean | null;
  is_archived: boolean | null;
};

type CatalogueTheme = {
  eyebrow: string;
  title: string;
  description: string;
  variant: "default" | "school" | "beach" | "play" | "new";
};

type CatalogueClientProps = {
  initialCategory?: string;
  initialCharacterTheme?: string;
  initialHighlight?: string;
  allowedCategories?: string[];
  categoryOptions?: string[];
  theme?: CatalogueTheme;
};

const categories = ["Toutes", ...shopCategoryLabels];

const productTypes = ["Tous", ...shopProductTypes];

const characterThemes = ["Tous", ...offerCharacterThemes];

const schoolLevels = ["Tous", ...offerSchoolLevels];

const genders = ["Tous", "Fille", "Garçon", "Mixte"];

const highlightOptions = [
  "Tous",
  "Nouveautés",
  "Coups de cœur",
  "Promotions",
  "Favoris",
];

const sortOptions = [
  "Plus récents",
  "Prix croissant",
  "Prix décroissant",
  "Promos d'abord",
  "Disponibles d'abord",
];

const categoryAliases: Record<string, string[]> = {
  "Packs scolaires": ["Packs scolaires", "Pack scolaires", "PACK", "Scolaire"],
  "Accessoires & jeux": ["Accessoires & jeux", "Accessoires"],
  Vêtements: ["Vêtements", "Filles", "Garçons", "Bébés"],
};

const defaultTheme: CatalogueTheme = {
  eyebrow: "Catalogue KidiClass",
  title: "Tous les essentiels kids au même endroit.",
  description:
    "Filtrez les packs, chaussures, accessoires et articles de plage avec une présentation plus claire et plus boutique.",
  variant: "default",
};

const themeStyles = {
  default: {
    section: "bg-[#f4efe7]",
    badge: "text-[#e85035]",
    panel: "bg-white",
  },
  school: {
    section: "bg-[#e9fbfc]",
    badge: "text-[#0f766e]",
    panel: "bg-[#fffdf7]",
  },
  beach: {
    section: "bg-[#dff8ff]",
    badge: "text-[#0089a7]",
    panel: "bg-[#fff9cf]",
  },
  play: {
    section: "bg-[#fff1f5]",
    badge: "text-[#f36f45]",
    panel: "bg-[#e9fbfc]",
  },
  new: {
    section: "bg-[#fff3bf]",
    badge: "text-[#e85035]",
    panel: "bg-white",
  },
};

function BeachDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-8 top-8 h-20 w-20 rounded-full bg-[#ffc928]" />
      <div className="absolute -bottom-10 left-0 h-28 w-full rounded-t-[50%] bg-[#66d3e5]" />
      <div className="absolute bottom-8 right-10 hidden h-36 w-28 md:block">
        <div className="absolute bottom-0 left-12 h-28 w-4 rotate-12 rounded-full bg-[#9a6b00]" />
        <div className="absolute left-5 top-0 h-16 w-24 -rotate-12 rounded-full bg-[#0f766e]" />
        <div className="absolute left-12 top-2 h-16 w-24 rotate-12 rounded-full bg-[#1db7bd]" />
        <div className="absolute left-0 top-8 h-12 w-24 rotate-6 rounded-full bg-[#0f766e]" />
      </div>
    </div>
  );
}

function SchoolDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -bottom-8 left-0 h-24 w-full bg-[#d9f4f5]" />
      <div className="absolute bottom-12 right-20 hidden h-36 w-56 md:block">
        <div className="absolute bottom-0 left-0 h-24 w-56 rounded-t-2xl bg-white/80 shadow-sm" />
        <div className="absolute bottom-24 left-16 h-0 w-0 border-l-[48px] border-r-[48px] border-b-[52px] border-l-transparent border-r-transparent border-b-[#f36f45]" />
        <div className="absolute bottom-0 left-24 h-14 w-10 rounded-t-lg bg-[#17324d]" />
        <div className="absolute bottom-10 left-8 h-8 w-8 rounded-lg bg-[#fff3bf]" />
        <div className="absolute bottom-10 right-8 h-8 w-8 rounded-lg bg-[#fff3bf]" />
      </div>
      <div className="absolute bottom-10 right-8 h-24 w-20 rotate-6 rounded-2xl bg-[#f36f45] shadow-lg md:right-80">
        <div className="absolute -top-4 left-5 h-6 w-10 rounded-t-full border-4 border-[#17324d]" />
        <div className="absolute left-4 top-6 h-4 w-12 rounded-full bg-white/80" />
        <div className="absolute bottom-0 left-0 h-6 w-full rounded-b-2xl bg-[#c93f2a]" />
      </div>
    </div>
  );
}

function PlayDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-10 top-10 hidden h-32 w-32 rounded-full border-[14px] border-[#1db7bd] bg-white/70 md:block">
        <div className="absolute left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-full origin-bottom rounded-full bg-[#17324d]" />
        <div className="absolute left-1/2 top-1/2 h-1 w-10 -translate-y-1/2 rounded-full bg-[#f36f45]" />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#17324d]" />
      </div>
      <div className="absolute bottom-8 right-20 hidden h-28 w-24 md:block">
        <div className="absolute bottom-0 left-2 h-8 w-20 rounded-full bg-[#17324d]" />
        <div className="absolute bottom-7 left-5 h-14 w-14 rounded-t-full bg-[#17324d]" />
        <div className="absolute bottom-[4.5rem] left-8 h-8 w-8 rounded-full bg-[#17324d]" />
        <div className="absolute bottom-20 left-2 h-3 w-20 rounded-full bg-[#17324d]" />
      </div>
      <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-[#f36f45]/20" />
    </div>
  );
}

function NewDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-4 top-8 hidden rotate-6 rounded-[2rem] bg-[#f36f45] px-10 py-6 text-6xl font-black text-white shadow-xl md:block">
        NEW
      </div>
      <div className="absolute bottom-10 right-20 hidden h-24 w-24 rounded-full bg-[#1db7bd]/25 md:block" />
      <div className="absolute bottom-16 right-40 hidden h-12 w-12 rotate-12 rounded-xl bg-white/70 md:block" />
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/50" />
    </div>
  );
}

function GenericDecor({ variant }: { variant: CatalogueTheme["variant"] }) {
  if (variant === "beach") return <BeachDecor />;
  if (variant === "school") return <SchoolDecor />;
  if (variant === "play") return <PlayDecor />;
  if (variant === "new") return <NewDecor />;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/55" />
      <div className="absolute bottom-8 right-10 hidden h-24 w-24 rotate-12 rounded-3xl bg-white/60 md:block" />
      <div className="absolute bottom-10 right-36 hidden h-14 w-14 rounded-full bg-[#f36f45]/20 md:block" />
    </div>
  );
}

export default function CatalogueClient({
  initialCategory = "Toutes",
  initialCharacterTheme = "Tous",
  initialHighlight = "Tous",
  allowedCategories,
  categoryOptions,
  theme = defaultTheme,
}: CatalogueClientProps) {
  const searchParams = useSearchParams();
  const themeStyle = themeStyles[theme.variant];
  const visibleCategories = categoryOptions
    ? ["Toutes", ...categoryOptions]
    : categories;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || initialCategory
  );
  const [productType, setProductType] = useState(
    searchParams.get("productType") || "Tous"
  );
  const [characterTheme, setCharacterTheme] = useState(
    searchParams.get("character") || initialCharacterTheme,
  );
  const [schoolLevel, setSchoolLevel] = useState("Tous");
  const [gender, setGender] = useState("Tous");
  const [highlight, setHighlight] = useState(
    searchParams.get("highlight") || initialHighlight
  );
  const [sortBy, setSortBy] = useState("Plus récents");
  const [brandSearch, setBrandSearch] = useState("");
  const [colorSearch, setColorSearch] = useState("");
  const [ageSearch, setAgeSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];

    const storedFavorites = localStorage.getItem("kidiclass_favorites");
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from("products")
      .select("*")
      .or("is_archived.is.false,is_archived.is.null")
      .order("created_at", { ascending: false });

    setProducts((data as Product[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchProducts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const query = search.toLowerCase().trim();

      const searchableText = `
        ${product.name || ""}
        ${product.category || ""}
        ${product.product_type || ""}
        ${product.character_theme || ""}
        ${product.school_level || ""}
        ${product.brand || ""}
        ${product.colors || ""}
        ${product.target_age || ""}
        ${product.gender || ""}
      `.toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const categoryValues = categoryAliases[category] || [category];

      const matchesCategory =
        category === "Toutes" || categoryValues.includes(product.category);

      const matchesDepartment =
        !allowedCategories || allowedCategories.includes(product.category);

      const matchesType =
        productType === "Tous" || product.product_type === productType;

      const matchesTheme =
        characterTheme === "Tous" ||
        product.character_theme === characterTheme;

      const matchesSchool =
        schoolLevel === "Tous" || product.school_level === schoolLevel;

      const matchesGender = gender === "Tous" || product.gender === gender;

      const matchesHighlight =
        highlight === "Tous" ||
        (highlight === "Nouveautés" && product.is_new) ||
        (highlight === "Coups de cœur" && product.is_favorite) ||
        (highlight === "Promotions" && product.is_promo) ||
        (highlight === "Favoris" && favoriteIds.includes(product.id));

      const matchesBrand =
        !brandSearch.trim() ||
        (product.brand || "")
          .toLowerCase()
          .includes(brandSearch.toLowerCase().trim());

      const matchesColor =
        !colorSearch.trim() ||
        (product.colors || "")
          .toLowerCase()
          .includes(colorSearch.toLowerCase().trim());

      const matchesAge =
        !ageSearch.trim() ||
        (product.target_age || "")
          .toLowerCase()
          .includes(ageSearch.toLowerCase().trim());

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesCategory &&
        matchesType &&
        matchesTheme &&
        matchesSchool &&
        matchesGender &&
        matchesHighlight &&
        matchesBrand &&
        matchesColor &&
        matchesAge
      );
    });

    return filtered.sort((first, second) => {
      if (sortBy === "Prix croissant") {
        return Number(first.price || 0) - Number(second.price || 0);
      }

      if (sortBy === "Prix décroissant") {
        return Number(second.price || 0) - Number(first.price || 0);
      }

      if (sortBy === "Promos d'abord") {
        return Number(Boolean(second.is_promo)) - Number(Boolean(first.is_promo));
      }

      if (sortBy === "Disponibles d'abord") {
        return Number(second.stock || 0) - Number(first.stock || 0);
      }

      return 0;
    });
  }, [
    products,
    search,
    category,
    productType,
    characterTheme,
    schoolLevel,
    gender,
    highlight,
    brandSearch,
    colorSearch,
    ageSearch,
    favoriteIds,
    sortBy,
    allowedCategories,
  ]);

  function toggleFavorite(productId: number) {
    const nextFavorites = favoriteIds.includes(productId)
      ? favoriteIds.filter((id) => id !== productId)
      : [...favoriteIds, productId];

    setFavoriteIds(nextFavorites);
    localStorage.setItem("kidiclass_favorites", JSON.stringify(nextFavorites));
  }

  function resetFilters() {
    setSearch("");
    setCategory(initialCategory);
    setProductType("Tous");
    setCharacterTheme(initialCharacterTheme);
    setSchoolLevel("Tous");
    setGender("Tous");
    setHighlight(initialHighlight);
    setSortBy("Plus récents");
    setBrandSearch("");
    setColorSearch("");
    setAgeSearch("");
  }

  const activeFiltersCount = [
    search.trim(),
    category !== initialCategory,
    productType !== "Tous",
    characterTheme !== initialCharacterTheme,
    schoolLevel !== "Tous",
    gender !== "Tous",
    highlight !== initialHighlight,
    brandSearch.trim(),
    colorSearch.trim(),
    ageSearch.trim(),
  ].filter(Boolean).length;

  function getProductImage(product: Product) {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }

    return product.image_url || "";
  }

  return (
    <main className="min-h-screen bg-[#faf8f4]">
      <section
        className={`relative overflow-hidden px-4 py-8 sm:px-5 sm:py-14 ${themeStyle.section}`}
      >
        <GenericDecor variant={theme.variant} />

        <div className="relative mx-auto max-w-7xl">
          <div className={`max-w-4xl rounded-[2rem] p-0 md:p-8 ${themeStyle.panel}`}>
            <p className={`text-sm font-black uppercase ${themeStyle.badge}`}>
              {theme.eyebrow}
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight text-[#111827] sm:text-5xl md:text-7xl">
              {theme.title}
            </h1>

            <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-gray-700 sm:mt-5 sm:text-lg sm:leading-8">
              {theme.description}
            </p>
          </div>
        </div>
      </section>

      {filtersOpen && (
        <div className="fixed inset-0 z-[10000]">
          <button
            type="button"
            className="absolute inset-0 bg-gray-950/45"
            aria-label="Fermer les filtres"
            onClick={() => setFiltersOpen(false)}
          />

          <aside className="absolute left-0 top-0 flex h-full w-[min(92vw,420px)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e4ded4] px-4 py-4 sm:px-5">
              <div>
                <p className="text-xs font-black uppercase text-[#e85035]">
                  Catalogue
                </p>
                <h2 className="text-2xl font-black text-gray-950">Filtres</h2>
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ddd6cc] text-gray-950 hover:border-[#17324d]"
                aria-label="Fermer"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-black text-gray-700">
                    Recherche
                  </label>

                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                      strokeWidth={2.5}
                    />

                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      className="w-full rounded-xl border border-[#ddd6cc] bg-white py-3.5 pl-12 pr-4 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#17324d] focus:ring-4 focus:ring-[#17324d]/10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <KidiclassSelect label="Catégorie" value={category} options={visibleCategories} onChange={setCategory} />
                <KidiclassSelect label="Type de produit" value={productType} options={productTypes} onChange={setProductType} />
                <KidiclassSelect label="Personnage / thème" value={characterTheme} options={characterThemes} onChange={setCharacterTheme} />
                <KidiclassSelect label="Niveau scolaire" value={schoolLevel} options={schoolLevels} onChange={setSchoolLevel} />
                <KidiclassSelect label="Sexe" value={gender} options={genders} onChange={setGender} />
                <KidiclassSelect label="Mise en avant" value={highlight} options={highlightOptions} onChange={setHighlight} />
                <KidiclassSelect label="Tri" value={sortBy} options={sortOptions} onChange={setSortBy} />

                <input
                  type="text"
                  placeholder="Marque : Disney, Barbie..."
                  className="w-full rounded-xl border border-[#ddd6cc] bg-white p-3.5 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#17324d] focus:ring-4 focus:ring-[#17324d]/10"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Couleur : rose, bleu..."
                  className="w-full rounded-xl border border-[#ddd6cc] bg-white p-3.5 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#17324d] focus:ring-4 focus:ring-[#17324d]/10"
                  value={colorSearch}
                  onChange={(e) => setColorSearch(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Âge : 3-6 ans..."
                  className="w-full rounded-xl border border-[#ddd6cc] bg-white p-3.5 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#17324d] focus:ring-4 focus:ring-[#17324d]/10"
                  value={ageSearch}
                  onChange={(e) => setAgeSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-[#e4ded4] bg-[#faf8f4] p-4 sm:p-5">
              <p className="mb-3 text-sm font-bold text-gray-600">
                {activeFiltersCount > 0
                  ? `${activeFiltersCount} filtre(s) actif(s)`
                  : "Aucun filtre actif"}
              </p>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="kidiclass-button-primary flex items-center justify-center px-5 py-3"
                >
                  Voir les articles
                </button>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#111827] px-5 py-3 text-sm font-black text-[#111827] hover:bg-[#111827] hover:text-white"
                >
                  <RotateCcw size={17} strokeWidth={2.5} />
                  Réinitialiser
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <section className="px-4 py-8 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="hidden">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-5">
              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Recherche
                </label>

                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={22}
                    strokeWidth={2.5}
                  />

                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    className="w-full rounded-xl border border-[#ddd6cc] bg-white py-3.5 pl-12 pr-4 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#17324d] focus:ring-4 focus:ring-[#17324d]/10 sm:py-4 sm:pl-14 sm:pr-5"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <KidiclassSelect
                label="Catégorie"
                value={category}
                options={visibleCategories}
                onChange={setCategory}
              />

              <KidiclassSelect
                label="Type de produit"
                value={productType}
                options={productTypes}
                onChange={setProductType}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KidiclassSelect
                label="Personnage / thème"
                value={characterTheme}
                options={characterThemes}
                onChange={setCharacterTheme}
              />

              <KidiclassSelect
                label="Niveau scolaire"
                value={schoolLevel}
                options={schoolLevels}
                onChange={setSchoolLevel}
              />

              <KidiclassSelect
                label="Sexe"
                value={gender}
                options={genders}
                onChange={setGender}
              />

              <KidiclassSelect
                label="Mise en avant"
                value={highlight}
                options={highlightOptions}
                onChange={setHighlight}
              />

              <KidiclassSelect
                label="Tri"
                value={sortBy}
                options={sortOptions}
                onChange={setSortBy}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <input
                type="text"
                placeholder="Marque : Disney, Barbie..."
                className="rounded-xl border border-[#ddd6cc] bg-white p-3.5 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#17324d] focus:ring-4 focus:ring-[#17324d]/10 sm:p-4"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
              />

              <input
                type="text"
                placeholder="Couleur : rose, bleu..."
                className="rounded-xl border border-[#ddd6cc] bg-white p-3.5 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#17324d] focus:ring-4 focus:ring-[#17324d]/10 sm:p-4"
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
              />

              <input
                type="text"
                placeholder="Âge : 3-6 ans..."
                className="rounded-xl border border-[#ddd6cc] bg-white p-3.5 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#17324d] focus:ring-4 focus:ring-[#17324d]/10 sm:p-4"
                value={ageSearch}
                onChange={(e) => setAgeSearch(e.target.value)}
              />
            </div>

            <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl bg-[#faf8f4] p-4 sm:flex-row sm:items-center sm:gap-4">
              <p className="text-sm font-bold text-gray-600">
                {activeFiltersCount > 0
                  ? `${activeFiltersCount} filtre(s) actif(s)`
                  : "Aucun filtre actif"}
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#111827] px-5 py-3 text-sm font-black text-[#111827] hover:bg-[#111827] hover:text-white sm:w-fit"
              >
                <RotateCcw size={17} strokeWidth={2.5} />
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17324d] px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#111827] sm:w-fit"
            >
              <SlidersHorizontal size={18} strokeWidth={2.5} />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-[#17324d]">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <h2 className="text-2xl font-black text-gray-950 sm:text-3xl">
              {loading
                ? "Chargement..."
                : `${filteredProducts.length} article${
                    filteredProducts.length > 1 ? "s" : ""
                  }`}
            </h2>
          </div>

          {loading ? (
            <div className="retail-card mt-8 p-10 text-center font-black text-[#17324d]">
              Chargement des produits...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="retail-card mt-8 border-dashed p-10 text-center">
              <h3 className="text-2xl font-black text-gray-950">
                Aucun produit trouvé
              </h3>

              <p className="mt-2 font-bold text-gray-500">
                Essayez de modifier les filtres.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/produit/${product.id}`}
                  className="group overflow-hidden rounded-xl border border-[#e4ded4] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-44 overflow-hidden bg-[#f4efe7] sm:h-64 lg:h-80">
                    {getProductImage(product) ? (
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <PackageCheck size={48} strokeWidth={2.5} />
                      </div>
                    )}

                    <div className="absolute left-2 top-2 flex flex-wrap gap-1.5 sm:left-4 sm:top-4 sm:gap-2">
                      {product.is_new && (
                        <span className="flex items-center gap-1 rounded-full bg-[#e9fbfc] px-2 py-1 text-[10px] font-black text-[#0f766e] shadow-sm sm:px-3 sm:text-xs">
                          <Sparkles size={13} strokeWidth={3} />
                          Nouveau
                        </span>
                      )}

                      {product.is_favorite && (
                        <span className="flex items-center gap-1 rounded-full bg-[#fff1f5] px-2 py-1 text-[10px] font-black text-[#f36f45] shadow-sm sm:px-3 sm:text-xs">
                          <Heart size={13} strokeWidth={3} />
                          Coup de cœur
                        </span>
                      )}

                      {product.is_promo && (
                        <span className="flex items-center gap-1 rounded-full bg-[#f36f45] px-2 py-1 text-[10px] font-black text-white sm:px-3 sm:text-xs">
                          <Tag size={13} strokeWidth={3} />
                          Promo
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        toggleFavorite(product.id);
                      }}
                      className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-105 sm:right-4 sm:top-4 sm:h-11 sm:w-11 ${
                        favoriteIds.includes(product.id)
                          ? "text-[#f36f45]"
                          : "text-gray-400 hover:text-[#f36f45]"
                      }`}
                      aria-label="Ajouter aux favoris"
                    >
                      <Heart
                        size={20}
                        fill={favoriteIds.includes(product.id) ? "currentColor" : "none"}
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>

                  <div className="p-3 sm:p-5">
                    <p className="text-xs font-black uppercase text-[#1db7bd]">
                      {product.category}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-sm font-black text-gray-950 sm:text-xl">
                      {product.name}
                    </h3>

                    <div className="mt-3 flex flex-col gap-2 sm:mt-4 min-[520px]:flex-row min-[520px]:items-end min-[520px]:justify-between">
                      <div>
                        <p className="text-sm font-black text-[#f36f45] sm:text-xl">
                          {Number(product.price || 0).toLocaleString("fr-FR")}{" "}
                          FCFA
                        </p>

                        {product.old_price && (
                          <p className="text-xs font-bold text-gray-400 line-through sm:text-sm">
                            {Number(product.old_price).toLocaleString("fr-FR")}{" "}
                            FCFA
                          </p>
                        )}
                      </div>

                      <span
                        className={`w-fit rounded-full px-2 py-1 text-[10px] font-black sm:px-3 sm:text-xs ${
                          Number(product.stock || 0) > 0
                            ? "bg-[#e9fbfc] text-[#0f766e]"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {Number(product.stock || 0) > 0
                          ? getProductAvailabilityLabel(
                              product.availability_status
                            )
                          : "Rupture"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
