"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, Trash2 } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  product_type: string | null;
  character_theme: string | null;
  school_level: string | null;
};

export default function AdminProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    setProducts((data as Product[]) || []);
  }

  async function deleteProduct(id: number) {
    const confirmation = confirm("Supprimer ce produit ?");
    if (!confirmation) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      setMessage("Erreur : " + error.message);
      return;
    }

    setMessage("Produit supprimé.");
    fetchProducts();
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      {message && (
        <p className="mb-5 rounded-2xl bg-green-50 p-4 font-bold text-green-600">
          {message}
        </p>
      )}

      {products.length === 0 ? (
        <div className="rounded-[2rem] bg-gray-50 p-8 text-center">
          <p className="font-bold text-gray-500">
            Aucun produit ajouté pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const isOutOfStock = Number(product.stock || 0) <= 0;

            return (
              <div
                key={product.id}
                className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm"
              >
                <div className="h-72 bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-gray-400">
                      Aucune image
                    </div>
                  )}
                </div>

                <div className="p-5">
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

                    {isOutOfStock ? (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-500">
                        Rupture
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-600">
                        Stock : {product.stock}
                      </span>
                    )}
                  </div>

                  <h3 className="line-clamp-2 text-xl font-black text-gray-950">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-2xl font-black text-[#f36f45]">
                    {Number(product.price).toLocaleString("fr-FR")} FCFA
                  </p>

                  {product.character_theme && (
                    <p className="mt-2 text-sm font-bold text-gray-500">
                      Thème : {product.character_theme}
                    </p>
                  )}

                  {product.school_level && (
                    <p className="text-sm font-bold text-gray-500">
                      Niveau : {product.school_level}
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      href={`/admin/produits/${product.id}`}
                      className="flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-[#1db7bd] px-3 py-3 text-sm font-black text-white transition hover:bg-[#159ca1]"
                    >
                      <Pencil size={17} strokeWidth={2.5} />
                      <span className="truncate">Modifier</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      className="flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-red-500 px-3 py-3 text-sm font-black text-white transition hover:bg-red-600"
                    >
                      <Trash2 size={17} strokeWidth={2.5} />
                      <span className="truncate">Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}