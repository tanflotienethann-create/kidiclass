"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  product_type: string | null;
  character_theme: string | null;
  school_level: string | null;
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
          "id,name,price,image_url,category,product_type,character_theme,school_level"
        )
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
          className="w-full rounded-full border border-gray-300 px-5 py-3 text-sm text-black outline-none focus:border-pink-400"
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
                  className="flex w-full items-center gap-3 border-b p-3 text-left hover:bg-pink-50"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-14 w-14 rounded object-cover object-top"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded bg-gray-100" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-gray-900">
                      {product.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {product.category}
                      {product.product_type ? ` • ${product.product_type}` : ""}
                    </p>

                    <p className="text-sm font-bold text-pink-500">
                      {Number(product.price).toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                </button>
              ))}

              <button
                type="button"
                onClick={goToCatalogue}
                className="block w-full bg-pink-500 p-3 text-center font-bold text-white hover:bg-pink-600"
              >
                Voir tous les résultats
              </button>
            </div>
          ) : (
            <div className="p-4">
              <p className="text-sm text-gray-600">
                Aucun produit trouvé.
              </p>

              <button
                type="button"
                onClick={goToCatalogue}
                className="mt-3 rounded bg-pink-500 px-4 py-2 text-sm font-bold text-white"
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