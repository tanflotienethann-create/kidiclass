"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getDeliveryFee, isRollingBagProduct } from "@/lib/delivery";
import {
  getActivePromoCode,
  getPromoDiscount,
  normalizePromoCode,
} from "@/lib/promoCodes";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  PackageCheck,
  AlertCircle,
} from "lucide-react";

type CartItem = {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  selectedSize: string;
  quantity: number;
};

type ProductStock = {
  id: number;
  name: string;
  stock: number;
  category: string | null;
  product_type: string | null;
  is_pack: boolean | null;
};

export default function PanierPage() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];

    const storedCart = localStorage.getItem("kidiclass_cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [productStocks, setProductStocks] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [promoCode, setPromoCode] = useState(() => {
    if (typeof window === "undefined") return "";

    return localStorage.getItem("kidiclass_promo_code") || "";
  });
  const [appliedPromoCode, setAppliedPromoCode] = useState(() => {
    if (typeof window === "undefined") return "";

    return localStorage.getItem("kidiclass_promo_code") || "";
  });
  const [appliedPromoPercentage, setAppliedPromoPercentage] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);

  const fetchProductStocks = useCallback(async (items: CartItem[]) => {
    const productIds = items.map((item) => item.productId);

    if (productIds.length === 0) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("products")
      .select("id,name,stock,category,product_type,is_pack")
      .in("id", productIds);

    setProductStocks((data as ProductStock[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchProductStocks(cart);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [cart, fetchProductStocks]);

  useEffect(() => {
    if (!appliedPromoCode) return;

    let active = true;

    async function validateSavedPromoCode() {
      const promotion = await getActivePromoCode(appliedPromoCode);
      if (!active) return;

      if (!promotion) {
        setAppliedPromoCode("");
        setAppliedPromoPercentage(0);
        localStorage.removeItem("kidiclass_promo_code");
        return;
      }

      setAppliedPromoCode(promotion.code);
      setPromoCode(promotion.code);
      setAppliedPromoPercentage(promotion.percentage);
    }

    void validateSavedPromoCode();

    return () => {
      active = false;
    };
  }, [appliedPromoCode]);

  function saveCart(updatedCart: CartItem[]) {
    setCart(updatedCart);
    localStorage.setItem("kidiclass_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("kidiclass-cart-updated"));
  }

  function getProductStock(productId: number) {
    const product = productStocks.find((item) => item.id === productId);

    return Number(product?.stock || 0);
  }

  function isPackProduct(productId: number) {
    const product = productStocks.find((item) => item.id === productId);

    return (
      product?.category === "Packs scolaires" ||
      product?.category === "PACK" ||
      Boolean(product?.is_pack)
    );
  }

  function decreaseQuantity(index: number) {
    setMessage("");

    const updatedCart = cart.map((item, itemIndex) => {
      if (itemIndex !== index) return item;

      return {
        ...item,
        quantity: item.quantity <= 1 ? 1 : item.quantity - 1,
      };
    });

    saveCart(updatedCart);
  }

  function increaseQuantity(index: number) {
    setMessage("");

    const item = cart[index];
    const availableStock = getProductStock(item.productId);

    if (item.quantity >= availableStock) {
      setMessage(`Quantité demandée indisponible pour "${item.productName}".`);
      return;
    }

    const updatedCart = cart.map((cartItem, itemIndex) => {
      if (itemIndex !== index) return cartItem;

      return {
        ...cartItem,
        quantity: cartItem.quantity + 1,
      };
    });

    saveCart(updatedCart);
  }

  function removeItem(index: number) {
    setMessage("");

    const updatedCart = cart.filter((_, itemIndex) => itemIndex !== index);

    saveCart(updatedCart);

    if (updatedCart.length === 0) {
      localStorage.removeItem("kidiclass_cart");
      window.dispatchEvent(new Event("kidiclass-cart-updated"));
    }
  }

  function clearCart() {
    setMessage("");
    setCart([]);
    localStorage.removeItem("kidiclass_cart");
    window.dispatchEvent(new Event("kidiclass-cart-updated"));
  }

  async function applyPromoCode() {
    const normalizedCode = normalizePromoCode(promoCode);

    if (!normalizedCode) {
      setMessage("Veuillez renseigner un code promo.");
      return;
    }

    setPromoLoading(true);
    const promotion = await getActivePromoCode(normalizedCode);
    setPromoLoading(false);

    if (!promotion) {
      setMessage("Ce code promo est invalide ou n’est plus actif.");
      setAppliedPromoCode("");
      setAppliedPromoPercentage(0);
      localStorage.removeItem("kidiclass_promo_code");
      return;
    }

    setMessage("");
    setPromoCode(promotion.code);
    setAppliedPromoCode(promotion.code);
    setAppliedPromoPercentage(promotion.percentage);
    localStorage.setItem("kidiclass_promo_code", promotion.code);
  }

  function removePromoCode() {
    setAppliedPromoCode("");
    setAppliedPromoPercentage(0);
    setPromoCode("");
    localStorage.removeItem("kidiclass_promo_code");
  }

  function validateCartBeforeCheckout() {
    for (const item of cart) {
      const availableStock = getProductStock(item.productId);

      if (availableStock <= 0) {
        setMessage(`"${item.productName}" est actuellement en rupture de stock.`);
        return false;
      }

      if (item.quantity > availableStock) {
        setMessage(`Quantité demandée indisponible pour "${item.productName}".`);
        return false;
      }
    }

    return true;
  }

  const subtotal = cart.reduce((sum, item) => {
    return sum + item.productPrice * item.quantity;
  }, 0);

  const hasRollingBag = cart.some((item) => {
    const product = productStocks.find((stockItem) => {
      return stockItem.id === item.productId;
    });

    return isRollingBagProduct(product || { name: item.productName });
  });
  const estimatedDeliveryFee = getDeliveryFee("Abidjan", hasRollingBag);
  const promoDiscount = getPromoDiscount(
    subtotal,
    appliedPromoPercentage,
  );
  const estimatedTotal = Math.max(subtotal - promoDiscount, 0) + estimatedDeliveryFee;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffdf7] px-6 py-12">
        <section className="mx-auto max-w-3xl rounded-[2.5rem] bg-white p-10 text-center shadow-sm">
          <ShoppingBag
            size={44}
            className="mx-auto text-[#1db7bd]"
            strokeWidth={2.5}
          />

          <p className="mt-5 text-xl font-black text-[#1db7bd]">
            Chargement du panier...
          </p>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#fffdf7] px-6 py-12">
        <section className="mx-auto max-w-3xl rounded-[2.5rem] border border-gray-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#e9fbfc] text-[#1db7bd]">
            <ShoppingBag size={46} strokeWidth={2.5} />
          </div>

          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#f36f45]">
            Panier KidiClass
          </p>

          <h1 className="text-4xl font-black text-gray-950">
            Votre panier est vide
          </h1>

          <p className="mt-4 text-base font-bold leading-7 text-gray-500">
            Ajoutez des articles au panier avant de finaliser votre commande.
          </p>

          <Link
            href="/catalogue"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f36f45] px-8 py-4 font-black text-white shadow-sm hover:bg-[#e85e33]"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
            Retour au catalogue
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <section className="border-b border-gray-100 bg-[#e9fbfc] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/catalogue"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#1db7bd] shadow-sm hover:bg-[#1db7bd] hover:text-white"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
            Continuer mes achats
          </Link>

          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#1db7bd]">
            Panier
          </p>

          <h1 className="text-5xl font-black text-gray-950">
            Votre sélection KidiClass
          </h1>

          <p className="mt-3 max-w-2xl font-bold leading-7 text-gray-600">
            Vérifiez vos articles, les tailles sélectionnées et les quantités
            avant de passer à la commande.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_390px]">
        <div className="space-y-5">
          {message && (
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-5 font-bold leading-6 text-red-500">
              <AlertCircle size={22} className="shrink-0" strokeWidth={2.5} />
              <span>{message}</span>
            </div>
          )}

          {cart.map((item, index) => {
            const availableStock = getProductStock(item.productId);
            const isOutOfStock = availableStock <= 0;
            const quantityTooHigh = item.quantity > availableStock;
            const isPack = isPackProduct(item.productId);

            return (
              <article
                key={`${item.productId}-${item.selectedSize}-${index}`}
                className="rounded-[2.2rem] border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="grid gap-5 md:grid-cols-[150px_1fr_auto]">
                  <Link
                    href={`/produit/${item.productId}`}
                    className="block overflow-hidden rounded-[1.5rem] bg-gray-100"
                  >
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-44 w-full object-cover object-top transition hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center text-sm font-bold text-gray-400">
                        Aucune image
                      </div>
                    )}
                  </Link>

                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {isPack && (
                        <span className="rounded-full bg-[#fff9cf] px-4 py-2 text-xs font-black text-[#c7a900]">
                          Pack scolaire
                        </span>
                      )}

                      {item.selectedSize && (
                        <span className="rounded-full bg-[#e9fbfc] px-4 py-2 text-xs font-black text-[#1db7bd]">
                          Taille / pointure : {item.selectedSize}
                        </span>
                      )}

                      {isOutOfStock && (
                        <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-500">
                          Rupture
                        </span>
                      )}

                      {quantityTooHigh && !isOutOfStock && (
                        <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-orange-600">
                          Quantité indisponible
                        </span>
                      )}
                    </div>

                    <Link href={`/produit/${item.productId}`}>
                      <h2 className="text-2xl font-black leading-8 text-gray-950 hover:text-[#1db7bd]">
                        {item.productName}
                      </h2>
                    </Link>

                    <p className="mt-3 text-xl font-black text-[#f36f45]">
                      {Number(item.productPrice).toLocaleString("fr-FR")} FCFA
                    </p>

                    {(isOutOfStock || quantityTooHigh) && (
                      <p className="mt-3 w-fit rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-500">
                        Quantité indisponible
                      </p>
                    )}

                    <div className="mt-5 flex w-fit items-center gap-3 rounded-full border border-gray-200 bg-white p-2">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(index)}
                        disabled={item.quantity <= 1}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9fbfc] text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus size={17} strokeWidth={2.5} />
                      </button>

                      <span className="min-w-10 text-center text-lg font-black text-gray-950">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(index)}
                        disabled={isOutOfStock || item.quantity >= availableStock}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9fbfc] text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus size={17} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-5 md:items-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="flex w-fit items-center gap-2 rounded-full bg-red-50 px-5 py-3 font-black text-red-500 hover:bg-red-100"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                      Retirer
                    </button>

                    <div className="text-left md:text-right">
                      <p className="text-sm font-bold text-gray-500">
                        Sous-total article
                      </p>

                      <p className="mt-1 text-2xl font-black text-gray-950">
                        {(item.productPrice * item.quantity).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        FCFA
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          <button
            type="button"
            onClick={clearCart}
            className="rounded-full border-2 border-red-200 px-6 py-4 font-black text-red-500 hover:bg-red-50"
          >
            Vider le panier
          </button>
        </div>

        <aside className="h-fit rounded-[2.5rem] border border-gray-100 bg-white p-7 shadow-sm lg:sticky lg:top-44">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
            <PackageCheck size={34} strokeWidth={2.5} />
          </div>

          <h2 className="text-3xl font-black text-gray-950">
            Résumé du panier
          </h2>

          <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
            Livraison Abidjan : 1 000 FCFA. Avec un sac à roulette : 2 000
            FCFA. Bassam, Songon et Anyama : 2 500 FCFA.
          </p>

          <div className="mt-7 space-y-4">
            <div className="flex justify-between gap-4 text-gray-700">
              <span className="font-bold">Articles</span>
              <span className="font-black">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-gray-700">
              <span className="font-bold">Sous-total</span>
              <span className="font-black">
                {subtotal.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            <div className="flex justify-between gap-4 text-gray-700">
              <span className="font-bold">
                {hasRollingBag
                  ? "Livraison Abidjan avec sac à roulette"
                  : "Livraison Abidjan"}
              </span>
              <span className="font-black">
                {estimatedDeliveryFee.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            <div className="rounded-2xl bg-[#fff9cf] p-4 text-sm font-bold leading-6 text-[#c7a900]">
              Les frais de livraison sont appliqués selon la zone choisie au
              moment de la commande.
            </div>

            <div className="rounded-2xl border border-[#bfedf0] p-4">
              <p className="text-sm font-black text-gray-950">Code promo</p>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Votre code"
                  className="min-w-0 flex-1 rounded-full border-2 border-[#bfedf0] px-4 py-3 text-sm font-black uppercase outline-none focus:border-[#1db7bd]"
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                />

                <button
                  type="button"
                  onClick={() => void applyPromoCode()}
                  disabled={promoLoading}
                  className="rounded-full bg-[#1db7bd] px-5 py-3 text-sm font-black text-white hover:bg-[#159ca1]"
                >
                  {promoLoading ? "Vérification..." : "Appliquer"}
                </button>
              </div>

              {appliedPromoCode && (
                <button
                  type="button"
                  onClick={removePromoCode}
                  className="mt-3 text-sm font-black text-[#f36f45]"
                >
                  Retirer le code {appliedPromoCode} (-{appliedPromoPercentage}%)
                </button>
              )}
            </div>

            {promoDiscount > 0 && (
              <div className="flex justify-between gap-4 text-green-700">
                <span className="font-bold">Remise {appliedPromoCode}</span>
                <span className="font-black">
                  -{promoDiscount.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="flex justify-between gap-4">
              <span className="text-xl font-black text-gray-950">
                Total estimé
              </span>

              <span className="text-right text-2xl font-black text-[#f36f45]">
                {estimatedTotal.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>

          <Link
            href="/commande"
            onClick={(e) => {
              const isValid = validateCartBeforeCheckout();

              if (!isValid) {
                e.preventDefault();
              }
            }}
            className="mt-7 block rounded-full bg-[#f36f45] px-8 py-5 text-center text-lg font-black text-white shadow-sm hover:bg-[#e85e33]"
          >
            Passer la commande
          </Link>

          <Link
            href="/catalogue"
            className="mt-3 block rounded-full border-2 border-[#1db7bd] px-8 py-4 text-center font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white"
          >
            Continuer mes achats
          </Link>
        </aside>
      </section>
    </main>
  );
}
