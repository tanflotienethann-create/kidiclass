"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  Edit3,
  EyeOff,
  Loader2,
  PackageCheck,
  Search,
  Trash2,
  X,
} from "lucide-react";

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
  created_at: string;
};

export default function AdminProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [productToArchive, setProductToArchive] = useState<Product | null>(
    null
  );
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  async function fetchProducts() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,price,old_price,stock,image_url,images,category,product_type,character_theme,school_level,brand,colors,target_age,gender,is_promo,is_favorite,is_new,is_pack,is_archived,created_at"
      )
      .or("is_archived.is.false,is_archived.is.null")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Impossible de charger les produits.");
      setProducts([]);
      setLoading(false);
      return;
    }

    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchProducts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function archiveProduct(productId: number) {
    setArchiving(true);
    setMessage("");

    const { error } = await supabase
      .from("products")
      .update({
        is_archived: true,
      })
      .eq("id", productId);

    if (error) {
      console.error(error);
      setMessage("Impossible de supprimer ce produit du site.");
      setArchiving(false);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId)
    );

    setProductToArchive(null);
    setArchiving(false);
  }

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return products;

    return products.filter((product) => {
      const searchableText = `
        ${product.name || ""}
        ${product.category || ""}
        ${product.product_type || ""}
        ${product.character_theme || ""}
        ${product.school_level || ""}
        ${product.brand || ""}
        ${product.colors || ""}
        ${product.gender || ""}
        ${product.target_age || ""}
      `;

      return searchableText.toLowerCase().includes(query);
    });
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

  return (
    <section className="w-full min-w-0">
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#1db7bd]">
              Catalogue
            </p>

            <h2 className="mt-2 text-4xl font-black text-gray-950">
              Produits existants
            </h2>

            <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-gray-500">
              Modifiez, organisez ou retirez les produits visibles sur la
              boutique.
            </p>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              size={22}
              strokeWidth={2.5}
            />

            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full rounded-full border-2 border-[#bfedf0] bg-white py-4 pl-14 pr-5 font-bold text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-500">
            {message}
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex items-center justify-center rounded-[2rem] bg-[#fffdf7] p-12">
            <div className="flex items-center gap-3 text-[#1db7bd]">
              <Loader2 className="animate-spin" size={26} strokeWidth={2.5} />
              <span className="font-black">Chargement des produits...</span>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-dashed border-[#bfedf0] bg-[#e9fbfc] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#1db7bd]">
              <PackageCheck size={32} strokeWidth={2.5} />
            </div>

            <h3 className="mt-5 text-2xl font-black text-gray-950">
              Aucun produit trouvé
            </h3>

            <p className="mt-2 text-sm font-bold text-gray-500">
              Ajoutez un produit ou modifiez votre recherche.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid w-full min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const productImage = getProductImage(product);

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-72 overflow-hidden bg-[#fffdf7]">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.name}
                        className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <PackageCheck size={48} strokeWidth={2.5} />
                      </div>
                    )}

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {product.is_pack && (
                        <span className="rounded-full bg-[#1db7bd] px-3 py-1 text-xs font-black text-white">
                          Pack
                        </span>
                      )}

                      {product.is_new && (
                        <span className="rounded-full bg-[#e9fbfc] px-3 py-1 text-xs font-black text-[#1db7bd]">
                          Nouveau
                        </span>
                      )}

                      {product.is_promo && (
                        <span className="rounded-full bg-[#f36f45] px-3 py-1 text-xs font-black text-white">
                          Promo
                        </span>
                      )}

                      {Number(product.stock || 0) <= 0 && (
                        <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
                          Rupture
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-xl font-black text-gray-950">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-sm font-bold text-gray-500">
                          {product.category}
                          {product.product_type
                            ? ` • ${product.product_type}`
                            : ""}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-lg font-black text-[#f36f45]">
                          {Number(product.price || 0).toLocaleString("fr-FR")}{" "}
                          FCFA
                        </p>

                        {product.old_price && (
                          <p className="text-xs font-bold text-gray-400 line-through">
                            {Number(product.old_price).toLocaleString("fr-FR")}{" "}
                            FCFA
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-[#e9fbfc] p-3">
                        <p className="font-black text-[#1db7bd]">Stock</p>
                        <p className="font-bold text-gray-700">
                          {product.stock || 0}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#fff9cf] p-3">
                        <p className="font-black text-[#c7a900]">Sexe</p>
                        <p className="font-bold text-gray-700">
                          {product.gender || "Non défini"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#fff1f5] p-3">
                        <p className="font-black text-[#e85035]">Personnage</p>
                        <p className="font-bold text-gray-700">
                          {product.character_theme || "Non défini"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#edf5ff] p-3">
                        <p className="font-black text-[#315ea8]">Niveau</p>
                        <p className="font-bold text-gray-700">
                          {product.school_level || "Non concerné"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Link
                        href={`/admin/produits/${product.id}`}
                        className="flex items-center justify-center gap-2 rounded-full border-2 border-[#1db7bd] px-5 py-3 text-sm font-black text-[#1db7bd] transition hover:bg-[#1db7bd] hover:text-white"
                      >
                        <Edit3 size={18} strokeWidth={2.5} />
                        Modifier
                      </Link>

                      <button
                        type="button"
                        onClick={() => setProductToArchive(product)}
                        className="flex items-center justify-center gap-2 rounded-full bg-red-50 px-5 py-3 text-sm font-black text-red-500 transition hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {productToArchive && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setProductToArchive(null)}
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X size={22} strokeWidth={2.5} />
            </button>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertTriangle size={34} strokeWidth={2.5} />
            </div>

            <p className="mt-5 text-sm font-black uppercase tracking-[0.25em] text-[#f36f45]">
              Confirmation
            </p>

            <h2 className="mt-3 text-3xl font-black text-gray-950">
              Supprimer ce produit du site ?
            </h2>

            <p className="mt-3 text-sm font-bold leading-6 text-gray-500">
              Le produit{" "}
              <span className="font-black text-gray-950">
                {productToArchive.name}
              </span>{" "}
              sera retiré du catalogue et ne sera plus visible par les clients.
              L’historique des commandes reste conservé.
            </p>

            <div className="mt-5 rounded-2xl bg-[#fff9cf] p-4 text-sm font-bold leading-6 text-[#9a8200]">
              Cette action masque le produit au lieu de le supprimer
              définitivement. C’est plus sécurisé pour garder les anciennes
              commandes intactes.
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setProductToArchive(null)}
                disabled={archiving}
                className="rounded-full border-2 border-[#1db7bd] px-5 py-4 font-black text-[#1db7bd] transition hover:bg-[#1db7bd] hover:text-white disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() => archiveProduct(productToArchive.id)}
                disabled={archiving}
                className="flex items-center justify-center gap-2 rounded-full bg-[#f36f45] px-5 py-4 font-black text-white transition hover:bg-[#e85e33] disabled:opacity-50"
              >
                {archiving ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={20}
                      strokeWidth={2.5}
                    />
                    Suppression...
                  </>
                ) : (
                  <>
                    <EyeOff size={20} strokeWidth={2.5} />
                    Supprimer du site
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
