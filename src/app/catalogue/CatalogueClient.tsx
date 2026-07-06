"use client";

import KidiclassSelect from "@/components/KidiclassSelect";
import { useTaxonomySettings } from "@/hooks/useTaxonomySettings";
import {
  getProductAvailabilityBadgeLabels,
  getProductAvailabilityLabel,
} from "@/lib/productAvailability";
import {
  getTaxonomyCategoryLabels,
  getTaxonomyDepartmentCategories,
} from "@/lib/taxonomySettings";
import { supabase } from "@/lib/supabase";
import {
  Backpack,
  BadgePercent,
  Gamepad2,
  Heart,
  PackageCheck,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Utensils,
  Waves,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  variant:
    | "default"
    | "school"
    | "meal"
    | "beach"
    | "play"
    | "characters"
    | "new"
    | "promotion";
};

type CatalogueClientProps = {
  initialCategory?: string;
  initialCharacterTheme?: string;
  initialHighlight?: string;
  allowedCategories?: string[];
  categoryOptions?: string[];
  departmentId?: string;
  theme?: CatalogueTheme;
};

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
  title: "Toute la boutique, pour tous leurs moments",
  description:
    "École, goûters, plage, jeux et personnages : retrouvez toutes les collections KidiClass au même endroit.",
  variant: "default",
};

const themeStyles = {
  default: {
    section: "bg-[#f4fbfa]",
    badge: "text-[#e85035]",
    panel: "bg-transparent",
    accent: "#d9472d",
    soft: "#fff0e8",
    ink: "#9a3412",
  },
  school: {
    section: "bg-[#fff3bf]",
    badge: "text-[#7a5200]",
    panel: "bg-[#fffdf7]",
    accent: "#e0a800",
    soft: "#fff3bf",
    ink: "#6f4e00",
  },
  meal: {
    section: "bg-[#fff0e8]",
    badge: "text-[#9a3412]",
    panel: "bg-[#e9fbfc]",
    accent: "#f36f45",
    soft: "#fff0e8",
    ink: "#9a3412",
  },
  beach: {
    section: "bg-[#dff8ff]",
    badge: "text-[#0089a7]",
    panel: "bg-[#fff9cf]",
    accent: "#0089a7",
    soft: "#dff8ff",
    ink: "#075985",
  },
  play: {
    section: "bg-[#fff1f5]",
    badge: "text-[#f36f45]",
    panel: "bg-[#e9fbfc]",
    accent: "#e84a77",
    soft: "#fff1f5",
    ink: "#9d174d",
  },
  characters: {
    section: "bg-[#f2edff]",
    badge: "text-[#5b21b6]",
    panel: "bg-white",
    accent: "#7c3aed",
    soft: "#f2edff",
    ink: "#5b21b6",
  },
  new: {
    section: "bg-[#fff3bf]",
    badge: "text-[#e85035]",
    panel: "bg-white",
    accent: "#e85035",
    soft: "#fff3bf",
    ink: "#9a3412",
  },
  promotion: {
    section: "bg-[#fff0e8]",
    badge: "text-[#9a3412]",
    panel: "bg-white/55",
    accent: "#d9472d",
    soft: "#fff0e8",
    ink: "#9a3412",
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
      <div className="absolute -bottom-8 left-0 h-24 w-full bg-[#ffe28a]" />
      <div className="absolute bottom-12 right-20 hidden h-36 w-56 md:block">
        <div className="absolute bottom-0 left-0 h-24 w-56 rounded-t-2xl bg-white/80 shadow-sm" />
        <div className="absolute bottom-24 left-16 h-0 w-0 border-l-[48px] border-r-[48px] border-b-[52px] border-l-transparent border-r-transparent border-b-[#f36f45]" />
        <div className="absolute bottom-0 left-24 h-14 w-10 rounded-t-lg bg-[#17324d]" />
        <div className="absolute bottom-10 left-8 h-8 w-8 rounded-lg bg-[#8edbe0]" />
        <div className="absolute bottom-10 right-8 h-8 w-8 rounded-lg bg-[#8edbe0]" />
      </div>
      <div className="absolute bottom-10 right-8 h-24 w-20 rotate-6 rounded-2xl bg-[#f36f45] shadow-lg md:right-80">
        <div className="absolute -top-4 left-5 h-6 w-10 rounded-t-full border-4 border-[#17324d]" />
        <div className="absolute left-4 top-6 h-4 w-12 rounded-full bg-white/80" />
        <div className="absolute bottom-0 left-0 h-6 w-full rounded-b-2xl bg-[#c93f2a]" />
      </div>
    </div>
  );
}

function CatalogueDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[#087f83] lg:block" />
      <div className="absolute right-12 top-1/2 hidden -translate-y-1/2 grid-cols-2 gap-3 lg:grid">
        {[
          { label: "École", Icon: Backpack, color: "bg-[#fff3bf] text-[#6f4e00]" },
          { label: "Goûter", Icon: Utensils, color: "bg-[#fff0e8] text-[#9a3412]" },
          { label: "Plage", Icon: Waves, color: "bg-[#dff8ff] text-[#075985]" },
          { label: "Jeux", Icon: Gamepad2, color: "bg-[#fff1f5] text-[#9d174d]" },
        ].map(({ label, Icon, color }) => (
          <div
            key={label}
            className={`flex h-28 w-36 flex-col justify-between rounded-lg p-4 shadow-lg ${color}`}
          >
            <Icon size={30} strokeWidth={2.4} />
            <span className="text-lg font-black">{label}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 h-3 w-full bg-[#f36f45]" />
    </div>
  );
}

function MealDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -bottom-10 left-0 h-24 w-full bg-[#ffd96a]/55" />
      <div className="absolute bottom-10 right-16 hidden h-32 w-44 rounded-lg bg-[#f36f45] shadow-xl md:block">
        <div className="absolute -top-5 left-12 h-8 w-20 rounded-t-full border-8 border-[#17324d] border-b-0" />
        <div className="absolute left-5 top-5 h-5 w-32 rounded-full bg-white/85" />
        <div className="absolute bottom-5 left-5 h-16 w-16 rounded-full bg-[#ffe773]" />
        <div className="absolute bottom-8 right-6 h-12 w-12 rounded-lg bg-[#e9fbfc]" />
      </div>
      <div className="absolute bottom-8 right-64 hidden h-36 w-14 rounded-[1.5rem] bg-[#1db7bd] shadow-lg md:block">
        <div className="absolute -top-3 left-3 h-6 w-8 rounded-lg bg-[#17324d]" />
        <div className="absolute left-2 top-10 h-10 w-10 rounded-full bg-white/80" />
      </div>
      <div className="absolute right-8 top-8 h-16 w-16 rounded-full bg-[#ffe773] md:right-80" />
    </div>
  );
}

function CharactersDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-8 top-8 hidden rotate-3 rounded-lg border-4 border-white bg-[#7c3aed] px-8 py-5 text-4xl font-black text-white shadow-xl md:block">
        HÉROS
      </div>
      <div className="absolute bottom-8 right-12 hidden max-w-xs flex-wrap justify-end gap-2 md:flex">
        {['STITCH', 'SONIC', 'BARBIE', 'MARIO'].map((name, index) => (
          <span
            key={name}
            className={`rounded-full px-4 py-2 text-sm font-black shadow-sm ${
              index % 2 === 0
                ? "bg-[#ffe773] text-[#5b21b6]"
                : "bg-white text-[#7c3aed]"
            }`}
          >
            {name}
          </span>
        ))}
      </div>
      <div className="absolute -bottom-10 right-72 hidden h-36 w-36 rotate-12 rounded-lg bg-[#e84a77]/25 md:block" />
      <div className="absolute right-4 top-4 h-24 w-24 rounded-full bg-white/50 md:hidden" />
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
      <div className="absolute -bottom-12 -right-12 hidden h-48 w-48 rounded-full bg-[#f36f45]/20 md:block" />
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

function PromotionDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -bottom-12 left-0 h-24 w-full bg-[#ffe773]/65" />
      <div className="absolute right-8 top-8 hidden rotate-6 items-center gap-4 rounded-lg bg-[#d9472d] px-8 py-6 text-white shadow-xl md:flex">
        <BadgePercent size={52} strokeWidth={2.8} />
        <span className="text-4xl font-black">PROMO</span>
      </div>
      <div className="absolute bottom-8 right-72 hidden h-24 w-24 rotate-12 rounded-lg bg-[#087f83] md:block" />
      <div className="absolute bottom-14 right-80 hidden h-12 w-12 -rotate-6 rounded-lg bg-white md:block" />
      <div className="absolute -right-12 -top-12 hidden h-40 w-40 rounded-full bg-[#ffe773]/75 md:block" />
    </div>
  );
}

function GenericDecor({ variant }: { variant: CatalogueTheme["variant"] }) {
  if (variant === "default") return <CatalogueDecor />;
  if (variant === "beach") return <BeachDecor />;
  if (variant === "school") return <SchoolDecor />;
  if (variant === "meal") return <MealDecor />;
  if (variant === "play") return <PlayDecor />;
  if (variant === "characters") return <CharactersDecor />;
  if (variant === "new") return <NewDecor />;
  if (variant === "promotion") return <PromotionDecor />;

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
  departmentId,
  theme = defaultTheme,
}: CatalogueClientProps) {
  const searchParams = useSearchParams();
  const { settings: taxonomySettings } = useTaxonomySettings();
  const themeStyle = themeStyles[theme.variant];
  const themeVariables = {
    "--kc-accent": themeStyle.accent,
    "--kc-soft": themeStyle.soft,
    "--kc-ink": themeStyle.ink,
  } as CSSProperties;
  const dynamicDepartmentCategories = useMemo(
    () =>
      departmentId
        ? getTaxonomyDepartmentCategories(taxonomySettings, departmentId)
        : undefined,
    [departmentId, taxonomySettings],
  );
  const effectiveAllowedCategories = useMemo(
    () =>
      dynamicDepartmentCategories && dynamicDepartmentCategories.length > 0
        ? dynamicDepartmentCategories
        : allowedCategories,
    [allowedCategories, dynamicDepartmentCategories],
  );
  const visibleCategories =
    categoryOptions || effectiveAllowedCategories
      ? ["Toutes", ...(categoryOptions || effectiveAllowedCategories || [])]
      : ["Toutes", ...getTaxonomyCategoryLabels(taxonomySettings)];
  const productTypes = ["Tous", ...taxonomySettings.productTypes];
  const characterThemes = ["Tous", ...taxonomySettings.characters];
  const schoolLevels = ["Tous", ...taxonomySettings.schoolLevels];

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
        !effectiveAllowedCategories ||
        effectiveAllowedCategories.includes(product.category);

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
    effectiveAllowedCategories,
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
    <main className="min-h-screen bg-[#faf8f4]" style={themeVariables}>
      <section
        className={`relative overflow-hidden px-4 py-7 sm:px-5 sm:py-14 ${themeStyle.section}`}
      >
        <GenericDecor variant={theme.variant} />

        <div className="relative mx-auto max-w-7xl">
          <div
            className={`max-w-4xl rounded-[2rem] p-0 md:p-8 ${themeStyle.panel} ${
              theme.variant === "default" ? "lg:max-w-[56%]" : ""
            }`}
          >
            <p className={`text-sm font-black uppercase ${themeStyle.badge}`}>
              {theme.eyebrow}
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight text-[#111827] min-[390px]:text-4xl sm:mt-4 sm:text-5xl md:text-7xl">
              {theme.title}
            </h1>

            <p className="mt-4 max-w-2xl text-[0.95rem] font-bold leading-7 text-gray-700 sm:mt-5 sm:text-lg sm:leading-8">
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
                <p className="text-xs font-black uppercase text-[var(--kc-accent)]">
                  Catalogue
                </p>
                <h2 className="text-2xl font-black text-gray-950">Filtres</h2>
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ddd6cc] text-gray-950 hover:border-[var(--kc-accent)] hover:bg-[var(--kc-soft)] hover:text-[var(--kc-ink)]"
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
                      className="w-full rounded-xl border border-[#ddd6cc] bg-white py-3.5 pl-12 pr-4 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[var(--kc-accent)] focus:ring-4 focus:ring-[var(--kc-soft)]"
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
                  className="w-full rounded-xl border border-[#ddd6cc] bg-white p-3.5 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[var(--kc-accent)] focus:ring-4 focus:ring-[var(--kc-soft)]"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Couleur : rose, bleu..."
                  className="w-full rounded-xl border border-[#ddd6cc] bg-white p-3.5 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[var(--kc-accent)] focus:ring-4 focus:ring-[var(--kc-soft)]"
                  value={colorSearch}
                  onChange={(e) => setColorSearch(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Âge : 3-6 ans..."
                  className="w-full rounded-xl border border-[#ddd6cc] bg-white p-3.5 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[var(--kc-accent)] focus:ring-4 focus:ring-[var(--kc-soft)]"
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
                  className="flex items-center justify-center rounded-lg bg-[var(--kc-accent)] px-5 py-3 font-black text-white hover:bg-[var(--kc-ink)]"
                >
                  Voir les articles
                </button>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#087f83] px-5 py-3 text-sm font-black text-[#087f83] hover:bg-[#087f83] hover:text-white"
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
                    className="w-full rounded-xl border border-[#ddd6cc] bg-white py-3.5 pl-12 pr-4 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[var(--kc-accent)] focus:ring-4 focus:ring-[var(--kc-soft)] sm:py-4 sm:pl-14 sm:pr-5"
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
                className="rounded-xl border border-[#ddd6cc] bg-white p-3.5 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[var(--kc-accent)] focus:ring-4 focus:ring-[var(--kc-soft)] sm:p-4"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
              />

              <input
                type="text"
                placeholder="Couleur : rose, bleu..."
                className="rounded-xl border border-[#ddd6cc] bg-white p-3.5 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[var(--kc-accent)] focus:ring-4 focus:ring-[var(--kc-soft)] sm:p-4"
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
              />

              <input
                type="text"
                placeholder="Âge : 3-6 ans..."
                className="rounded-xl border border-[#ddd6cc] bg-white p-3.5 text-base font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[var(--kc-accent)] focus:ring-4 focus:ring-[var(--kc-soft)] sm:p-4"
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
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#087f83] px-5 py-3 text-sm font-black text-[#087f83] hover:bg-[#087f83] hover:text-white sm:w-fit"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--kc-accent)] px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[var(--kc-ink)] sm:w-fit"
            >
              <SlidersHorizontal size={18} strokeWidth={2.5} />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-[var(--kc-ink)]">
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
            <div className="retail-card mt-8 p-6 text-center font-black text-[var(--kc-ink)] sm:p-10">
              Chargement des produits...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="retail-card mt-8 border-dashed p-6 text-center sm:p-10">
              <h3 className="text-xl font-black text-gray-950 sm:text-2xl">
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
                  className="group overflow-hidden rounded-xl border border-[#e4ded4] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[var(--kc-accent)] hover:shadow-xl"
                >
                  <div className="relative h-40 overflow-hidden bg-[#f4efe7] min-[390px]:h-44 sm:h-64 lg:h-80">
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
                    <p className="text-[10px] font-black uppercase leading-tight text-[var(--kc-accent)] sm:text-xs">
                      {product.category}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-[13px] font-black leading-tight text-gray-950 sm:text-xl">
                      {product.name}
                    </h3>

                    <div className="mt-3 flex flex-col gap-2 sm:mt-4 min-[520px]:flex-row min-[520px]:items-end min-[520px]:justify-between">
                      <div>
                        <p className="text-[13px] font-black text-[#f36f45] sm:text-xl">
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

                      {Number(product.stock || 0) > 0 ? (
                        <div
                          title={getProductAvailabilityLabel(
                            product.availability_status,
                          )}
                          className="flex max-w-full flex-wrap gap-1.5 min-[520px]:justify-end"
                        >
                          {getProductAvailabilityBadgeLabels(
                            product.availability_status,
                          ).map((label) => (
                            <span
                              key={label}
                              className="rounded-full bg-[var(--kc-soft)] px-2.5 py-1.5 text-[9px] font-black leading-tight text-[var(--kc-ink)] sm:text-[10px]"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="w-fit rounded-full bg-red-50 px-2.5 py-1.5 text-[10px] font-black leading-none text-red-500 sm:px-3 sm:text-xs">
                          Rupture
                        </span>
                      )}
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
