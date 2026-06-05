"use client";

import Link from "next/link";
import KidiclassSelect from "@/components/KidiclassSelect";
import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  Filter,
  Heart,
  Palette,
  Search,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  image_url: string | null;
  category: string | null;
  reference: string | null;
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
};

const categories = [
  "Toutes",
  "Filles",
  "Garçons",
  "Bébés",
  "Scolaire",
  "Chaussures",
  "Accessoires",
  "PACK",
];

const productTypes = [
  "Tous",
  "Robe",
  "Ensemble",
  "T-shirt",
  "Pantalon",
  "Short",
  "Jupe",
  "Chaussure",
  "Sac",
  "Trousse",
  "Gourde",
  "Boîte à goûter",
  "Sac à goûter",
  "Pack scolaire",
  "Accessoire",
  "Autre",
];

const characterThemes = [
  "Tous",
  "Barbie",
  "Mickey",
  "Minnie",
  "Spiderman",
  "Princesse",
  "Pat Patrouille",
  "Licorne",
  "Cars",
  "Hello Kitty",
  "Sans thème",
];

const schoolLevels = [
  "Tous",
  "Non concerné",
  "Maternelle",
  "CP",
  "CE1",
  "CE2",
  "CM1",
  "CM2",
  "Collège",
];

const genders = ["Tous", "Fille", "Garçon", "Mixte"];

const highlightOptions = [
  "Tous",
  "Nouveautés",
  "Coups de cœur",
  "Promotions",
];

export default function CataloguePage() {
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "Toutes";
  const initialProductType = searchParams.get("productType") || "Tous";

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [productType, setProductType] = useState(initialProductType);
  const [characterTheme, setCharacterTheme] = useState("Tous");
  const [schoolLevel, setSchoolLevel] = useState("Tous");
  const [gender, setGender] = useState("Tous");
  const [highlight, setHighlight] = useState("Tous");
  const [brandSearch, setBrandSearch] = useState("");
  const [colorSearch, setColorSearch] = useState("");
  const [ageSearch, setAgeSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "Toutes");
    setProductType(searchParams.get("productType") || "Tous");
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      setProducts((data as Product[]) || []);
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.toLowerCase().trim();

      const searchableText = `${product.name || ""} ${
        product.description || ""
      } ${product.category || ""} ${product.product_type || ""} ${
        product.character_theme || ""
      } ${product.school_level || ""} ${product.reference || ""} ${
        product.brand || ""
      } ${product.colors || ""} ${product.target_age || ""} ${
        product.gender || ""
      }`.toLowerCase();

      const matchesSearch = query ? searchableText.includes(query) : true;

      const matchesCategory =
        category === "Toutes" ? true : product.category === category;

      const matchesProductType =
        productType === "Tous" ? true : product.product_type === productType;

      const matchesTheme =
        characterTheme === "Tous"
          ? true
          : product.character_theme === characterTheme;

      const matchesSchoolLevel =
        schoolLevel === "Tous" ? true : product.school_level === schoolLevel;

      const matchesGender =
        gender === "Tous" ? true : product.gender === gender;

      const matchesBrand = brandSearch.trim()
        ? (product.brand || "")
            .toLowerCase()
            .includes(brandSearch.toLowerCase().trim())
        : true;

      const matchesColor = colorSearch.trim()
        ? (product.colors || "")
            .toLowerCase()
            .includes(colorSearch.toLowerCase().trim())
        : true;

      const matchesAge = ageSearch.trim()
        ? (product.target_age || "")
            .toLowerCase()
            .includes(ageSearch.toLowerCase().trim())
        : true;

      const matchesHighlight =
        highlight === "Tous"
          ? true
          : highlight === "Nouveautés"
          ? Boolean(product.is_new)
          : highlight === "Coups de cœur"
          ? Boolean(product.is_favorite)
          : highlight === "Promotions"
          ? Boolean(product.is_promo)
          : true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesProductType &&
        matchesTheme &&
        matchesSchoolLevel &&
        matchesGender &&
        matchesBrand &&
        matchesColor &&
        matchesAge &&
        matchesHighlight
      );
    });
  }, [
    products,
    search,
    category,
    productType,
    characterTheme,
    schoolLevel,
    gender,
    brandSearch,
    colorSearch,
    ageSearch,
    highlight,
  ]);

  function resetFilters() {
    setSearch("");
    setCategory("Toutes");
    setProductType("Tous");
    setCharacterTheme("Tous");
    setSchoolLevel("Tous");
    setGender("Tous");
    setHighlight("Tous");
    setBrandSearch("");
    setColorSearch("");
    setAgeSearch("");
  }

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <section className="relative overflow-hidden border-b border-gray-100 bg-[#e9fbfc] px-6 py-14">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#ffe773]/70 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#f36f45]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-black uppercase tracking-wide text-[#1db7bd] shadow-sm">
            <Sparkles size={18} strokeWidth={2.5} />
            Catalogue KidiClass
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-tight text-gray-950 md:text-7xl">
            Trouvez le look parfait pour chaque enfant.
          </h1>

          <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-gray-600">
            Filtrez les articles par catégorie, type, personnage, âge, sexe,
            couleur, marque ou mise en avant.
          </p>

          <div className="mt-8 grid max-w-4xl gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-[#1db7bd]">
                {products.length}
              </p>
              <p className="text-xs font-bold text-gray-500">
                article(s) au total
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-[#f36f45]">
                {filteredProducts.length}
              </p>
              <p className="text-xs font-bold text-gray-500">
                résultat(s) trouvé(s)
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-[#c7a900]">
                {products.filter((product) => product.is_pack).length}
              </p>
              <p className="text-xs font-bold text-gray-500">pack(s)</p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-[#1db7bd]">
                {products.filter((product) => product.is_promo).length}
              </p>
              <p className="text-xs font-bold text-gray-500">promo(s)</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[340px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-44">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
                <Filter size={30} strokeWidth={2.5} />
              </div>

              <h2 className="text-3xl font-black text-gray-950">Filtres</h2>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-full bg-[#fff1f5] px-4 py-2 text-sm font-black text-[#f36f45] hover:bg-[#f36f45] hover:text-white"
            >
              <X size={17} strokeWidth={2.5} />
              Effacer
            </button>
          </div>

          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-gray-700">
                Recherche
              </span>

              <div className="flex items-center gap-3 rounded-[1.4rem] border-2 border-[#bfedf0] bg-white px-4 shadow-sm focus-within:border-[#1db7bd] focus-within:ring-4 focus-within:ring-[#1db7bd]/15">
                <Search
                  size={20}
                  className="text-[#1db7bd]"
                  strokeWidth={2.5}
                />

                <input
                  type="text"
                  placeholder="Sac Barbie, robe fille, CP..."
                  className="w-full bg-transparent py-4 font-bold text-black outline-none placeholder:text-gray-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </label>

            <KidiclassSelect
              label="Mise en avant"
              value={highlight}
              options={highlightOptions}
              onChange={setHighlight}
            />

            <KidiclassSelect
              label="Catégorie"
              value={category}
              options={categories}
              onChange={setCategory}
            />

            <KidiclassSelect
              label="Type de produit"
              value={productType}
              options={productTypes}
              onChange={setProductType}
            />

            <KidiclassSelect
              label="Sexe"
              value={gender}
              options={genders}
              onChange={setGender}
            />

            <KidiclassSelect
              label="Personnage / thème"
              value={characterTheme}
              options={characterThemes}
              onChange={setCharacterTheme}
            />

            <KidiclassSelect
              label="Classe / niveau scolaire"
              value={schoolLevel}
              options={schoolLevels}
              onChange={setSchoolLevel}
            />

            <label className="block">
              <span className="mb-2 block text-sm font-black text-gray-700">
                Marque
              </span>

              <input
                type="text"
                placeholder="Ex : Barbie, Disney..."
                className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-gray-700">
                Couleur
              </span>

              <input
                type="text"
                placeholder="Ex : rose, bleu..."
                className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-gray-700">
                Âge
              </span>

              <input
                type="text"
                placeholder="Ex : 3-6 ans"
                className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                value={ageSearch}
                onChange={(e) => setAgeSearch(e.target.value)}
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl bg-[#fff9cf] p-5 text-sm font-bold leading-6 text-gray-700">
            Astuce : utilisez les filtres “Promo”, “Coup de cœur” ou “PACK”
            pour retrouver rapidement les articles mis en avant.
          </div>
        </aside>

        <section>
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1db7bd]">
                Résultats
              </p>

              <h2 className="mt-2 text-3xl font-black text-gray-950">
                {filteredProducts.length} produit(s) trouvé(s)
              </h2>
            </div>

            <Link
              href="/panier"
              className="flex w-fit items-center gap-2 rounded-full bg-[#f36f45] px-6 py-3 font-black text-white shadow-sm hover:bg-[#e85e33]"
            >
              <ShoppingBag size={20} strokeWidth={2.5} />
              Voir le panier
            </Link>
          </div>

          {loading ? (
            <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
              <p className="font-black text-[#1db7bd]">
                Chargement du catalogue...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[2rem] border border-gray-100 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1f5] text-[#f36f45]">
                <Search size={34} strokeWidth={2.5} />
              </div>

              <h3 className="text-2xl font-black text-gray-950">
                Aucun produit trouvé
              </h3>

              <p className="mt-3 text-gray-600">
                Essayez de modifier votre recherche ou d’effacer les filtres.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full bg-[#1db7bd] px-7 py-3 font-black text-white hover:bg-[#159ca1]"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const isOutOfStock = Number(product.stock || 0) <= 0;
                const isPack =
                  product.category === "PACK" || Boolean(product.is_pack);

                const hasOldPrice =
                  product.old_price !== null &&
                  Number(product.old_price) > Number(product.price);

                return (
                  <Link
                    key={product.id}
                    href={`/produit/${product.id}`}
                    className="group rounded-[2rem] bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative overflow-hidden rounded-[1.5rem] bg-gray-100">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-64 w-full object-cover object-top transition duration-300 group-hover:scale-105 md:h-80"
                        />
                      ) : (
                        <div className="flex h-64 w-full items-center justify-center bg-[#f4f4f5] text-gray-400 md:h-80">
                          <div className="text-center">
                            <Shirt
                              size={40}
                              className="mx-auto mb-3"
                              strokeWidth={2.5}
                            />
                            <p className="text-sm font-black">Aucune image</p>
                          </div>
                        </div>
                      )}

                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {product.is_new && (
                          <span className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#1db7bd] shadow-sm">
                            <Sparkles size={13} strokeWidth={2.5} />
                            Nouveau
                          </span>
                        )}

                        {isPack && (
                          <span className="rounded-full bg-[#fff9cf]/95 px-3 py-1 text-xs font-black text-[#c7a900] shadow-sm">
                            PACK
                          </span>
                        )}

                        {product.is_promo && (
                          <span className="rounded-full bg-[#fff1f5]/95 px-3 py-1 text-xs font-black text-[#f36f45] shadow-sm">
                            Promo
                          </span>
                        )}
                      </div>

                      {product.is_favorite && (
                        <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#c7a900] shadow-sm">
                          <Star size={20} strokeWidth={2.5} />
                        </div>
                      )}

                      {isOutOfStock && (
                        <div className="absolute bottom-3 left-3 rounded-full bg-red-500 px-4 py-2 text-xs font-black text-white shadow-sm">
                          Rupture
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {product.category && (
                          <span className="rounded-full bg-[#e9fbfc] px-3 py-1 text-xs font-black text-[#1db7bd]">
                            {product.category}
                          </span>
                        )}

                        {product.product_type && (
                          <span className="rounded-full bg-[#fff1f5] px-3 py-1 text-xs font-black text-[#f36f45]">
                            {product.product_type}
                          </span>
                        )}
                      </div>

                      <h3 className="line-clamp-2 min-h-[48px] text-lg font-black leading-6 text-gray-950">
                        {product.name}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.brand && (
                          <span className="flex items-center gap-1 rounded-full bg-[#fffdf7] px-3 py-1 text-xs font-bold text-gray-600">
                            <BadgeCheck size={13} strokeWidth={2.5} />
                            {product.brand}
                          </span>
                        )}

                        {product.colors && (
                          <span className="flex items-center gap-1 rounded-full bg-[#fffdf7] px-3 py-1 text-xs font-bold text-gray-600">
                            <Palette size={13} strokeWidth={2.5} />
                            {product.colors}
                          </span>
                        )}

                        {product.gender && (
                          <span className="flex items-center gap-1 rounded-full bg-[#fffdf7] px-3 py-1 text-xs font-bold text-gray-600">
                            <Heart size={13} strokeWidth={2.5} />
                            {product.gender}
                          </span>
                        )}

                        {product.target_age && (
                          <span className="flex items-center gap-1 rounded-full bg-[#fffdf7] px-3 py-1 text-xs font-bold text-gray-600">
                            <UserRound size={13} strokeWidth={2.5} />
                            {product.target_age}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap items-end gap-2">
                        <p className="text-2xl font-black text-[#f36f45]">
                          {Number(product.price).toLocaleString("fr-FR")} FCFA
                        </p>

                        {hasOldPrice && (
                          <p className="text-sm font-black text-gray-400 line-through">
                            {Number(product.old_price).toLocaleString("fr-FR")}{" "}
                            FCFA
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        {isOutOfStock ? (
                          <p className="text-sm font-black text-red-500">
                            Indisponible
                          </p>
                        ) : (
                          <p className="text-sm font-black text-green-600">
                            {isPack
                              ? `${product.stock} pack(s)`
                              : `Stock : ${product.stock}`}
                          </p>
                        )}

                        <span className="rounded-full bg-[#e9fbfc] px-4 py-2 text-xs font-black text-[#1db7bd] group-hover:bg-[#1db7bd] group-hover:text-white">
                          Voir
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}