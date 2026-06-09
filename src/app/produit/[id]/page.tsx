import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductAvailabilityLabel } from "@/lib/productAvailability";
import { supabase } from "@/lib/supabase";
import ProductGallery from "./ProductGallery";
import ProductActions from "./ProductActions";
import {
  BadgeCheck,
  Boxes,
  ChevronLeft,
  Heart,
  PackageCheck,
  Palette,
  Ruler,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck,
  UserRound,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  availability_status: string | null;
  image_url: string | null;
  images: string[] | null;
  category: string | null;
  reference: string | null;
  sizes: string | null;
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

type PackItem = {
  id: number;
  component_name: string;
  component_description: string | null;
  component_stock: number | null;
  required_quantity: number | null;
};

type ProductVariant = {
  id: number;
  size: string | null;
  color: string | null;
  stock: number | null;
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const productId = Number(resolvedParams.id);

  if (!productId) {
    notFound();
  }

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (productError || !productData) {
    notFound();
  }

  const product = productData as Product;

  const isPack =
    product.category === "Packs scolaires" ||
    product.category === "PACK" ||
    Boolean(product.is_pack);

  let packItems: PackItem[] = [];
  let variants: ProductVariant[] = [];

  if (isPack) {
    const { data: packItemsData } = await supabase
      .from("product_pack_items")
      .select("*")
      .eq("pack_product_id", product.id)
      .order("id", { ascending: true });

    packItems = (packItemsData as PackItem[]) || [];
  } else {
    const { data: variantsData } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .order("id", { ascending: true });

    variants = (variantsData as ProductVariant[]) || [];
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image_url
      ? [product.image_url]
      : [];

  const isOutOfStock = Number(product.stock || 0) <= 0;
  const availabilityLabel = getProductAvailabilityLabel(
    product.availability_status
  );

  const hasOldPrice =
    product.old_price !== null &&
    Number(product.old_price) > Number(product.price);

  const discountPercent = hasOldPrice
    ? Math.round(
        ((Number(product.old_price) - Number(product.price)) /
          Number(product.old_price)) *
          100
      )
    : 0;

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <section className="border-b border-gray-100 bg-[#e9fbfc] px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link
            href="/catalogue"
            className="flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#1db7bd] shadow-sm hover:bg-[#1db7bd] hover:text-white"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
            Retour au catalogue
          </Link>

          <div className="flex flex-wrap gap-2">
            {product.is_new && (
              <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#1db7bd] shadow-sm">
                <Sparkles size={16} strokeWidth={2.5} />
                Nouveauté
              </span>
            )}

            {product.is_favorite && (
              <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#c7a900] shadow-sm">
                <Star size={16} strokeWidth={2.5} />
                Coup de cœur
              </span>
            )}

            {product.is_promo && (
              <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#f36f45] shadow-sm">
                <Tag size={16} strokeWidth={2.5} />
                Promo
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery images={productImages} productName={product.name} />

        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-7 shadow-sm">
            <div className="mb-5 flex flex-wrap gap-2">
              {product.category && (
                <span className="rounded-full bg-[#e9fbfc] px-4 py-2 text-xs font-black text-[#1db7bd]">
                  {product.category}
                </span>
              )}

              {product.product_type && (
                <span className="rounded-full bg-[#fff1f5] px-4 py-2 text-xs font-black text-[#f36f45]">
                  {product.product_type}
                </span>
              )}

              {isPack && (
                <span className="rounded-full bg-[#fff9cf] px-4 py-2 text-xs font-black text-[#c7a900]">
                  Pack scolaire
                </span>
              )}

              {isOutOfStock && (
                <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-500">
                  Rupture de stock
                </span>
              )}
            </div>

            <h1 className="text-4xl font-black leading-tight text-gray-950 md:text-5xl">
              {product.name}
            </h1>

            {product.reference && (
              <p className="mt-3 text-sm font-bold text-gray-500">
                Référence : {product.reference}
              </p>
            )}

            <div className="mt-6">
              <div className="flex flex-wrap items-end gap-3">
                <p className="text-4xl font-black text-[#f36f45]">
                  {Number(product.price).toLocaleString("fr-FR")} FCFA
                </p>

                {hasOldPrice && (
                  <p className="pb-1 text-lg font-black text-gray-400 line-through">
                    {Number(product.old_price).toLocaleString("fr-FR")} FCFA
                  </p>
                )}

                {discountPercent > 0 && (
                  <span className="mb-1 rounded-full bg-[#fff1f5] px-4 py-2 text-sm font-black text-[#f36f45]">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              <p
                className={`mt-4 w-fit rounded-full px-5 py-2 text-sm font-black ${
                  isOutOfStock
                    ? "bg-red-50 text-red-500"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {isOutOfStock
                  ? "Indisponible actuellement"
                  : availabilityLabel}
              </p>
            </div>

            {product.description && (
              <p className="mt-6 text-base font-bold leading-8 text-gray-600">
                {product.description}
              </p>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {product.brand && (
                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#1db7bd]">
                    <BadgeCheck size={19} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Marque
                    </span>
                  </div>

                  <p className="font-black text-gray-950">{product.brand}</p>
                </div>
              )}

              {product.colors && (
                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#f36f45]">
                    <Palette size={19} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Couleurs
                    </span>
                  </div>

                  <p className="font-black text-gray-950">{product.colors}</p>
                </div>
              )}

              {product.target_age && (
                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#c7a900]">
                    <UserRound size={19} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Âge conseillé
                    </span>
                  </div>

                  <p className="font-black text-gray-950">
                    {product.target_age}
                  </p>
                </div>
              )}

              {product.gender && (
                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#1db7bd]">
                    <Heart size={19} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Sexe
                    </span>
                  </div>

                  <p className="font-black text-gray-950">{product.gender}</p>
                </div>
              )}

              {product.character_theme && (
                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#f36f45]">
                    <Sparkles size={19} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Thème
                    </span>
                  </div>

                  <p className="font-black text-gray-950">
                    {product.character_theme}
                  </p>
                </div>
              )}

              {product.school_level && (
                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#c7a900]">
                    <Ruler size={19} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Niveau
                    </span>
                  </div>

                  <p className="font-black text-gray-950">
                    {product.school_level}
                  </p>
                </div>
              )}
            </div>
          </div>

          {isPack && packItems.length > 0 && (
            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-7 shadow-sm">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff9cf] text-[#c7a900]">
                <Boxes size={30} strokeWidth={2.5} />
              </div>

              <h2 className="text-3xl font-black text-gray-950">
                Ce pack contient
              </h2>

              <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
                Le pack est disponible uniquement si tous ses composants sont
                prêts.
              </p>

              <div className="mt-6 space-y-3">
                {packItems.map((item) => {
                  const componentStock = Number(item.component_stock || 0);
                  const requiredQuantity = Number(item.required_quantity || 1);
                  const componentIsAvailable =
                    componentStock >= requiredQuantity;

                  return (
                    <div
                      key={item.id}
                      className="rounded-[1.5rem] bg-[#fffdf7] p-4"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-lg font-black text-gray-950">
                            {item.component_name}
                          </p>

                          {item.component_description && (
                            <p className="mt-1 text-sm font-bold leading-6 text-gray-500">
                              {item.component_description}
                            </p>
                          )}
                        </div>

                        <span
                          className={`w-fit rounded-full px-4 py-2 text-xs font-black ${
                            componentIsAvailable
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {componentIsAvailable
                            ? "Disponible"
                            : "Rupture"}
                        </span>
                      </div>

                      <p className="mt-3 text-xs font-bold text-gray-500">
                        Quantité requise dans le pack : {requiredQuantity}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isPack && variants.length > 0 && (
            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-7 shadow-sm">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
                <Ruler size={30} strokeWidth={2.5} />
              </div>

              <h2 className="text-3xl font-black text-gray-950">
                Tailles et couleurs
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {variants.map((variant) => {
                  const variantStock = Number(variant.stock || 0);

                  return (
                    <div
                      key={variant.id}
                      className="rounded-[1.5rem] bg-[#fffdf7] p-4"
                    >
                      <p className="font-black text-gray-950">
                        {variant.size || "Taille non précisée"}
                      </p>

                      {variant.color && (
                        <p className="mt-1 text-sm font-bold text-gray-500">
                          Couleur : {variant.color}
                        </p>
                      )}

                      <p
                        className={`mt-3 w-fit rounded-full px-4 py-2 text-xs font-black ${
                          variantStock > 0
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {variantStock > 0
                          ? "Disponible"
                          : "Rupture"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <ProductActions
            productId={product.id}
            productName={product.name}
            productPrice={Number(product.price)}
            productImage={product.image_url || productImages[0] || ""}
            stock={Number(product.stock || 0)}
            sizes={product.sizes || ""}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[2rem] bg-white p-5 text-center shadow-sm">
              <Truck
                size={30}
                className="mx-auto text-[#1db7bd]"
                strokeWidth={2.5}
              />

              <p className="mt-3 text-sm font-black text-gray-950">
                Livraison Abidjan
              </p>

              <p className="mt-1 text-xs font-bold text-gray-500">
                À partir de 1 000 FCFA
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-5 text-center shadow-sm">
              <ShieldCheck
                size={30}
                className="mx-auto text-[#f36f45]"
                strokeWidth={2.5}
              />

              <p className="mt-3 text-sm font-black text-gray-950">
                Confirmation
              </p>

              <p className="mt-1 text-xs font-bold text-gray-500">
                Avant livraison
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-5 text-center shadow-sm">
              <PackageCheck
                size={30}
                className="mx-auto text-[#c7a900]"
                strokeWidth={2.5}
              />

              <p className="mt-3 text-sm font-black text-gray-950">
                Stock suivi
              </p>

              <p className="mt-1 text-xs font-bold text-gray-500">
                Selon disponibilité
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
