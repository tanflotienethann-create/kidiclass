"use client";

import {
  getProductAvailabilityBadgeLabels,
  getProductAvailabilityLabel,
} from "@/lib/productAvailability";
import { shopDepartments } from "@/lib/shopNavigation";
import { useTaxonomySettings } from "@/hooks/useTaxonomySettings";
import { getTaxonomyDepartmentCategories } from "@/lib/taxonomySettings";
import { supabase } from "@/lib/supabase";
import KidiclassSelect from "@/components/KidiclassSelect";
import ProductQuickAddButton from "@/components/ProductQuickAddButton";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Heart,
  PackageCheck,
  Sandwich,
  School,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  UsersRound,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  is_new: boolean | null;
  is_favorite: boolean | null;
  is_promo: boolean | null;
  is_archived: boolean | null;
};

const homeCategories = [
  {
    title: "École et sorties",
    text: "Offres scolaires, sacs, trousses et essentiels pour toutes leurs journées.",
    href: "/ecole-sorties",
    icon: School,
    bg: "bg-[#fff3bf]",
    color: "text-[#6f4e00]",
    border: "border-t-[#e0a800]",
  },
  {
    title: "Repas et goûters",
    text: "Gourdes, boîtes et sets goûter pour les pauses de la journée.",
    href: "/repas-gouters",
    icon: Sandwich,
    bg: "bg-[#fff0e8]",
    color: "text-[#c2411f]",
    border: "border-t-[#f36f45]",
  },
  {
    title: "Piscine et plage",
    text: "Maillots, serviettes et accessoires pour profiter de l'eau et du soleil.",
    href: "/piscine-plage",
    icon: Waves,
    bg: "bg-[#dff8ff]",
    color: "text-[#075985]",
    border: "border-t-[#0089a7]",
  },
  {
    title: "Accessoires et jeux",
    text: "Sacs à main, horloges et jeux pour compléter leur univers.",
    href: "/accessoires-jeux",
    icon: Gamepad2,
    bg: "bg-[#fff1f5]",
    color: "text-[#9d174d]",
    border: "border-t-[#e84a77]",
  },
  {
    title: "Personnages",
    text: "Tous les articles classés selon les héros préférés des enfants.",
    href: "/personnages",
    icon: UsersRound,
    bg: "bg-[#f2edff]",
    color: "text-[#6941a5]",
    border: "border-t-[#7c3aed]",
  },
];

const schoolSelection = [
  {
    title: "Spécial PS/MS",
    href: "/ecole-sorties?category=Sp%C3%A9cial%20PS%2FMS",
  },
  {
    title: "Maternelle",
    href: "/ecole-sorties?category=Maternelle%20taille%20standard",
  },
  {
    title: "Primaire",
    href: "/ecole-sorties?category=CE%20%2F%20CM",
  },
  {
    title: "Collège / Lycée",
    href: "/ecole-sorties?category=Coll%C3%A8ge%20%2F%20Lyc%C3%A9e",
  },
  {
    title: "Sacs à dos",
    href: "/ecole-sorties?category=Sacs%20%C3%A0%20dos",
  },
  {
    title: "Gourdes",
    href: "/repas-gouters?category=Gourdes",
  },
  {
    title: "Packs complets",
    href: "/ecole-sorties?category=Packs%20scolaires",
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productFilter, setProductFilter] = useState("Tous les articles");
  const productCarouselRef = useRef<HTMLDivElement>(null);
  const { settings: taxonomySettings } = useTaxonomySettings();

  const productFilterOptions = [
    "Tous les articles",
    "Promotions",
    "Nouveautés",
    "Coups de cœur",
    ...shopDepartments.map((department) => department.label),
  ];

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,price,old_price,stock,availability_status,image_url,images,category,product_type,character_theme,is_new,is_favorite,is_promo,is_archived"
        )
        .or("is_archived.is.false,is_archived.is.null")
        .order("created_at", { ascending: false })
        .limit(40);

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

  const displayedProducts = products
    .filter((product) => {
      if (productFilter === "Tous les articles") return true;
      if (productFilter === "Promotions") return Boolean(product.is_promo);
      if (productFilter === "Nouveautés") return Boolean(product.is_new);
      if (productFilter === "Coups de cœur") {
        return Boolean(product.is_favorite);
      }

      const department = shopDepartments.find(
        (item) => item.label === productFilter
      );

      if (!department) return true;
      if (department.id === "personnages") {
        return Boolean(
          product.character_theme && product.character_theme !== "Sans thème"
        );
      }

      const departmentCategories = getTaxonomyDepartmentCategories(
        taxonomySettings,
        department.id,
      );

      return departmentCategories.includes(product.category);
    })
    .slice(0, 8);

  function scrollProductCarousel(direction: "previous" | "next") {
    const carousel = productCarouselRef.current;
    if (!carousel) return;

    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    if (maxScroll <= 0) return;

    const distance = carousel.clientWidth * 0.78;
    const nextScroll =
      direction === "next"
        ? Math.min(carousel.scrollLeft + distance, maxScroll)
        : Math.max(carousel.scrollLeft - distance, 0);

    carousel.scrollTo({ left: nextScroll, behavior: "smooth" });
  }

  useEffect(() => {
    productCarouselRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [productFilter]);

  useEffect(() => {
    const carousel = productCarouselRef.current;
    if (!carousel || displayedProducts.length <= 2) return;

    const timer = window.setInterval(() => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (maxScroll <= 0) return;

      const isAtEnd = carousel.scrollLeft >= maxScroll - 8;
      carousel.scrollTo({
        left: isAtEnd ? 0 : Math.min(carousel.scrollLeft + carousel.clientWidth * 0.78, maxScroll),
        behavior: "smooth",
      });
    }, 4300);

    return () => window.clearInterval(timer);
  }, [displayedProducts.length, productFilter]);

  return (
    <main className="min-h-screen bg-[#faf8f4]">
      <section className="retail-band overflow-hidden px-4 py-6 sm:px-5 sm:py-9 md:py-12">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-black uppercase text-[#e85035]">
              Boutique enfant tendance
            </p>

            <h1 className="mt-3 max-w-3xl text-[2rem] font-black leading-[1.07] text-[#111827] min-[390px]:text-[2.25rem] sm:mt-4 sm:text-5xl md:text-7xl">
              La rentrée, la plage et les looks kids réunis
            </h1>

            <p className="mt-4 max-w-2xl text-[0.95rem] font-bold leading-7 text-gray-700 sm:text-lg sm:leading-8">
              Des essentiels enfant faciles à porter, des packs pratiques et
              des accessoires colorés.
            </p>

            <div className="mt-6 grid gap-3 min-[420px]:flex min-[420px]:flex-wrap sm:mt-8 sm:gap-4">
              <Link
                href="/promotions"
                className="kidiclass-button-primary flex items-center justify-center gap-2 px-6 py-3.5 sm:px-7 sm:py-4"
              >
                Voir les promotions
                <ArrowRight size={20} strokeWidth={2.5} />
              </Link>

              <Link
                href="/packs-scolaires"
                className="kidiclass-button-secondary text-center px-6 py-3.5 sm:px-7 sm:py-4"
              >
                Spécial rentrée
              </Link>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-[#f4b7a5] bg-white shadow-sm md:hidden">
              <Link
                href="/ecole-sorties"
                className="block bg-[#fff3bf] px-3 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9a6b00]">
                      Rentrée scolaire
                    </p>
                    <h2 className="mt-1 text-lg font-black leading-tight text-gray-950 min-[390px]:text-xl">
                      Les essentiels école en premier
                    </h2>
                  </div>
                  <School
                    className="shrink-0 text-[#e85035]"
                    size={28}
                    strokeWidth={2.5}
                  />
                </div>
                <p className="mt-2 text-xs font-bold leading-5 text-gray-700 min-[390px]:text-sm">
                  Packs, sacs, gourdes et trousses faciles à retrouver sur
                  téléphone.
                </p>
              </Link>

              <div className="grid grid-cols-2 gap-2 p-2.5">
                {schoolSelection.slice(0, 4).map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="min-w-0 rounded-lg border border-[#f7c873] bg-[#fffdf7] px-2.5 py-2.5 text-[12px] font-black leading-tight text-[#6f4e00] min-[390px]:text-sm"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden gap-4 md:grid sm:grid-cols-2">
            <Link
              href="/packs-scolaires"
              className="relative min-h-72 overflow-hidden rounded-xl bg-[#087f83] p-7 text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl sm:col-span-2"
            >
              <div className="absolute -bottom-16 -right-12 hidden h-44 w-52 rotate-12 bg-[#fff3bf] md:block" />
              <div className="absolute right-0 top-0 h-full w-3 bg-[#f36f45]" />
              <div className="absolute right-8 top-8 hidden rounded-full bg-[#f36f45] px-5 py-2 text-sm font-black text-white md:block">
                Collection kids
              </div>
              <div className="relative max-w-lg">
                <ShoppingBag className="text-white" size={38} />
                <h2 className="mt-5 text-4xl font-black leading-tight text-white">
                  Packs scolaires
                </h2>
                <p className="mt-3 text-sm font-bold leading-6 text-white/90">
                  Sacs, gourdes, trousses et articles utiles pour une rentrée
                  nette et stylée.
                </p>
              </div>
            </Link>

            <div className="rounded-xl border border-[#f4b7a5] bg-[#fff0e8] p-6 text-gray-950 shadow-sm">
              <Sparkles className="text-[#e85035]" size={30} />
              <h2 className="mt-4 text-2xl font-black text-gray-950">
                Nouveautés
              </h2>
              <p className="mt-2 text-sm font-bold leading-6 text-gray-600">
                Les derniers articles ajoutés à la boutique.
              </p>
            </div>

            <div className="rounded-xl border border-[#a9e1e4] bg-[#e9fbfc] p-6 text-gray-950 shadow-sm">
              <Heart className="text-[#087f83]" size={30} />
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

      <section className="px-4 py-8 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase text-[#e85035]">
                À shopper
              </p>

              <h2 className="mt-2 text-2xl font-black leading-tight text-gray-950 sm:text-4xl md:text-5xl">
                Derniers articles
              </h2>
            </div>

            <div className="w-full md:max-w-xs">
              <KidiclassSelect
                label="Filtrer les articles"
                value={productFilter}
                options={productFilterOptions}
                onChange={setProductFilter}
              />
            </div>
          </div>

          {displayedProducts.length === 0 ? (
            <div className="kidiclass-card mt-8 p-10 text-center">
              <PackageCheck
                className="mx-auto text-[#1db7bd]"
                size={42}
                strokeWidth={2.5}
              />

              <h3 className="mt-4 text-2xl font-black text-gray-950">
                Aucun article dans cette sélection
              </h3>

              <p className="mt-2 font-bold text-gray-500">
                Choisissez un autre filtre pour découvrir les articles disponibles
              </p>
            </div>
          ) : (
            <div className="relative mt-6 sm:mt-8">
              <div
                ref={productCarouselRef}
                className="kidiclass-carousel-scroll flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto scroll-smooth pb-3 sm:gap-6"
              >
                {displayedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/produit/${product.id}`}
                    className="kidiclass-card group flex w-[68vw] min-w-[220px] max-w-[280px] flex-none snap-start flex-col overflow-hidden sm:w-[30%] sm:min-w-0 sm:max-w-none lg:w-[23.5%]"
                  >
                    <div className="relative h-56 overflow-hidden bg-[#fffdf7] p-2 sm:h-72 sm:p-3">
                      {getProductImage(product) ? (
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <PackageCheck size={44} strokeWidth={2.5} />
                        </div>
                      )}

                      <div className="absolute left-2 top-2 flex flex-wrap gap-1.5 sm:left-4 sm:top-4 sm:gap-2">
                        {product.is_promo && (
                          <span className="rounded-full bg-[#f36f45] px-2 py-1 text-[9px] font-black text-white sm:px-3 sm:text-xs">
                            Promo
                          </span>
                        )}

                        {product.is_new && (
                          <span className="rounded-full bg-[#e9fbfc] px-2 py-1 text-[9px] font-black text-[#0f766e] shadow-sm sm:px-3 sm:text-xs">
                            Nouveau
                          </span>
                        )}

                        {product.is_favorite && (
                          <span className="rounded-full bg-[#fff1f5] px-2 py-1 text-[9px] font-black text-[#f36f45] shadow-sm sm:px-3 sm:text-xs">
                            Coup de cœur
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-3 sm:p-5">
                      <p className="text-[10px] font-black uppercase text-[#1db7bd] sm:text-xs">
                        {product.category}
                      </p>

                      <h3 className="mt-2 line-clamp-2 text-sm font-black text-gray-950 sm:text-xl">
                        {product.name}
                      </h3>

                      <div className="mt-4 flex flex-col items-center gap-2 text-center">
                        <div className="min-w-max shrink-0">
                          <p className="whitespace-nowrap text-lg font-black leading-tight text-[#f36f45] sm:text-xl">
                            {Number(product.price || 0).toLocaleString(
                              "fr-FR"
                            )}{" "}
                            FCFA
                          </p>

                          {product.old_price && (
                            <p className="whitespace-nowrap text-sm font-bold text-gray-400 line-through">
                              {Number(product.old_price).toLocaleString(
                                "fr-FR"
                              )}{" "}
                              FCFA
                            </p>
                          )}
                        </div>

                        {Number(product.stock || 0) > 0 ? (
                          <div
                            title={getProductAvailabilityLabel(
                              product.availability_status,
                            )}
                            className="flex min-w-0 max-w-full flex-wrap justify-center gap-1.5"
                          >
                            {getProductAvailabilityBadgeLabels(
                              product.availability_status,
                            ).map((label) => (
                              <span
                                key={label}
                                className="max-w-full rounded-full bg-[#e9fbfc] px-2.5 py-1.5 text-center text-[9px] font-black leading-tight text-[#0f766e] sm:text-[10px]"
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

                      <ProductQuickAddButton
                        productId={product.id}
                        productName={product.name}
                        productPrice={Number(product.price || 0)}
                        productImage={getProductImage(product)}
                        stock={Number(product.stock || 0)}
                        className="mt-auto w-full bg-[#f36f45] px-3 py-2.5 text-xs text-white hover:bg-[#e85e33] sm:px-4 sm:py-3 sm:text-sm"
                      />
                    </div>
                  </Link>
                ))}
              </div>

              {displayedProducts.length > 2 && (
                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between sm:flex">
                  <button
                    type="button"
                    onClick={() => scrollProductCarousel("previous")}
                    className="pointer-events-auto -ml-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#1db7bd]/40 bg-white/95 text-[#087f83] shadow-sm backdrop-blur transition hover:border-[#f36f45] hover:text-[#f36f45]"
                    aria-label="Produits précédents"
                  >
                    <ChevronLeft size={21} strokeWidth={2.6} />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollProductCarousel("next")}
                    className="pointer-events-auto -mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#f36f45]/40 bg-white/95 text-[#f36f45] shadow-sm backdrop-blur transition hover:border-[#087f83] hover:text-[#087f83]"
                    aria-label="Produits suivants"
                  >
                    <ChevronRight size={21} strokeWidth={2.6} />
                  </button>
                </div>
              )}

              {displayedProducts.length > 2 && (
                <div className="mt-2 flex justify-center gap-2 sm:hidden">
                  <button
                    type="button"
                    onClick={() => scrollProductCarousel("previous")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1db7bd]/40 bg-white text-[#087f83] shadow-sm"
                    aria-label="Produits précédents"
                  >
                    <ChevronLeft size={20} strokeWidth={2.6} />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollProductCarousel("next")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f36f45]/40 bg-white text-[#f36f45] shadow-sm"
                    aria-label="Produits suivants"
                  >
                    <ChevronRight size={20} strokeWidth={2.6} />
                  </button>
                </div>
              )}
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
              Abidjan : 1 000 FCFA. Sac à roulette : 2 000 FCFA. Bingerville,
              Songon et Anyama : 2 000 FCFA. Bassam : 2 500 FCFA.
            </p>
          </div>

          <div className="kidiclass-card p-6">
            <ShieldCheck
              className="text-[#f36f45]"
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
            <Star className="text-[#c28b00]" size={32} strokeWidth={2.5} />
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
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#f36f45]">
                Catégories
              </p>

              <h2 className="mt-3 text-2xl font-black leading-tight text-gray-950 sm:text-4xl md:text-5xl">
                Explorer la boutique
              </h2>
            </div>

            <Link
              href="/promotions"
              className="kidiclass-button-secondary flex w-fit items-center gap-2 px-6 py-3"
            >
              Voir les promotions
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
                  className={`kidiclass-card group border-t-4 p-5 sm:p-6 ${category.border}`}
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
        <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[#fff3bf] p-5 sm:rounded-[3rem] sm:p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#9a6b00]">
                Sélection spéciale
              </p>

              <h2 className="mt-3 text-2xl font-black leading-tight text-gray-950 sm:text-4xl md:text-5xl">
                La rentrée avec style
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
                  className="rounded-2xl border-t-4 border-[#f36f45] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:rounded-[2rem] sm:p-6"
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
