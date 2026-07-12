"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import KidiclassSelect from "@/components/KidiclassSelect";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDeliveryFee,
  isFixedDeliveryArea,
  isRollingBagProduct,
} from "@/lib/delivery";
import {
  buildOrderPaymentMethod,
  getDefaultPaymentOption,
  getDepositAmount,
  getPaymentInstruction,
  getPaymentOptions,
  getRemainingAmount,
  getSecondInstallmentAmount,
  needsOnlinePayment,
} from "@/lib/paymentWorkflow";
import {
  availabilityOptions,
  getLongestAvailabilityStatus,
  parseAvailabilityStatuses,
} from "@/lib/productAvailability";
import { encodeOrderItemSelection } from "@/lib/orderItemSelection";
import { getActivePromoCode, getPromoDiscount } from "@/lib/promoCodes";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, LogIn, ShoppingCart, UserPlus } from "lucide-react";

const AddressMap = dynamic(() => import("./AddressMap"), {
  ssr: false,
});

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
  availability_status: string | null;
  is_pack: boolean | null;
};

type PackItem = {
  id: number;
  pack_product_id: number;
  component_name: string;
  component_description: string | null;
  component_stock: number | null;
  required_quantity: number | null;
};

const abidjanCommunes = [
  "Abobo",
  "Adjamé",
  "Attécoubé",
  "Cocody",
  "Koumassi",
  "Marcory",
  "Plateau",
  "Port-Bouët",
  "Treichville",
  "Yopougon",
];

const deliveryAreas = [
  "Abidjan",
  "Bingerville",
  "Bassam",
  "Songon",
  "Anyama",
  "Intérieur Côte d'Ivoire",
  "Étranger",
];

const countryCodes = [
  { country: "Côte d’Ivoire", code: "+225" },
  { country: "France", code: "+33" },
  { country: "Belgique", code: "+32" },
  { country: "Suisse", code: "+41" },
  { country: "Canada", code: "+1" },
  { country: "États-Unis", code: "+1" },
  { country: "Royaume-Uni", code: "+44" },
  { country: "Sénégal", code: "+221" },
  { country: "Burkina Faso", code: "+226" },
  { country: "Mali", code: "+223" },
  { country: "Togo", code: "+228" },
  { country: "Bénin", code: "+229" },
  { country: "Guinée", code: "+224" },
  { country: "Cameroun", code: "+237" },
  { country: "Gabon", code: "+241" },
  { country: "Congo", code: "+242" },
  { country: "RDC", code: "+243" },
  { country: "Maroc", code: "+212" },
  { country: "Algérie", code: "+213" },
  { country: "Tunisie", code: "+216" },
  { country: "Afrique du Sud", code: "+27" },
  { country: "Allemagne", code: "+49" },
  { country: "Espagne", code: "+34" },
  { country: "Italie", code: "+39" },
  { country: "Portugal", code: "+351" },
  { country: "Pays-Bas", code: "+31" },
  { country: "Chine", code: "+86" },
  { country: "Inde", code: "+91" },
  { country: "Japon", code: "+81" },
  { country: "Brésil", code: "+55" },
  { country: "Australie", code: "+61" },
];

const countryCodeOptions = countryCodes.map((item) => {
  return `${item.country} ${item.code}`;
});

export default function CommandePage() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];

    const storedCart = localStorage.getItem("kidiclass_cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const [customerName, setCustomerName] = useState("");
  const [countryCodeLabel, setCountryCodeLabel] = useState(
    "Côte d’Ivoire +225"
  );
  const [customerPhone, setCustomerPhone] = useState("");

  const [deliveryArea, setDeliveryArea] = useState("Abidjan");
  const [customerCity, setCustomerCity] = useState("Cocody");
  const [customerAddress, setCustomerAddress] = useState("");

  const [deliveryLatitude, setDeliveryLatitude] = useState<number | null>(null);
  const [deliveryLongitude, setDeliveryLongitude] = useState<number | null>(
    null
  );
  const [deliveryMapAddress, setDeliveryMapAddress] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("Paiement à la livraison");

  const [message, setMessage] = useState("");
  const [orderReference, setOrderReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState(() => {
    if (typeof window === "undefined") return "";

    return localStorage.getItem("kidiclass_promo_code") || "";
  });
  const [promoPercentage, setPromoPercentage] = useState(0);
  const [hasRollingBag, setHasRollingBag] = useState(false);
  const [cartProductsById, setCartProductsById] = useState<
    Record<number, ProductStock>
  >({});
  const [cartAvailabilityOptions, setCartAvailabilityOptions] = useState<
    Record<number, string[]>
  >({});
  const [selectedAvailabilityByProductId, setSelectedAvailabilityByProductId] =
    useState<Record<number, string>>({});
  const [paydunyaReady, setPaydunyaReady] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const adminWhatsappNumber = "2250779311555";

  const selectedCountryCode =
    countryCodes.find((item) => {
      return `${item.country} ${item.code}` === countryCodeLabel;
    })?.code || "+225";

  useEffect(() => {
    let active = true;

    async function applyClientProfile(userId: string) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,phone")
        .eq("id", userId)
        .maybeSingle();

      if (!active) return;

      if (profile?.full_name) {
        setCustomerName((currentName) => currentName || profile.full_name || "");
      }

      if (profile?.phone) {
        setCustomerPhone((currentPhone) => currentPhone || profile.phone || "");
      }
    }

    async function loadSession() {
      setAuthLoading(true);
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user || null;

      if (!active) return;

      setCurrentUserId(user?.id || null);

      if (user?.id) {
        void applyClientProfile(user.id);
      }

      setAuthLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setCurrentUserId(user?.id || null);
      setAuthLoading(false);

      if (user?.id) {
        void applyClientProfile(user.id);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );

  const promoDiscount = getPromoDiscount(subtotal, promoPercentage);
  function getSelectedAvailability(item: CartItem) {
    return (
      selectedAvailabilityByProductId[item.productId] ||
      cartAvailabilityOptions[item.productId]?.[0] ||
      availabilityOptions[0]
    );
  }

  const shipmentGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        availability: string;
        items: CartItem[];
        itemsTotal: number;
        itemsCount: number;
        hasRollingBag: boolean;
        deliveryFee: number;
      }
    >();

    cart.forEach((item) => {
      const availability =
        selectedAvailabilityByProductId[item.productId] ||
        cartAvailabilityOptions[item.productId]?.[0] ||
        availabilityOptions[0];
      const currentGroup =
        groups.get(availability) ||
        ({
          availability,
          items: [],
          itemsTotal: 0,
          itemsCount: 0,
          hasRollingBag: false,
          deliveryFee: 0,
        } satisfies {
          availability: string;
          items: CartItem[];
          itemsTotal: number;
          itemsCount: number;
          hasRollingBag: boolean;
          deliveryFee: number;
        });
      const product = cartProductsById[item.productId];

      currentGroup.items.push(item);
      currentGroup.itemsTotal += item.productPrice * item.quantity;
      currentGroup.itemsCount += item.quantity;
      currentGroup.hasRollingBag =
        currentGroup.hasRollingBag ||
        isRollingBagProduct(product || { name: item.productName });

      groups.set(availability, currentGroup);
    });

    return Array.from(groups.values())
      .sort((first, second) => {
        return (
          availabilityOptions.indexOf(first.availability) -
          availabilityOptions.indexOf(second.availability)
        );
      })
      .map((group) => ({
        ...group,
        deliveryFee: isFixedDeliveryArea(deliveryArea)
          ? getDeliveryFee(deliveryArea, group.hasRollingBag)
          : 0,
      }));
  }, [
    cart,
    selectedAvailabilityByProductId,
    cartAvailabilityOptions,
    cartProductsById,
    deliveryArea,
  ]);

  const deliveryFee = shipmentGroups.reduce((sum, group) => {
    return sum + group.deliveryFee;
  }, 0);
  const total = Math.max(subtotal - promoDiscount, 0) + deliveryFee;
  const selectedCartAvailabilityStatuses = cart.map(getSelectedAvailability);
  const selectedOrderAvailabilityStatus = getLongestAvailabilityStatus(
    selectedCartAvailabilityStatuses,
  );
  const paymentOptions = getPaymentOptions(selectedOrderAvailabilityStatus);
  const depositAmount = getDepositAmount(total, paymentMethod);
  const secondInstallmentAmount = getSecondInstallmentAmount(total, paymentMethod);
  const remainingAmount = getRemainingAmount(total, paymentMethod);
  const requiresOnlinePayment = needsOnlinePayment(paymentMethod);
  const amountToPayNow = depositAmount > 0 ? depositAmount : total;
  const savedPaymentMethod = buildOrderPaymentMethod(
    selectedOrderAvailabilityStatus,
    paymentMethod,
  );

  const fetchCartDeliveryInfo = useCallback(async () => {
    const productIds = cart.map((item) => item.productId);

    if (productIds.length === 0) {
      setHasRollingBag(false);
      setCartAvailabilityOptions({});
      setSelectedAvailabilityByProductId({});
      setCartProductsById({});
      return;
    }

    const { data } = await supabase
      .from("products")
      .select("id,name,product_type,availability_status")
      .in("id", productIds);

    const products = (data as ProductStock[]) || [];
    const productMap = products.reduce<Record<number, ProductStock>>(
      (currentMap, product) => {
        currentMap[product.id] = product;
        return currentMap;
      },
      {},
    );

    setCartProductsById(productMap);

    setHasRollingBag(
      cart.some((item) => {
        const product = productMap[item.productId];

        return isRollingBagProduct(product || { name: item.productName });
      })
    );

    const availabilityMap = products.reduce<Record<number, string[]>>(
      (currentMap, product) => {
        currentMap[product.id] = parseAvailabilityStatuses(
          product.availability_status,
        );
        return currentMap;
      },
      {},
    );

    setCartAvailabilityOptions(availabilityMap);
    setSelectedAvailabilityByProductId((currentSelections) => {
      const nextSelections: Record<number, string> = {};

      cart.forEach((item) => {
        const productOptions =
          availabilityMap[item.productId] || [availabilityOptions[0]];
        const currentSelection = currentSelections[item.productId];

        nextSelections[item.productId] = productOptions.includes(currentSelection)
          ? currentSelection
          : productOptions[0];
      });

      return nextSelections;
    });
  }, [cart]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchCartDeliveryInfo();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchCartDeliveryInfo]);

  useEffect(() => {
    let active = true;

    async function checkPaydunyaStatus() {
      try {
        const response = await fetch("/api/payments/paydunya/status");
        const data = (await response.json()) as { configured?: boolean };
        if (active) setPaydunyaReady(Boolean(data.configured));
      } catch {
        if (active) setPaydunyaReady(false);
      }
    }

    void checkPaydunyaStatus();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!promoCode) return;

    let active = true;

    async function validatePromoCode() {
      const promotion = await getActivePromoCode(promoCode);
      if (!active) return;

      if (!promotion) {
        setPromoCode("");
        setPromoPercentage(0);
        localStorage.removeItem("kidiclass_promo_code");
        setMessage("Le code promo enregistré n’est plus actif.");
        return;
      }

      setPromoCode(promotion.code);
      setPromoPercentage(promotion.percentage);
    }

    void validatePromoCode();

    return () => {
      active = false;
    };
  }, [promoCode]);

  useEffect(() => {
    if (!isFixedDeliveryArea(deliveryArea)) return;

    const nextOptions = getPaymentOptions(selectedOrderAvailabilityStatus);

    if (!nextOptions.includes(paymentMethod)) {
      const timeoutId = window.setTimeout(() => {
        setPaymentMethod(getDefaultPaymentOption(selectedOrderAvailabilityStatus));
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [deliveryArea, selectedOrderAvailabilityStatus, paymentMethod]);

  function generateOrderReference() {
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    return `KDC-${year}-${randomNumber}`;
  }

  function getLoyaltyPoints(amount: number) {
    return Math.floor(Number(amount || 0) / 1000);
  }

  function getCartSummary() {
    return cart
      .map((item) => {
        return `- ${item.productName} | Taille/pointure : ${
          item.selectedSize || "Non précisée"
        } | Délai : ${getSelectedAvailability(item)} | Quantité : ${item.quantity} | Prix : ${(
          item.productPrice * item.quantity
        ).toLocaleString("fr-FR")} FCFA`;
      })
      .join("\n");
  }

  function openWhatsappDirectly(reference: string) {
    const fullPhone = `${selectedCountryCode} ${customerPhone}`;

    const whatsappMessage = `
Bonjour KidiClass,

Je souhaite finaliser une commande avec expédition spéciale.

Référence : ${reference}

Client : ${customerName}
Téléphone : ${fullPhone}

Zone de livraison : ${deliveryArea}
Commune / Ville / Pays : ${customerCity}

Adresse manuelle : ${customerAddress}
Adresse détectée sur la carte : ${deliveryMapAddress || "Non renseignée"}
Coordonnées GPS : ${
      deliveryLatitude && deliveryLongitude
        ? `${deliveryLatitude}, ${deliveryLongitude}`
        : "Non renseignées"
    }
Lien carte : ${
      deliveryLatitude && deliveryLongitude
        ? `https://www.google.com/maps?q=${deliveryLatitude},${deliveryLongitude}`
        : "Non renseigné"
    }

Produits :
${getCartSummary()}

Sous-total produits : ${subtotal.toLocaleString("fr-FR")} FCFA
Remise : ${promoDiscount.toLocaleString("fr-FR")} FCFA
Total produits après remise : ${Math.max(subtotal - promoDiscount, 0).toLocaleString("fr-FR")} FCFA

Les frais de livraison sont à confirmer selon la destination.
Merci de me communiquer le montant total avec livraison.
`;

    const encodedMessage = encodeURIComponent(whatsappMessage);

    const whatsappAppUrl = `whatsapp://send?phone=${adminWhatsappNumber}&text=${encodedMessage}`;
    const whatsappWebUrl = `https://wa.me/${adminWhatsappNumber}?text=${encodedMessage}`;

    window.location.href = whatsappAppUrl;

    setTimeout(() => {
      window.location.href = whatsappWebUrl;
    }, 1000);
  }

  function isPackProduct(product: ProductStock) {
    return (
      product.category === "Packs scolaires" ||
      product.category === "PACK" ||
      Boolean(product.is_pack)
    );
  }

  async function checkStockBeforeOrder() {
    for (const item of cart) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id,name,stock,category,product_type,is_pack")
        .eq("id", item.productId)
        .single();

      if (error || !product) {
        return {
          valid: false,
          message: `Le produit "${item.productName}" n’est plus disponible.`,
        };
      }

      const typedProduct = product as ProductStock;
      const availableStock = Number(typedProduct.stock || 0);

      if (availableStock <= 0) {
        return {
          valid: false,
          message: `Le produit "${typedProduct.name}" est en rupture de stock.`,
        };
      }

      if (item.quantity > availableStock) {
        return {
          valid: false,
          message: `Quantité demandée indisponible pour "${typedProduct.name}".`,
        };
      }

      if (isPackProduct(typedProduct)) {
        const { data: packItems, error: packError } = await supabase
          .from("product_pack_items")
          .select("*")
          .eq("pack_product_id", typedProduct.id);

        if (packError) {
          return {
            valid: false,
            message:
              "Impossible de vérifier les composants du pack. Veuillez réessayer.",
          };
        }

        const typedPackItems = (packItems as PackItem[]) || [];

        for (const packItem of typedPackItems) {
          const componentStock = Number(packItem.component_stock || 0);
          const requiredQuantity = Number(packItem.required_quantity || 1);
          const neededQuantity = requiredQuantity * item.quantity;

          if (componentStock < neededQuantity) {
            return {
              valid: false,
              message: `Quantité demandée indisponible pour le pack "${typedProduct.name}".`,
            };
          }
        }
      }
    }

    return {
      valid: true,
      message: "",
    };
  }

  async function recalculatePackStock(packProductId: number) {
    const { data: packItems, error } = await supabase
      .from("product_pack_items")
      .select("*")
      .eq("pack_product_id", packProductId);

    if (error) {
      throw new Error(error.message);
    }

    const typedPackItems = (packItems as PackItem[]) || [];

    if (typedPackItems.length === 0) {
      await supabase
        .from("products")
        .update({ stock: 0 })
        .eq("id", packProductId);

      return;
    }

    const possiblePackQuantities = typedPackItems.map((item) => {
      const componentStock = Number(item.component_stock || 0);
      const requiredQuantity = Number(item.required_quantity || 1);

      if (componentStock <= 0 || requiredQuantity <= 0) return 0;

      return Math.floor(componentStock / requiredQuantity);
    });

    const newPackStock = Math.min(...possiblePackQuantities);

    await supabase
      .from("products")
      .update({ stock: newPackStock })
      .eq("id", packProductId);
  }

  async function reduceClassicProductStock(
    item: CartItem,
    product: ProductStock
  ) {
    const currentStock = Number(product.stock || 0);
    const newStock = Math.max(currentStock - item.quantity, 0);

    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", item.productId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async function reducePackStock(item: CartItem) {
    const { data: packItems, error } = await supabase
      .from("product_pack_items")
      .select("*")
      .eq("pack_product_id", item.productId);

    if (error) {
      throw new Error(error.message);
    }

    const typedPackItems = (packItems as PackItem[]) || [];

    for (const packItem of typedPackItems) {
      const currentComponentStock = Number(packItem.component_stock || 0);
      const requiredQuantity = Number(packItem.required_quantity || 1);
      const quantityToRemove = requiredQuantity * item.quantity;

      const newComponentStock = Math.max(
        currentComponentStock - quantityToRemove,
        0
      );

      const { error: updateError } = await supabase
        .from("product_pack_items")
        .update({ component_stock: newComponentStock })
        .eq("id", packItem.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }

    await recalculatePackStock(item.productId);
  }

  async function reduceStockAfterOrder() {
    for (const item of cart) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id,name,stock,category,is_pack")
        .eq("id", item.productId)
        .single();

      if (error || !product) {
        continue;
      }

      const typedProduct = product as ProductStock;

      if (isPackProduct(typedProduct)) {
        await reducePackStock(item);
      } else {
        await reduceClassicProductStock(item, typedProduct);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (cart.length === 0) {
      setMessage("Votre panier est vide.");
      setLoading(false);
      return;
    }

    if (!currentUserId) {
      setMessage(
        "Connectez-vous ou créez un compte client avant de valider votre commande.",
      );
      setLoading(false);
      return;
    }

    if (!customerName.trim()) {
      setMessage("Veuillez renseigner votre nom complet.");
      setLoading(false);
      return;
    }

    if (!customerPhone.trim()) {
      setMessage("Veuillez renseigner votre numéro de téléphone.");
      setLoading(false);
      return;
    }

    if (!customerCity.trim()) {
      setMessage("Veuillez renseigner la commune ou la ville de livraison.");
      setLoading(false);
      return;
    }

    if (!customerAddress.trim()) {
      setMessage("Veuillez renseigner l’adresse de livraison.");
      setLoading(false);
      return;
    }

    if (promoCode) {
      const promotion = await getActivePromoCode(promoCode);

      if (!promotion) {
        setPromoCode("");
        setPromoPercentage(0);
        localStorage.removeItem("kidiclass_promo_code");
        setMessage(
          "Ce code promo n’est plus actif. Le total a été recalculé.",
        );
        setLoading(false);
        return;
      }

      if (promotion.percentage !== promoPercentage) {
        setPromoPercentage(promotion.percentage);
        setMessage(
          "La remise de ce code promo a changé. Vérifiez le nouveau total avant de valider.",
        );
        setLoading(false);
        return;
      }
    }

    if (isFixedDeliveryArea(deliveryArea) && requiresOnlinePayment && !paydunyaReady) {
      setMessage(
        "Le paiement en ligne est en cours de configuration. Veuillez réessayer dans quelques instants.",
      );
      setLoading(false);
      return;
    }

    const stockCheck = await checkStockBeforeOrder();

    if (!stockCheck.valid) {
      setMessage(stockCheck.message);
      setLoading(false);
      return;
    }

    const reference = generateOrderReference();

    const loyaltyPoints = getLoyaltyPoints(total);

      const initialStatus = isFixedDeliveryArea(deliveryArea)
        ? requiresOnlinePayment
          ? "En attente de paiement"
          : "En attente"
        : "Expédition à confirmer";

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_reference: reference,
          user_id: currentUserId,
          customer_name: customerName,
          customer_phone: `${selectedCountryCode} ${customerPhone}`,
          customer_city: customerCity,
          customer_address: customerAddress,
          delivery_latitude: deliveryLatitude,
          delivery_longitude: deliveryLongitude,
          delivery_map_address: deliveryMapAddress,
          google_maps_link:
            deliveryLatitude && deliveryLongitude
              ? `https://www.google.com/maps?q=${deliveryLatitude},${deliveryLongitude}`
              : "",
          payment_method: isFixedDeliveryArea(deliveryArea)
            ? savedPaymentMethod
            : "À confirmer",
          delivery_area: deliveryArea,
          delivery_fee: deliveryFee,
          total_amount: total,
          loyalty_points_earned: loyaltyPoints,
          status: initialStatus,
        },
      ])
      .select()
      .single();

    if (orderError) {
      setMessage("Erreur commande : " + orderError.message);
      setLoading(false);
      return;
    }

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      selected_size: encodeOrderItemSelection(
        item.selectedSize,
        getSelectedAvailability(item),
      ),
      unit_price: item.productPrice,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      setMessage("Erreur articles commande : " + itemsError.message);
      setLoading(false);
      return;
    }

    if (isFixedDeliveryArea(deliveryArea) && requiresOnlinePayment) {
      const response = await fetch("/api/payments/paydunya/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderReference: reference,
          amount: amountToPayNow,
          totalAmount: total,
          paymentMethod: savedPaymentMethod,
          customerName,
          customerPhone: `${selectedCountryCode} ${customerPhone}`,
        }),
      });

      const paymentResult = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok || !paymentResult.checkoutUrl) {
        setMessage(
          paymentResult.error ||
            "La commande est enregistrée, mais le paiement en ligne n'a pas pu s'ouvrir.",
        );
        setLoading(false);
        return;
      }

      try {
        await reduceStockAfterOrder();
      } catch (error) {
        setMessage(
          error instanceof Error
            ? "Commande créée, mais erreur stock : " + error.message
            : "Commande créée, mais erreur lors de la mise à jour du stock."
        );
        setLoading(false);
        return;
      }

      localStorage.removeItem("kidiclass_cart");
      localStorage.removeItem("kidiclass_promo_code");
      window.dispatchEvent(new Event("kidiclass-cart-updated"));
      setCart([]);
      window.location.href = paymentResult.checkoutUrl;
      return;
    }

    try {
      await reduceStockAfterOrder();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? "Commande créée, mais erreur stock : " + error.message
          : "Commande créée, mais erreur lors de la mise à jour du stock."
      );
      setLoading(false);
      return;
    }

    localStorage.removeItem("kidiclass_cart");
    localStorage.removeItem("kidiclass_promo_code");
    window.dispatchEvent(new Event("kidiclass-cart-updated"));
    setCart([]);

    if (!isFixedDeliveryArea(deliveryArea)) {
      openWhatsappDirectly(reference);
      setLoading(false);
      return;
    }

    setOrderReference(reference);
    setMessage("Commande validée avec succès.");
    setLoading(false);
  }

  if (cart.length === 0 && !orderReference) {
    return (
      <main className="min-h-screen bg-white px-4 py-8 sm:px-6 sm:py-12">
        <section className="mx-auto max-w-3xl rounded-[2.5rem] bg-[#e9fbfc] p-6 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#1db7bd] shadow-sm sm:mb-6 sm:h-20 sm:w-20">
            <ShoppingCart size={32} strokeWidth={2.5} />
          </div>

          <h1 className="text-3xl font-black text-gray-950 sm:text-4xl">
            Votre panier est vide
          </h1>

          <p className="mt-3 text-sm text-gray-600 sm:mt-4 sm:text-base">
            Ajoutez des articles avant de finaliser votre commande.
          </p>

          <Link
            href="/catalogue"
            className="mt-6 inline-block rounded-full bg-[#f36f45] px-6 py-3.5 text-sm font-black text-white hover:bg-[#e85e33] sm:mt-7 sm:px-8 sm:py-4 sm:text-base"
          >
            Retour au catalogue
          </Link>
        </section>
      </main>
    );
  }

  if (orderReference) {
    return (
      <main className="min-h-screen bg-[#fffdf7] px-4 py-8 sm:px-6 sm:py-12">
        <section className="mx-auto max-w-3xl rounded-[2.5rem] border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600 sm:mb-6 sm:h-24 sm:w-24">
            <CheckCircle2 size={40} strokeWidth={2.5} />
          </div>

          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#1db7bd]">
            KidiClass
          </p>

          <h1 className="text-3xl font-black text-gray-950 sm:text-4xl">
            Commande confirmée
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600 sm:mt-4 sm:text-base">
            Merci pour votre commande. Le suivi de votre commande se fait avec le
            numéro de téléphone utilisé lors de l’achat.
          </p>

          <div className="mt-6 rounded-[2rem] bg-[#e9fbfc] p-4 sm:mt-7 sm:p-6">
            <p className="text-sm font-bold text-gray-600">
              Référence commande
            </p>

            <p className="mt-2 text-2xl font-black text-[#1db7bd] sm:text-3xl">
              {orderReference}
            </p>
          </div>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row">
            <Link
              href="/suivi"
              className="rounded-full bg-[#1db7bd] px-6 py-3.5 text-sm font-black text-white hover:bg-[#159ca1] sm:px-8 sm:py-4 sm:text-base"
            >
              Suivre ma commande
            </Link>

            <Link
              href="/catalogue"
              className="rounded-full border-2 border-[#f36f45] px-6 py-3.5 text-sm font-black text-[#f36f45] hover:bg-[#f36f45] hover:text-white sm:px-8 sm:py-4 sm:text-base"
            >
              Retour au catalogue
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#fffdf7] px-4 py-8 sm:px-6 sm:py-12">
        <section className="mx-auto max-w-3xl rounded-[2.5rem] border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9fbfc] text-[#1db7bd] shadow-sm sm:mb-6 sm:h-20 sm:w-20">
            <LogIn size={32} strokeWidth={2.5} />
          </div>

          <h1 className="text-3xl font-black text-gray-950 sm:text-4xl">
            Vérification du compte
          </h1>

          <p className="mt-3 text-sm font-bold leading-6 text-gray-500 sm:mt-4 sm:text-base sm:leading-7">
            Nous vérifions votre espace client avant d’ouvrir la commande.
          </p>
        </section>
      </main>
    );
  }

  if (!currentUserId) {
    const checkoutNext = encodeURIComponent("/commande");

    return (
      <main className="min-h-screen bg-[#fffdf7] px-4 py-8 sm:px-6 sm:py-12">
        <section className="mx-auto max-w-3xl rounded-[2.5rem] border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#e9fbfc] text-[#1db7bd] shadow-sm sm:mb-6 sm:h-24 sm:w-24">
            <LogIn size={40} strokeWidth={2.5} />
          </div>

          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#f36f45]">
            Espace client requis
          </p>

          <h1 className="text-3xl font-black text-gray-950 sm:text-4xl">
            Connectez-vous pour passer commande
          </h1>

          <p className="mt-3 text-sm font-bold leading-6 text-gray-500 sm:mt-4 sm:text-base sm:leading-7">
            Votre panier est conservé. Connectez-vous ou créez un compte pour
            finaliser la commande, suivre la livraison et cumuler vos points
            fidélité.
          </p>

          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
            <Link
              href={`/login?next=${checkoutNext}`}
              className="flex items-center justify-center gap-2 rounded-full bg-[#f36f45] px-6 py-3.5 text-sm font-black text-white hover:bg-[#e85e33] sm:py-4 sm:text-base"
            >
              <LogIn size={19} strokeWidth={2.6} />
              Se connecter
            </Link>

            <Link
              href={`/register?next=${checkoutNext}`}
              className="flex items-center justify-center gap-2 rounded-full border-2 border-[#1db7bd] px-6 py-3.5 text-sm font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white sm:py-4 sm:text-base"
            >
              <UserPlus size={19} strokeWidth={2.6} />
              Créer un compte
            </Link>
          </div>

          <Link
            href="/panier"
            className="mt-4 inline-flex min-h-11 items-center rounded-full px-4 text-sm font-black text-[#f36f45] hover:bg-[#fff1f5]"
          >
            Retour au panier
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <section className="border-b border-gray-100 bg-[#e9fbfc] px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#1db7bd]">
            Finalisation
          </p>

          <h1 className="text-3xl font-black leading-tight text-gray-950 sm:text-5xl">
            Finaliser la commande
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Renseignez vos informations de livraison pour valider votre commande
            KidiClass.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[2fr_0.9fr] lg:gap-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {message && (
            <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-500 sm:text-base">
              {message}
            </p>
          )}

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
            <div className="mb-4 sm:mb-6">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f36f45] sm:text-sm sm:tracking-[0.2em]">
                Étape 1
              </p>

              <h2 className="mt-1.5 text-xl font-black text-gray-950 sm:mt-2 sm:text-2xl">
                Informations client
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <input
                type="text"
                placeholder="Nom complet"
                className="w-full rounded-xl border-2 border-[#bfedf0] bg-white p-3.5 text-sm font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15 sm:rounded-[1.4rem] sm:p-4 sm:text-base"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[280px_1fr]">
                <KidiclassSelect
                  label="Indicatif"
                  value={countryCodeLabel}
                  options={countryCodeOptions}
                  onChange={setCountryCodeLabel}
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-700">
                    Numéro de téléphone
                  </span>

                  <input
                    type="tel"
                    placeholder="Numéro de téléphone"
                    className="w-full rounded-xl border-2 border-[#bfedf0] bg-white p-3.5 text-sm font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15 sm:rounded-[1.4rem] sm:p-4 sm:text-base"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
            <div className="mb-4 sm:mb-6">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f36f45] sm:text-sm sm:tracking-[0.2em]">
                Étape 2
              </p>

              <h2 className="mt-1.5 text-xl font-black text-gray-950 sm:mt-2 sm:text-2xl">
                Livraison
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <KidiclassSelect
                label="Zone de livraison"
                value={deliveryArea}
                options={deliveryAreas}
                onChange={(value) => {
                  setDeliveryArea(value);

                  if (value === "Abidjan") {
                    setCustomerCity("Cocody");
                    setPaymentMethod(
                      getDefaultPaymentOption(selectedOrderAvailabilityStatus)
                    );
                  } else if (isFixedDeliveryArea(value)) {
                    setCustomerCity(value);
                    setPaymentMethod(
                      getDefaultPaymentOption(selectedOrderAvailabilityStatus)
                    );
                  } else {
                    setCustomerCity("");
                    setPaymentMethod("À confirmer");
                  }
                }}
              />

              {deliveryArea === "Abidjan" ? (
                <KidiclassSelect
                  label="Commune d’Abidjan"
                  value={customerCity}
                  options={abidjanCommunes}
                  onChange={setCustomerCity}
                />
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-700">
                    {deliveryArea === "Étranger"
                      ? "Pays et ville de livraison"
                      : "Ville de livraison"}
                  </span>

                  <input
                    type="text"
                    placeholder={
                      deliveryArea === "Étranger"
                        ? "Pays et ville de livraison"
                        : "Ville de livraison"
                    }
                    className="w-full rounded-xl border-2 border-[#bfedf0] bg-white p-3.5 text-sm font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15 sm:rounded-[1.4rem] sm:p-4 sm:text-base"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    required
                  />
                </label>
              )}

              <textarea
                placeholder="Adresse manuelle : quartier, rue, repère, immeuble, boutique..."
                className="min-h-24 w-full rounded-xl border-2 border-[#bfedf0] bg-white p-3.5 text-sm font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15 sm:min-h-32 sm:rounded-[1.4rem] sm:p-4 sm:text-base"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                required
              />

              <div className="rounded-2xl bg-[#e9fbfc] p-3 text-xs font-bold leading-5 text-[#1db7bd] sm:p-4 sm:text-sm sm:leading-6">
                La carte est optionnelle, mais elle aide à localiser plus
                facilement le lieu de livraison.
              </div>

              <AddressMap
                latitude={deliveryLatitude}
                longitude={deliveryLongitude}
                mapAddress={deliveryMapAddress}
                onLocationChange={(data) => {
                  setDeliveryLatitude(data.latitude);
                  setDeliveryLongitude(data.longitude);
                  setDeliveryMapAddress(data.mapAddress);
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
            <div className="mb-4 sm:mb-6">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f36f45] sm:text-sm sm:tracking-[0.2em]">
                Étape 3
              </p>

              <h2 className="mt-1.5 text-xl font-black text-gray-950 sm:mt-2 sm:text-2xl">
                Paiement
              </h2>
            </div>

            {isFixedDeliveryArea(deliveryArea) ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-3 rounded-2xl border border-[#bfedf0] bg-white p-3 sm:p-4">
                  <p className="text-sm font-black text-gray-700">
                    Délai souhaité
                  </p>

                  {cart.map((item, index) => {
                    const productOptions =
                      cartAvailabilityOptions[item.productId] || [
                        availabilityOptions[0],
                      ];
                    const selectedAvailability =
                      selectedAvailabilityByProductId[item.productId] ||
                      productOptions[0];

                    return (
                      <div
                        key={`${item.productId}-${item.selectedSize}-${index}`}
                        className="grid gap-2 md:grid-cols-[1fr_280px] md:items-center"
                      >
                        <p className="line-clamp-2 text-sm font-black text-gray-950">
                          {item.productName}
                        </p>

                        {productOptions.length > 1 ? (
                          <KidiclassSelect
                            label="Choisir le délai"
                            value={selectedAvailability}
                            options={productOptions}
                            onChange={(value) =>
                              setSelectedAvailabilityByProductId(
                                (currentSelections) => ({
                                  ...currentSelections,
                                  [item.productId]: value,
                                }),
                              )
                            }
                          />
                        ) : (
                          <span className="rounded-2xl bg-[#e9fbfc] px-3 py-2.5 text-xs font-black text-[#087f83] sm:px-4 sm:py-3 sm:text-sm">
                            {selectedAvailability}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  <p className="rounded-2xl bg-[#fff9cf] p-3 text-xs font-black leading-5 text-[#9a7e00] sm:text-sm sm:leading-6">
                    Délai le plus long retenu pour le paiement :{" "}
                    {selectedOrderAvailabilityStatus}
                  </p>

                  {shipmentGroups.length > 1 && (
                    <div className="rounded-2xl border border-[#bfedf0] bg-[#f4fbfa] p-3 sm:p-4">
                      <p className="text-sm font-black text-gray-950">
                        Cette commande sera séparée en {shipmentGroups.length}{" "}
                        livraisons prévues.
                      </p>

                      <div className="mt-3 grid gap-2">
                        {shipmentGroups.map((group, index) => (
                          <div
                            key={group.availability}
                            className="rounded-2xl bg-white p-3 text-xs font-bold leading-5 text-gray-600 sm:text-sm sm:leading-6"
                          >
                            <p className="font-black text-[#087f83]">
                              Livraison {index + 1} : {group.availability}
                            </p>
                            <p>
                              {group.itemsCount} article(s) · Livraison :{" "}
                              {group.deliveryFee.toLocaleString("fr-FR")} FCFA
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <KidiclassSelect
                  label="Option de paiement"
                  value={paymentMethod}
                  options={paymentOptions}
                  onChange={setPaymentMethod}
                />

                <div className="space-y-3 rounded-2xl bg-[#e9fbfc] p-3 text-xs font-bold leading-5 text-[#1db7bd] sm:p-5 sm:text-sm sm:leading-6">
                  <p>
                    {selectedOrderAvailabilityStatus === availabilityOptions[2]
                      ? "Pour le délai 30-45 jours, vous pouvez régler en 2 fois ou en 3 fois."
                      : "Choisissez votre mode de paiement selon le délai retenu pour la commande."}
                  </p>

                  {selectedOrderAvailabilityStatus === availabilityOptions[1] && (
                    <p className="rounded-2xl bg-white p-3 text-[#f36f45] sm:p-4">
                      Pour une précommande, le paiement à la livraison est
                      désactivé. Vous pouvez régler en ligne en totalité ou
                      en partie.
                    </p>
                  )}

                  <p className="font-black text-gray-950">
                    {getPaymentInstruction(total, paymentMethod)}
                  </p>

                  {requiresOnlinePayment && (
                    <p>
                      Après validation, vous serez redirigé vers une page de paiement
                      payer en ligne de façon sécurisée. La commande sera mise à
                      jour automatiquement après confirmation du paiement.
                    </p>
                  )}

                  {requiresOnlinePayment && paydunyaReady === false && (
                    <p className="rounded-2xl bg-white p-3 text-[#f36f45] sm:p-4">
                      Le paiement en ligne n&apos;est pas encore activé par
                      l&apos;administrateur.
                    </p>
                  )}

                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-xs font-bold leading-5 text-orange-700 sm:p-5 sm:text-sm sm:leading-6">
                  Pour les livraisons hors zones fixes ou à l’étranger, les frais
                  de livraison sont calculés au cas par cas. Votre commande sera
                  enregistrée, puis vous serez redirigé vers WhatsApp pour
                  finaliser l’expédition.
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={
              loading || (requiresOnlinePayment && paydunyaReady !== true)
            }
            className="w-full rounded-full bg-[#f36f45] px-6 py-4 text-base font-black text-white shadow-sm hover:bg-[#e85e33] disabled:opacity-50 sm:px-8 sm:py-5 sm:text-lg"
          >
            {loading
              ? requiresOnlinePayment
                ? "Ouverture du paiement..."
                : "Validation..."
              : isFixedDeliveryArea(deliveryArea)
              ? requiresOnlinePayment
                ? "Payer en ligne"
                : "Valider la commande"
              : "Enregistrer et finaliser sur WhatsApp"}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6 lg:sticky lg:top-44">
          <h2 className="text-xl font-black text-gray-950 sm:text-2xl">
            Résumé commande
          </h2>

          <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
            {cart.map((item, index) => (
              <div
                key={`${item.productId}-${item.selectedSize}-${index}`}
                className="grid grid-cols-[58px_1fr] gap-3 border-b border-gray-100 pb-3 sm:grid-cols-[70px_1fr] sm:gap-4 sm:pb-4"
              >
                <div className="overflow-hidden rounded-xl bg-gray-100 sm:rounded-2xl">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-16 w-full object-cover object-top sm:h-20"
                    />
                  ) : (
                    <div className="h-16 bg-gray-100 sm:h-20" />
                  )}
                </div>

                <div>
                  <p className="line-clamp-2 text-sm font-black leading-tight text-gray-950 sm:text-base">
                    {item.productName}
                  </p>

                  {item.selectedSize && (
                    <p className="mt-1 text-xs font-bold text-gray-500">
                      Taille / pointure : {item.selectedSize}
                    </p>
                  )}

                  <p className="mt-1 text-xs font-bold text-gray-500">
                    Quantité : {item.quantity}
                  </p>

                  <p className="mt-1.5 text-sm font-black text-[#f36f45] sm:mt-2 sm:text-base">
                    {(item.productPrice * item.quantity).toLocaleString(
                      "fr-FR"
                    )}{" "}
                    FCFA
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2.5 text-sm sm:mt-5 sm:space-y-3 sm:text-base">
            <div className="flex justify-between gap-3 text-gray-700">
              <span>Sous-total</span>
              <span className="font-bold">
                {subtotal.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            {isFixedDeliveryArea(deliveryArea) ? (
              <div className="space-y-2 text-gray-700">
                {shipmentGroups.length > 1 && (
                  <p className="text-xs font-black uppercase tracking-wide text-[#1db7bd]">
                    Plusieurs livraisons prévues
                  </p>
                )}

                {shipmentGroups.map((group, index) => (
                  <div
                    key={group.availability}
                    className="flex justify-between gap-3"
                  >
                    <span>
                      {shipmentGroups.length > 1
                        ? `Livraison ${index + 1} · ${group.availability}`
                        : deliveryArea === "Abidjan" && hasRollingBag
                          ? "Livraison Abidjan avec sac à roulette"
                          : `Livraison ${deliveryArea}`}
                    </span>
                    <span className="font-bold">
                      {group.deliveryFee.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}

                {shipmentGroups.length > 1 && (
                  <div className="flex justify-between gap-3 border-t border-gray-100 pt-2 font-black text-gray-950">
                    <span>Total livraisons</span>
                    <span>{deliveryFee.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-orange-50 p-3 text-xs font-bold leading-5 text-orange-700 sm:p-4 sm:text-sm sm:leading-6">
                Livraison hors zones fixes : montant à confirmer sur WhatsApp.
              </div>
            )}

            <div className="rounded-2xl bg-[#e9fbfc] p-3 text-xs font-bold leading-5 text-[#1db7bd] sm:p-4 sm:text-sm sm:leading-6">
              Livraison Abidjan : 1 000 FCFA. Avec un sac à roulette : 2 000
              FCFA. Bingerville, Songon et Anyama : 2 000 FCFA. Bassam : 2 500
              FCFA. Si les articles ont des délais différents, chaque passage
              est calculé séparément.
            </div>

            {promoDiscount > 0 && (
              <div className="flex justify-between gap-3 text-green-700">
                <span>
                  Remise {promoCode} (-{promoPercentage}%)
                </span>
                <span className="font-bold">
                  -{promoDiscount.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            )}

            {isFixedDeliveryArea(deliveryArea) && (
              <div className="rounded-2xl bg-[#fff9cf] p-3 text-xs font-bold leading-5 text-[#c7a900] sm:p-4 sm:text-sm sm:leading-6">
                Option de paiement choisie : {savedPaymentMethod}
                {depositAmount > 0 && (
                  <>
                    <br />
                    À payer maintenant : {amountToPayNow.toLocaleString("fr-FR")} FCFA
                  </>
                )}
                {remainingAmount > 0 && depositAmount > 0 && (
                  <>
                    <br />
                    {secondInstallmentAmount > 0 && (
                      <>
                        Deuxième paiement :{" "}
                        {secondInstallmentAmount.toLocaleString("fr-FR")} FCFA
                        <br />
                      </>
                    )}
                    Solde restant : {remainingAmount.toLocaleString("fr-FR")} FCFA
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-gray-100 pt-4 sm:mt-6 sm:pt-5">
            <div className="flex justify-between gap-3 text-lg font-black text-gray-950 sm:gap-4 sm:text-2xl">
              <span>Total</span>

              <span className="text-right text-[#f36f45]">
                {isFixedDeliveryArea(deliveryArea)
                  ? `${total.toLocaleString("fr-FR")} FCFA`
                  : `${subtotal.toLocaleString(
                      "fr-FR"
                    )} FCFA + livraison à confirmer`}
              </span>
            </div>
          </div>

          <Link
            href="/panier"
            className="mt-4 block rounded-full border-2 border-[#1db7bd] px-6 py-3.5 text-center text-sm font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white sm:mt-5 sm:py-4 sm:text-base"
          >
            Modifier mon panier
          </Link>
        </aside>
      </section>
    </main>
  );
}
