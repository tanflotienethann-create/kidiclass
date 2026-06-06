"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Heart, Minus, Plus, ShoppingBag, Zap } from "lucide-react";

type CartItem = {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  selectedSize: string;
  quantity: number;
};

type ProductActionsProps = {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  stock: number;
  sizes: string;
};

export default function ProductActions({
  productId,
  productName,
  productPrice,
  productImage,
  stock,
  sizes,
}: ProductActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [message, setMessage] = useState("");
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window === "undefined") return false;

    const storedFavorites = localStorage.getItem("kidiclass_favorites");
    const favorites: number[] = storedFavorites ? JSON.parse(storedFavorites) : [];

    return favorites.includes(productId);
  });

  const availableSizes = useMemo(() => {
    if (!sizes) return [];

    return sizes
      .split(",")
      .map((size) => size.trim())
      .filter((size) => size.length > 0);
  }, [sizes]);

  const isOutOfStock = Number(stock || 0) <= 0;

  function decreaseQuantity() {
    setQuantity((currentQuantity) => {
      if (currentQuantity <= 1) return 1;

      return currentQuantity - 1;
    });
  }

  function increaseQuantity() {
    setQuantity((currentQuantity) => {
      if (currentQuantity >= stock) return currentQuantity;

      return currentQuantity + 1;
    });
  }

  function addToCart() {
    setMessage("");

    if (isOutOfStock) {
      setMessage("Ce produit est actuellement en rupture de stock.");
      return false;
    }

    if (quantity > stock) {
      setMessage(`Stock insuffisant. Stock disponible : ${stock}.`);
      return false;
    }

    if (availableSizes.length > 0 && !selectedSize) {
      setMessage("Veuillez choisir une taille ou une pointure.");
      return false;
    }

    const storedCart = localStorage.getItem("kidiclass_cart");
    const currentCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

    const existingItemIndex = currentCart.findIndex((item) => {
      return item.productId === productId && item.selectedSize === selectedSize;
    });

    if (existingItemIndex >= 0) {
      const existingItem = currentCart[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > stock) {
        setMessage(`Stock insuffisant. Stock disponible : ${stock}.`);
        return false;
      }

      currentCart[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
      };
    } else {
      currentCart.push({
        productId,
        productName,
        productPrice,
        productImage,
        selectedSize,
        quantity,
      });
    }

    localStorage.setItem("kidiclass_cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("kidiclass-cart-updated"));
    setMessage("Produit ajouté au panier.");
    return true;
  }

  function buyNow() {
    const added = addToCart();

    if (added) {
      router.push("/panier");
    }
  }

  function toggleFavorite() {
    const storedFavorites = localStorage.getItem("kidiclass_favorites");
    const favorites: number[] = storedFavorites ? JSON.parse(storedFavorites) : [];
    const nextFavorites = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];

    localStorage.setItem("kidiclass_favorites", JSON.stringify(nextFavorites));
    setIsFavorite(nextFavorites.includes(productId));
  }

  return (
    <div className="rounded-[2.5rem] border border-gray-100 bg-white p-7 shadow-sm">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
        <ShoppingBag size={30} strokeWidth={2.5} />
      </div>

      <h2 className="text-3xl font-black text-gray-950">
        Ajouter au panier
      </h2>

      <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
        Choisissez la quantité souhaitée avant d’ajouter l’article à votre
        panier.
      </p>

      {availableSizes.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-black text-gray-700">
            Taille / pointure
          </p>

          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`rounded-full border-2 px-5 py-3 text-sm font-black transition ${
                  selectedSize === size
                    ? "border-[#1db7bd] bg-[#1db7bd] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#1db7bd] hover:text-[#1db7bd]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <p className="mb-3 text-sm font-black text-gray-700">Quantité</p>

        <div className="flex w-fit items-center gap-3 rounded-full border border-gray-200 bg-white p-2">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={quantity <= 1 || isOutOfStock}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9fbfc] text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={18} strokeWidth={2.5} />
          </button>

          <span className="min-w-10 text-center text-lg font-black text-gray-950">
            {quantity}
          </span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={quantity >= stock || isOutOfStock}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9fbfc] text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        <p className="mt-2 text-xs font-bold text-gray-500">
          Stock disponible : {stock}
        </p>
      </div>

      {message && (
        <div
          className={`mt-5 rounded-2xl p-4 text-sm font-bold leading-6 ${
            message === "Produit ajouté au panier."
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {message === "Produit ajouté au panier." && (
            <CheckCircle2
              size={18}
              className="mr-2 inline-block"
              strokeWidth={2.5}
            />
          )}
          {message}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={addToCart}
          disabled={isOutOfStock}
          className="rounded-full bg-[#f36f45] px-7 py-4 font-black text-white shadow-sm hover:bg-[#e85e33] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isOutOfStock ? "Indisponible" : "Ajouter au panier"}
        </button>

        <button
          type="button"
          onClick={buyNow}
          disabled={isOutOfStock}
          className="flex items-center justify-center gap-2 rounded-full bg-[#1db7bd] px-7 py-4 font-black text-white shadow-sm hover:bg-[#159ca1] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Zap size={18} strokeWidth={2.5} />
          Acheter maintenant
        </button>

        <Link
          href="/panier"
          className="rounded-full border-2 border-[#1db7bd] px-7 py-4 text-center font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white"
        >
          Voir le panier
        </Link>

        <button
          type="button"
          onClick={toggleFavorite}
          className={`flex items-center justify-center gap-2 rounded-full border-2 px-7 py-4 font-black transition ${
            isFavorite
              ? "border-[#f36f45] bg-[#fff1f5] text-[#f36f45]"
              : "border-[#f36f45] bg-white text-[#f36f45] hover:bg-[#fff1f5]"
          }`}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
          {isFavorite ? "Dans mes favoris" : "Ajouter aux favoris"}
        </button>
      </div>
    </div>
  );
}
