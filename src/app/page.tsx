"use client";

import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  Heart,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  is_new: boolean | null;
  is_favorite: boolean | null;
  is_promo: boolean | null;
  is_archived: boolean | null;
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,price,old_price,stock,image_url,images,category,product_type,is_new,is_favorite,is_promo,is_archived"
        )
        .or("is_archived.is.false,is_archived.is.null")
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Erreur chargement produits accueil :", error);
        setProducts([]);
        return;
      }

      setProducts((data as Product[]) || []);
    }

    fetchProducts();
  }, []);

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
    <main className="min-h-screen bg-[#fffdf7]">
      <section className="overflow-hidden bg-[#e9fbfc] px-5 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.4em] text-[#1db7bd]">
              Boutique enfant
            </p>

            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight text-gray-950 md:text-7xl">
              Des looks joyeux pour les enfants stylés.
            </h1>

            <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-gray-600">
              KidiClass sélectionne des vêtements, sacs, chaussures et
              accessoires pour enfants, avec une touche joyeuse, pratique et
              tendance.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/catalogue"
                className="flex items-center gap-2 rounded-full bg-[#f36f45] px-7 py-4 font-black text-white shadow-sm hover:bg-[#e85e33]"
              >
                Voir le catalogue
                <ArrowRight size={20} strokeWidth={2.5} />
              </Link>

              <Link
                href="/catalogue?category=Scolaire"
                className="rounded-full border-2 border-[#1db7bd] px-7 py-4 font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white"
              >
                Spécial rentrée
              </Link>
            </div>
          </div>

          <div className="rounded-[3rem] bg-white p-5 shadow-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-[#fff9cf] p-6">
                <Sparkles className="text-[#c7a900]" size={34} />
                <h2 className="mt-5 text-2xl font-black text-gray-950">
                  Nouveautés
                </h2>
                <p className="mt-2 text-sm font-bold leading-6 text-gray-600">
                  Des articles frais pour renouveler le dressing des enfants.
                </p>
              </div>

              <div className="rounded-[2rem] bg-[#fff1f5] p-6">
                <Heart className="text-[#f36f45]" size={34} />
                <h2 className="mt-5 text-2xl font-black text-gray-950">
                  Coups de cœur
                </h2>
                <p className="mt-2 text-sm font-bold leading-6 text-gray-600">
                  Les pièces préférées de la boutique.
                </p>
              </div>

              <div className="rounded-[2rem] bg-[#e9fbfc] p-6 sm:col-span-2">
                <ShoppingBag className="text-[#1db7bd]" size={34} />
                <h2 className="mt-5 text-2xl font-black text-gray-950">
                  Packs scolaires
                </h2>
                <p className="mt-2 text-sm font-bold leading-6 text-gray-600">
                  Sacs, trousses, gourdes et accessoires pratiques pour l’école.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <Truck className="text-[#1db7bd]" size={32} strokeWidth={2.5} />
            <h3 className="mt-4 text-xl font-black text-gray-950">
              Livraison à Abidjan
            </h3>
            <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
              Livraison à 1 000 FCFA à Abidjan.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <ShieldCheck
              className="text-[#1db7bd]"
              size={32}
              strokeWidth={2.5}
            />
            <h3 className="mt-4 text-xl font-black text-gray-950">
              Commande simple
            </h3>
            <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
              Choisissez vos articles et finalisez votre commande rapidement.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <Star className="text-[#1db7bd]" size={32} strokeWidth={2.5} />
            <h3 className="mt-4 text-xl font-black text-gray-950">
              Sélection tendance
            </h3>
            <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
              Des produits colorés et adaptés aux enfants.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#1db7bd]">
                Sélection
              </p>

              <h2 className="mt-3 text-4xl font-black text-gray-950 md:text-5xl">
                Derniers articles
              </h2>
            </div>

            <Link
              href="/catalogue"
              className="flex w-fit items-center gap-2 rounded-full border-2 border-[#1db7bd] px-6 py-3 font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white"
            >
              Voir tout
              <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="mt-8 rounded-[2rem] bg-white p-10 text-center shadow-sm">
              <PackageCheck
                className="mx-auto text-[#1db7bd]"
                size={42}
                strokeWidth={2.5}
              />

              <h3 className="mt-4 text-2xl font-black text-gray-950">
                Aucun produit pour le moment
              </h3>

              <p className="mt-2 font-bold text-gray-500">
                Ajoutez des produits depuis l’espace admin.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/produit/${product.id}`}
                  className="group overflow-hidden rounded-[2rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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
                        <PackageCheck size={44} strokeWidth={2.5} />
                      </div>
                    )}

                    {product.is_promo && (
                      <span className="absolute left-4 top-4 rounded-full bg-[#f36f45] px-3 py-1 text-xs font-black text-white">
                        Promo
                      </span>
                    )}
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