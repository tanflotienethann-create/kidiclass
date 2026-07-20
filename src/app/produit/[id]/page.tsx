import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductAvailabilityLabel } from "@/lib/productAvailability";
import { supabase } from "@/lib/supabase";
import ProductQuickAddButton from "@/components/ProductQuickAddButton";
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

type SuggestedProduct = {
  id: number;
  name: string;
  price: number;
  old_price: number | null;
  stock: number;
  image_url: string | null;
  images: string[] | null;
  category: string | null;
  product_type: string | null;
  character_theme: string | null;
  school_level: string | null;
  is_promo: boolean | null;
  is_new: boolean | null;
  is_favorite: boolean | null;
};

function PackContentsCard({ packItems }: { packItems: PackItem[] }) {
  if (packItems.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#f4e49f] bg-[#fffdf7] p-3.5 shadow-sm sm:p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff3bf] text-[#9a6b00]">
          <Boxes size={22} strokeWidth={2.5} />
        </span>

        <div>
          <h2 className="text-lg font-black text-gray-950">
            Ce pack contient
          </h2>
          <p className="text-xs font-bold leading-5 text-gray-500">
            Les éléments inclus dans ce pack.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 min-[520px]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {packItems.map((item) => {
          const componentStock = Number(item.component_stock || 0);
          const requiredQuantity = Number(item.required_quantity || 1);
          const componentIsAvailable = componentStock >= requiredQuantity;

          return (
            <div
              key={item.id}
              className="rounded-xl bg-white px-3 py-2.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-black leading-snug text-gray-950">
                    {item.component_name}
                  </p>

                  {item.component_description && (
                    <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-gray-500">
                      {item.component_description}
                    </p>
                  )}
                </div>

                <span className="shrink-0 rounded-full bg-[#fff3bf] px-2.5 py-1 text-xs font-black text-[#8b7100]">
                  x{requiredQuantity}
                </span>
              </div>

              <p
                className={`mt-2 w-fit rounded-full px-2.5 py-1 text-[11px] font-black ${
                  componentIsAvailable
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {componentIsAvailable ? "Disponible" : "Rupture"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getSuggestedProductImage(product: SuggestedProduct) {
  if (product.images && product.images.length > 0) return product.images[0];
  return product.image_url || "";
}

function getSuggestionScore(product: Product, suggestion: SuggestedProduct) {
  let score = 0;

  if (product.category && product.category === suggestion.category) score += 5;
  if (product.product_type && product.product_type === suggestion.product_type) {
    score += 4;
  }
  if (
    product.character_theme &&
    product.character_theme === suggestion.character_theme
  ) {
    score += 3;
  }
  if (product.school_level && product.school_level === suggestion.school_level) {
    score += 2;
  }
  if (Number(suggestion.stock || 0) > 0) score += 1;
  if (suggestion.is_promo || suggestion.is_new || suggestion.is_favorite) {
    score += 0.5;
  }

  return score;
}

function getProductSuggestions(
  product: Product,
  suggestions: SuggestedProduct[],
) {
  const scoredSuggestions = suggestions
    .map((suggestion, index) => ({
      suggestion,
      index,
      score: getSuggestionScore(product, suggestion),
    }))
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;
      return first.index - second.index;
    });

  const relatedSuggestions = scoredSuggestions
    .filter((item) => item.score > 0)
    .map((item) => item.suggestion);

  const fallbackSuggestions = scoredSuggestions.map((item) => item.suggestion);

  return (relatedSuggestions.length > 0
    ? relatedSuggestions
    : fallbackSuggestions
  ).slice(0, 4);
}

function ProductSuggestions({
  suggestions,
}: {
  suggestions: SuggestedProduct[];
}) {
  if (suggestions.length === 0) return null;

  return (
    <section className="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm sm:rounded-[2.5rem] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1db7bd]">
            Suggestions
          </p>
          <h2 className="mt-1 text-2xl font-black text-gray-950">
            Vous aimerez aussi
          </h2>
        </div>

        <Link
          href="/catalogue"
          className="hidden rounded-full bg-[#e9fbfc] px-4 py-2 text-sm font-black text-[#087f83] hover:bg-[#1db7bd] hover:text-white sm:inline-flex"
        >
          Catalogue
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {suggestions.map((suggestion) => {
          const image = getSuggestedProductImage(suggestion);
          const isOutOfStock = Number(suggestion.stock || 0) <= 0;
          const hasOldPrice =
            suggestion.old_price !== null &&
            Number(suggestion.old_price) > Number(suggestion.price);

          return (
            <article
              key={suggestion.id}
              className="flex min-h-full flex-col overflow-hidden rounded-2xl border border-[#f4efe7] bg-[#fffdf7] shadow-sm"
            >
              <Link href={`/produit/${suggestion.id}`} className="block">
                <div className="flex aspect-square items-center justify-center bg-white p-3">
                  {image ? (
                    <img
                      src={image}
                      alt={suggestion.name}
                      className="h-full w-full object-contain object-center"
                    />
                  ) : (
                    <div className="h-full w-full rounded-2xl bg-[#e9fbfc]" />
                  )}
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <p className="line-clamp-2 text-sm font-black leading-tight text-gray-950 sm:text-base">
                  {suggestion.name}
                </p>

                <div className="mt-2">
                  <p className="text-base font-black text-[#f36f45] sm:text-lg">
                    {Number(suggestion.price).toLocaleString("fr-FR")} FCFA
                  </p>
                  {hasOldPrice && (
                    <p className="text-xs font-black text-gray-400 line-through">
                      {Number(suggestion.old_price).toLocaleString("fr-FR")} FCFA
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-3">
                  <ProductQuickAddButton
                    productId={suggestion.id}
                    productName={suggestion.name}
                    productPrice={Number(suggestion.price)}
                    productImage={image}
                    stock={Number(suggestion.stock || 0)}
                    className={`w-full px-3 py-2.5 text-xs ${
                      isOutOfStock
                        ? "bg-gray-200 text-gray-500"
                        : "bg-[#f36f45] text-white hover:bg-[#e85e33]"
                    }`}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

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

  const { data: suggestionData } = await supabase
    .from("products")
    .select(
      "id,name,price,old_price,stock,image_url,images,category,product_type,character_theme,school_level,is_promo,is_new,is_favorite",
    )
    .neq("id", product.id)
    .or("is_archived.is.false,is_archived.is.null")
    .order("created_at", { ascending: false })
    .limit(40);

  const suggestedProducts = getProductSuggestions(
    product,
    (suggestionData as SuggestedProduct[]) || [],
  );

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <section className="border-b border-gray-100 bg-[#e9fbfc] px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link
            href="/catalogue"
            className="flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-black text-[#1db7bd] shadow-sm hover:bg-[#1db7bd] hover:text-white sm:px-5 sm:py-3 sm:text-base"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
            Retour au catalogue
          </Link>

          <div className="flex flex-wrap gap-2">
            {product.is_new && (
              <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#1db7bd] shadow-sm sm:px-4 sm:py-2">
                <Sparkles size={16} strokeWidth={2.5} />
                Nouveauté
              </span>
            )}

            {product.is_favorite && (
              <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#c7a900] shadow-sm sm:px-4 sm:py-2">
                <Star size={16} strokeWidth={2.5} />
                Coup de cœur
              </span>
            )}

            {product.is_promo && (
              <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#f36f45] shadow-sm sm:px-4 sm:py-2">
                <Tag size={16} strokeWidth={2.5} />
                Promo
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] lg:gap-8">
        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <ProductGallery images={productImages} productName={product.name} />
          {isPack && <PackContentsCard packItems={packItems} />}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-[2.5rem] sm:p-7">
            <div className="mb-5 flex flex-wrap gap-2">
              {product.category && (
                <span className="rounded-full bg-[#e9fbfc] px-3 py-1.5 text-xs font-black text-[#1db7bd] sm:px-4 sm:py-2">
                  {product.category}
                </span>
              )}

              {product.product_type && (
                <span className="rounded-full bg-[#fff1f5] px-3 py-1.5 text-xs font-black text-[#f36f45] sm:px-4 sm:py-2">
                  {product.product_type}
                </span>
              )}

              {isPack && (
                <span className="rounded-full bg-[#fff9cf] px-3 py-1.5 text-xs font-black text-[#c7a900] sm:px-4 sm:py-2">
                  Pack scolaire
                </span>
              )}

              {isOutOfStock && (
                <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-500 sm:px-4 sm:py-2">
                  Rupture de stock
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black leading-tight text-gray-950 min-[390px]:text-[2.15rem] md:text-5xl">
              {product.name}
            </h1>

            {product.reference && (
              <p className="mt-3 text-sm font-bold text-gray-500">
                Référence : {product.reference}
              </p>
            )}

            <div className="mt-6">
              <div className="flex flex-wrap items-end gap-3">
                <p className="text-[1.75rem] font-black text-[#f36f45] min-[390px]:text-3xl sm:text-4xl">
                  {Number(product.price).toLocaleString("fr-FR")} FCFA
                </p>

                {hasOldPrice && (
                  <p className="pb-1 text-lg font-black text-gray-400 line-through">
                    {Number(product.old_price).toLocaleString("fr-FR")} FCFA
                  </p>
                )}

                {discountPercent > 0 && (
                  <span className="mb-1 rounded-full bg-[#fff1f5] px-3 py-1.5 text-xs font-black text-[#f36f45] sm:px-4 sm:py-2 sm:text-sm">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              <p
                className={`mt-4 max-w-full rounded-2xl px-3 py-2 text-xs font-black leading-tight sm:w-fit sm:px-5 sm:text-sm ${
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
                Livraison locale
              </p>

              <p className="mt-1 text-xs font-bold text-gray-500">
                Abidjan 1 000 FCFA, sac à roulette 2 000 FCFA. Bingerville,
                Songon et Anyama 2 000 FCFA
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

          <ProductSuggestions suggestions={suggestedProducts} />
        </div>
      </section>
    </main>
  );
}
