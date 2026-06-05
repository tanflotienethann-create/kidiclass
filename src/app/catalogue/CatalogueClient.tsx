"use client";

import KidiclassSelect from "@/components/KidiclassSelect";
import { supabase } from "@/lib/supabase";
import { Heart, PackageCheck, Search, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  old_price: number | null;
  stock: number;
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

export default function CatalogueClient() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "Toutes"
  );
  const [productType, setProductType] = useState(
    searchParams.get("productType") || "Tous"
  );
  const [characterTheme, setCharacterTheme] = useState("Tous");
  const [schoolLevel, setSchoolLevel] = useState("Tous");
  const [gender, setGender] = useState("Tous");
  const [highlight, setHighlight] = useState("Tous");
  const [brandSearch, setBrandSearch] = useState("");
  const [colorSearch, setColorSearch] = useState("");
  const [ageSearch, setAgeSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    const { data } = await supabase
      .from("products")
      .select("*")
      .or("is_archived.is.false,is_archived.is.null")
      .order("created_at", { ascending: false });

    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
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

      const matchesCategory =
        category === "Toutes" || product.category === category;

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
        (highlight === "Promotions" && product.is_promo);

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
  ]);

  function getProductImage(product: Product) {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }

    return product.image_url || "";
  }

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <section className="bg-[#e9fbfc] px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.4em] text-[#1db7bd]">
            Catalogue KidiClass
          </p>

          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight text-gray-950 md:text-7xl">
            Trouvez la tenue, le sac ou l’accessoire parfait.
          </h1>

          <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-gray-600">
            Parcourez les nouveautés, les packs scolaires, les accessoires et
            les articles coups de cœur de la boutique.
          </p>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_1fr]">
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
                    className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white py-4 pl-14 pr-5 font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

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
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <input
                type="text"
                placeholder="Marque : Disney, Barbie..."
                className="rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
              />

              <input
                type="text"
                placeholder="Couleur : rose, bleu..."
                className="rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
              />

              <input
                type="text"
                placeholder="Âge : 3-6 ans..."
                className="rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                value={ageSearch}
                onChange={(e) => setAgeSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black text-gray-950">
              {loading
                ? "Chargement..."
                : `${filteredProducts.length} article${
                    filteredProducts.length > 1 ? "s" : ""
                  }`}
            </h2>
          </div>

          {loading ? (
            <div className="mt-8 rounded-[2rem] bg-white p-10 text-center font-black text-[#1db7bd] shadow-sm">
              Chargement des produits...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="mt-8 rounded-[2rem] border border-dashed border-[#bfedf0] bg-white p-10 text-center shadow-sm">
              <h3 className="text-2xl font-black text-gray-950">
                Aucun produit trouvé
              </h3>

              <p className="mt-2 font-bold text-gray-500">
                Essayez de modifier les filtres.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/produit/${product.id}`}
                  className="group overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-80 overflow-hidden bg-[#fffdf7]">
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

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {product.is_new && (
                        <span className="flex items-center gap-1 rounded-full bg-[#e9fbfc] px-3 py-1 text-xs font-black text-[#1db7bd]">
                          <Sparkles size={13} strokeWidth={3} />
                          Nouveau
                        </span>
                      )}

                      {product.is_favorite && (
                        <span className="flex items-center gap-1 rounded-full bg-[#fff1f5] px-3 py-1 text-xs font-black text-[#f36f45]">
                          <Heart size={13} strokeWidth={3} />
                          Coup de cœur
                        </span>
                      )}

                      {product.is_promo && (
                        <span className="flex items-center gap-1 rounded-full bg-[#f36f45] px-3 py-1 text-xs font-black text-white">
                          <Tag size={13} strokeWidth={3} />
                          Promo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1db7bd]">
                      {product.category}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-xl font-black text-gray-950">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-sm font-bold text-gray-500">
                      {product.product_type || "Article KidiClass"}
                    </p>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xl font-black text-[#f36f45]">
                          {Number(product.price || 0).toLocaleString("fr-FR")}{" "}
                          FCFA
                        </p>

                        {product.old_price && (
                          <p className="text-sm font-bold text-gray-400 line-through">
                            {Number(product.old_price).toLocaleString("fr-FR")}{" "}
                            FCFA
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          Number(product.stock || 0) > 0
                            ? "bg-[#e9fbfc] text-[#1db7bd]"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {Number(product.stock || 0) > 0
                          ? "Disponible"
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