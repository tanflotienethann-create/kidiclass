"use client";

import { Check, ShoppingCart } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";

type ProductQuickAddButtonProps = {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  stock: number;
  className?: string;
};

type CartItem = {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  selectedSize: string;
  quantity: number;
};

export default function ProductQuickAddButton({
  productId,
  productName,
  productPrice,
  productImage,
  stock,
  className = "",
}: ProductQuickAddButtonProps) {
  const [added, setAdded] = useState(false);
  const isOutOfStock = Number(stock || 0) <= 0;

  function addToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isOutOfStock) return;

    const storedCart = localStorage.getItem("kidiclass_cart");
    const currentCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

    const existingItemIndex = currentCart.findIndex((item) => {
      return item.productId === productId && item.selectedSize === "";
    });

    if (existingItemIndex >= 0) {
      const existingItem = currentCart[existingItemIndex];
      const nextQuantity = Math.min(existingItem.quantity + 1, Number(stock || 1));

      currentCart[existingItemIndex] = {
        ...existingItem,
        quantity: nextQuantity,
      };
    } else {
      currentCart.push({
        productId,
        productName,
        productPrice,
        productImage,
        selectedSize: "",
        quantity: 1,
      });
    }

    localStorage.setItem("kidiclass_cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("kidiclass-cart-updated"));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={addToCart}
      disabled={isOutOfStock}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-black shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      aria-label={
        isOutOfStock
          ? "Produit indisponible"
          : `Ajouter ${productName} au panier`
      }
    >
      {added ? (
        <>
          <Check size={16} strokeWidth={3} />
          Ajouté
        </>
      ) : (
        <>
          <ShoppingCart size={16} strokeWidth={2.8} />
          Ajouter
        </>
      )}
    </button>
  );
}
