"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
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
      const { data } = await supabase
        .from("products")
        .select(
          "id,name,price,image_url,images,category,product_type,character_theme,school_level,is_archived"
        )
        .or("is_archived.is.false,is_archived.is.null")
        .order("created_at", { ascending: false });

      setProducts((data as Product[]) || []);
    }

    fetchProducts();
  }, []);

  const suggestions = useMemo(() => {
    if (search.trim().length < 2) return [];

    const query = search.toLowerCase();

    return products
      .filter((product) => {
        const searchableText = `${product.name} ${product.category} ${
          product.product_type || ""
        } ${product.character_theme || ""} ${product.school_level || ""}`;

        return searchableText.toLowerCase().includes(query);
      })
      .slice(0, 6);
  }, [products, search]);

  function getProductImage(product: Product) {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }

    return product.image_url || "";
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
        onSubmit={(e) => {
          e.preventDefault();
          goToCatalogue();
        }}
      >
        <input
          type="text"
          placeholder="Rechercher un article..."
          className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm text-black outline-none focus:border-[#1db7bd]"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </form>

      {isOpen && search.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-[99999] mt-2 overflow-hidden rounded-2xl border bg-white shadow-xl">
          {suggestions.length > 0 ? (
            <div>
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => goToProduct(product.id)}
                  className="flex w-full items-center gap-3 border-b p-3 text-left hover:bg-[#e9fbfc]"
                >
                  {getProductImage(product) ? (
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="h-14 w-14 rounded-xl object-cover object-top"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-gray-100" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-gray-900">
                      {product.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {product.category}
                      {product.product_type ? ` • ${product.product_type}` : ""}
                    </p>

                    <p className="text-sm font-black text-[#f36f45]">
                      {Number(product.price).toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                </button>
              ))}

              <button
                type="button"
                onClick={goToCatalogue}
                className="block w-full bg-[#1db7bd] p-3 text-center font-black text-white hover:bg-[#159ca1]"
              >
                Voir tous les résultats
              </button>
            </div>
          ) : (
            <div className="p-4">
              <p className="text-sm text-gray-600">Aucun produit trouvé.</p>

              <button
                type="button"
                onClick={goToCatalogue}
                className="mt-3 rounded-full bg-[#f36f45] px-4 py-2 text-sm font-black text-white"
              >
                Rechercher dans le catalogue
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}