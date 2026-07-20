"use client";

import { supabase } from "@/lib/supabase";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  images: string[] | null;
  category: string;
  product_type: string | null;
  character_theme: string | null;
  school_level: string | null;
  is_archived: boolean | null;
};

export default function ProductSearch() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,price,image_url,images,category,product_type,character_theme,school_level,is_archived",
        )
        .or("is_archived.is.false,is_archived.is.null")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur recherche produits :", error);
        setProducts([]);
        return;
      }

      setProducts((data as Product[]) || []);
    }

    fetchProducts();
  }, []);

  const suggestions = useMemo(() => {
    if (search.trim().length < 2) return [];

    const query = search.toLowerCase().trim();

    return products
      .filter((product) => {
        const searchableText = `${product.name || ""} ${
          product.category || ""
        } ${product.product_type || ""} ${product.character_theme || ""} ${
          product.school_level || ""
        }`;

        return searchableText.toLowerCase().includes(query);
      })
      .slice(0, 6);
  }, [products, search]);

  function getProductImage(product: Product) {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }

    if (product.image_url) {
      return product.image_url;
    }

    return "";
  }

  function goToCatalogue() {
    if (!search.trim()) return;

    setIsOpen(false);
    router.push(`/catalogue?q=${encodeURIComponent(search.trim())}`);
  }

  function goToProduct(productId: number) {
    setIsOpen(false);
    setSearch("");
    router.push(`/produit/${productId}`);
  }

  return (
    <div className="relative w-full">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goToCatalogue();
        }}
        className="relative"
      >
        <Search
          size={20}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#087f83]"
          strokeWidth={2.6}
        />

        <input
          type="text"
          placeholder="Rechercher un article..."
          className="w-full rounded-full border-2 border-[#b9ecee] bg-[#fffdf7] py-3 pl-12 pr-4 text-base font-black text-gray-950 shadow-sm outline-none placeholder:font-bold placeholder:text-gray-400 focus:border-[#1db7bd] focus:bg-white focus:shadow-[0_10px_28px_rgba(29,183,189,0.16)] sm:py-2.5 sm:text-sm"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </form>

      {isOpen && search.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-[99999] mt-3 max-h-[70vh] overflow-hidden rounded-[1.6rem] border-2 border-[#b9ecee] bg-white shadow-[0_22px_55px_rgba(8,127,131,0.20)]">
          {suggestions.length > 0 ? (
            <div>
              <div className="flex items-center justify-between gap-3 border-b border-[#d8f4f5] bg-[#e9fbfc] px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087f83]">
                  Résultats
                </p>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#f36f45] shadow-sm">
                  {suggestions.length}
                </span>
              </div>

              <div className="max-h-[52vh] overflow-y-auto">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => goToProduct(product.id)}
                    className="group flex w-full items-center gap-3 border-b border-[#f4efe7] bg-white p-3 text-left transition hover:bg-[#fffdf7] sm:gap-4 sm:p-4"
                  >
                    {getProductImage(product) ? (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#e9fbfc] ring-1 ring-[#d8f4f5] sm:h-16 sm:w-16">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="h-full w-full object-contain object-center p-1.5"
                        />
                      </span>
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#087f83] sm:h-16 sm:w-16">
                        <Search size={22} strokeWidth={2.6} />
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-black leading-tight text-gray-950 sm:text-base">
                        {product.name}
                      </p>

                      <p className="mt-1 truncate text-xs font-bold text-gray-500">
                        {product.category}
                        {product.product_type
                          ? ` • ${product.product_type}`
                          : ""}
                      </p>

                      <p className="mt-1 text-base font-black leading-none text-[#f36f45]">
                        {Number(product.price).toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>

                    <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff1f5] text-[#f36f45] transition group-hover:bg-[#f36f45] group-hover:text-white sm:flex">
                      <ArrowRight size={18} strokeWidth={2.8} />
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={goToCatalogue}
                className="flex w-full items-center justify-center gap-2 bg-[#1db7bd] px-4 py-4 text-center font-black text-white transition hover:bg-[#087f83]"
              >
                Voir tous les résultats
                <ArrowRight size={18} strokeWidth={2.8} />
              </button>
            </div>
          ) : (
            <div className="bg-[#fffdf7] p-4">
              <p className="text-sm font-black text-gray-950">
                Aucun produit trouvé
              </p>

              <p className="mt-1 text-xs font-bold leading-5 text-gray-500">
                Essayez un autre mot-clé ou ouvrez le catalogue complet.
              </p>

              <button
                type="button"
                onClick={goToCatalogue}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f36f45] px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-[#e85e33]"
              >
                Rechercher dans le catalogue
                <ArrowRight size={16} strokeWidth={2.8} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
