"use client";

import { getProductAvailabilityLabel } from "@/lib/productAvailability";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  Heart,
  PackageCheck,
  School,
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
  availability_status: string | null;
  image_url: string | null;
  images: string[] | null;
  category: string;
  product_type: string | null;
  is_new: boolean | null;
  is_favorite: boolean | null;
  is_promo: boolean | null;
  is_archived: boolean | null;
};

const homeCategories = [
  {
    title: "Packs scolaires",
    text: "Sacs, sacs à goûter, boîtes à goûter, gourdes et trousses réunis.",
    href: "/packs-scolaires",
    icon: School,
    bg: "bg-[#fff1f5]",
    color: "text-[#f36f45]",
  },
  {
    title: "Plage",
    text: "Serviettes, maillots de bain et articles pratiques pour les sorties.",
    href: "/plage",
    icon: Sparkles,
    bg: "bg-[#e9fbfc]",
    color: "text-[#1db7bd]",
  },
  {
    title: "Accessoires & jeux",
    text: "Horloges, jeux et petites trouvailles utiles pour les enfants.",
    href: "/accessoires-jeux",
    icon: Star,
    bg: "bg-[#fff9cf]",
    color: "text-[#c7a900]",
  },
  {
    title: "Chaussures",
    text: "Des modèles confortables pour accompagner les enfants.",
    href: "/catalogue?category=Chaussures",
    icon: ShoppingBag,
    bg: "bg-[#e9fbfc]",
    color: "text-[#1db7bd]",
  },
  {
    title: "Vêtements",
    text: "Une catégorie prête si la boutique ajoute des habits plus tard.",
    href: "/catalogue?category=V%C3%AAtements",
    icon: Heart,
    bg: "bg-[#fff1f5]",
    color: "text-[#f36f45]",
  },
];

const schoolSelection = [
  {
    title: "Sacs",
    href: "/catalogue?productType=Sac",
  },
  {
    title: "Sacs à roulette",
    href: "/catalogue?productType=Sac%20%C3%A0%20roulette",
  },
  {
    title: "Sacs à goûter",
    href: "/catalogue?productType=Sac%20%C3%A0%20go%C3%BBter",
  },
  {
    title: "Boîtes à goûter",
    href: "/catalogue?productType=Bo%C3%AEte%20%C3%A0%20go%C3%BBter",
  },
  {
    title: "Trousses",
    href: "/catalogue?productType=Trousse",
  },
  {
    title: "Gourdes",
    href: "/catalogue?productType=Gourde",
  },
  {
    title: "Packs complets",
    href: "/packs-scolaires",
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,price,old_price,stock,availability_status,image_url,images,category,product_type,is_new,is_favorite,is_promo,is_archived"
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
    <main className="min-h-screen bg-[#faf8f4]">
      <section className="retail-band overflow-hidden px-4 py-7 sm:px-5 md:py-12">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-black uppercase text-[#e85035]">
              Boutique enfant tendance
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[#111827] sm:text-5xl md:text-7xl">
              La rentrée, la plage et les looks kids réunis.
            </h1>

            <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-gray-700 sm:text-lg sm:leading-8">
              Des essentiels enfant faciles à porter, des packs pratiques et
              des accessoires colorés, présentés comme une vraie boutique mode.
            </p>

            <div className="mt-6 grid gap-3 min-[420px]:flex min-[420px]:flex-wrap sm:mt-8 sm:gap-4">
              <Link
                href="/catalogue"
                className="kidiclass-button-primary flex items-center justify-center gap-2 px-6 py-3.5 sm:px-7 sm:py-4"
              >
                Voir le catalogue
                <ArrowRight size={20} strokeWidth={2.5} />
              </Link>

              <Link
                href="/packs-scolaires"
                className="kidiclass-button-secondary text-center px-6 py-3.5 sm:px-7 sm:py-4"
              >
                Spécial rentrée
              </Link>
            </div>
          </div>

          <div className="hidden gap-4 md:grid sm:grid-cols-2">
            <div className="relative min-h-72 overflow-hidden rounded-xl bg-[#17324d] p-7 text-white shadow-xl sm:col-span-2">
              <div className="absolute bottom-0 right-0 hidden h-32 w-32 rounded-full bg-[#fff3bf] md:block" />
              <div className="absolute right-8 top-8 hidden rounded-full bg-white/10 px-5 py-2 text-sm font-black md:block">
                Collection kids
              </div>
              <div className="relative max-w-lg">
                <ShoppingBag size={38} />
                <h2 className="mt-5 text-4xl font-black leading-tight">
                  Packs scolaires
                </h2>
                <p className="mt-3 text-sm font-bold leading-6 text-white/80">
                  Sacs, gourdes, trousses et articles utiles pour une rentrée
                  nette et stylée.
                </p>
              </div>
            </div>

            <div className="retail-card p-6 text-gray-950">
              <Sparkles className="text-[#e85035]" size={30} />
              <h2 className="mt-4 text-2xl font-black text-gray-950">
                Nouveautés
              </h2>
              <p className="mt-2 text-sm font-bold leading-6 text-gray-600">
                Les derniers articles ajoutés à la boutique.
              </p>
            </div>

            <div className="retail-card p-6 text-gray-950">
              <Heart className="text-[#0f766e]" size={30} />
              <h2 className="mt-4 text-2xl font-black text-gray-950">
                Coups de cœur
              </h2>
              <p className="mt-2 text-sm font-bold leading-6 text-gray-600">
                Les choix préférés pour enfants.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e4ded4] bg-white px-4 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {homeCategories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="rounded-xl border border-[#ddd6cc] bg-white px-3 py-3 text-center text-sm font-black text-gray-950 transition hover:border-[#111827] hover:bg-[#faf8f4] sm:rounded-full sm:px-5"
            >
              {category.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 py-8 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase text-[#e85035]">
                À shopper
              </p>

              <h2 className="mt-2 text-3xl font-black text-gray-950 sm:text-4xl md:text-5xl">
                Derniers articles
              </h2>
            </div>

            <Link
              href="/catalogue"
              className="kidiclass-button-secondary flex w-fit items-center gap-2 px-6 py-3"
            >
              Voir tout
              <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="kidiclass-card mt-8 p-10 text-center">
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
            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/produit/${product.id}`}
                  className="kidiclass-card group overflow-hidden"
                >
                  <div className="relative h-64 overflow-hidden bg-[#f4efe7] sm:h-72">
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

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {product.is_promo && (
                        <span className="rounded-full bg-[#f36f45] px-3 py-1 text-xs font-black text-white">
                          Promo
                        </span>
                      )}

                      {product.is_new && (
                        <span className="rounded-full bg-[#e9fbfc] px-3 py-1 text-xs font-black text-[#0f766e] shadow-sm">
                          Nouveau
                        </span>
                      )}

                      {product.is_favorite && (
                        <span className="rounded-full bg-[#fff1f5] px-3 py-1 text-xs font-black text-[#f36f45] shadow-sm">
                          Coup de cœur
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-black uppercase text-[#1db7bd]">
                      {product.category}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-xl font-black text-gray-950">
                      {product.name}
                    </h3>

                    <div className="mt-4 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between">
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

      <section className="px-4 py-8 sm:px-5 sm:py-10">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          <div className="kidiclass-card p-6">
            <Truck className="text-[#1db7bd]" size={32} strokeWidth={2.5} />
            <h3 className="mt-4 text-xl font-black text-gray-950">
              Livraison locale
            </h3>
            <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
              Abidjan : 1 000 FCFA. Sac à roulette : 2 000 FCFA. Bassam,
              Songon et Anyama : 2 500 FCFA.
            </p>
          </div>

          <div className="kidiclass-card p-6">
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

          <div className="kidiclass-card p-6">
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

      <section className="px-4 py-8 sm:px-5 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#1db7bd]">
                Catégories
              </p>

              <h2 className="mt-3 text-3xl font-black text-gray-950 sm:text-4xl md:text-5xl">
                Explorer la boutique
              </h2>
            </div>

            <Link
              href="/catalogue"
              className="kidiclass-button-secondary flex w-fit items-center gap-2 px-6 py-3"
            >
              Tout voir
              <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {homeCategories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.title}
                  href={category.href}
                  className="kidiclass-card group p-5 sm:p-6"
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${category.bg} ${category.color}`}
                  >
                    <Icon size={32} strokeWidth={2.5} />
                  </div>

                  <h3 className="mt-5 text-xl font-black text-gray-950 sm:mt-6 sm:text-2xl">
                    {category.title}
                  </h3>

                  <p className="mt-3 text-sm font-bold leading-6 text-gray-500">
                    {category.text}
                  </p>

                  <p className="mt-5 flex items-center gap-2 text-sm font-black text-[#1db7bd] transition group-hover:gap-3 group-hover:text-[#f36f45]">
                    Découvrir
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-5 sm:py-12">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[#e9fbfc] p-5 sm:rounded-[3rem] sm:p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#1db7bd]">
                Sélection spéciale
              </p>

              <h2 className="mt-3 text-3xl font-black text-gray-950 sm:text-4xl md:text-5xl">
                La rentrée avec style.
              </h2>

              <p className="mt-4 text-base font-bold leading-7 text-gray-600">
                Sacs, sacs à goûter, boîtes à goûter, gourdes et trousses pour
                préparer la rentrée avec des articles pratiques, colorés et
                adaptés aux enfants.
              </p>

              <Link
                href="/packs-scolaires"
                className="kidiclass-button-primary mt-7 inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-center sm:w-fit sm:px-7 sm:py-4"
              >
                Découvrir les packs scolaires
                <ArrowRight size={20} strokeWidth={2.5} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {schoolSelection.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:rounded-[2rem] sm:p-6"
                >
                  <h3 className="text-xl font-black text-gray-950 sm:text-2xl">
                    {item.title}
                  </h3>

                  <p className="mt-4 flex items-center gap-2 text-sm font-black text-[#1db7bd]">
                    Voir les articles
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
