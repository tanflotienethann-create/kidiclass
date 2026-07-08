export const standardDeliveryFee = 1000;
export const rollingBagDeliveryFee = 2000;
export const nearbyDeliveryFee = 2000;
export const bassamDeliveryFee = 2500;

export const nearbyDeliveryAreas = ["Bingerville", "Songon", "Anyama", "Bassam"];

const deliveryAreaFees: Record<string, number> = {
  Bingerville: nearbyDeliveryFee,
  Songon: nearbyDeliveryFee,
  Anyama: nearbyDeliveryFee,
  Bassam: bassamDeliveryFee,
};

export function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function isRollingBagProduct(product?: {
  name?: string | null;
  product_type?: string | null;
}) {
  const text = normalizeText(`${product?.name || ""} ${product?.product_type || ""}`);

  return text.includes("sac a roulette") || text.includes("sac roulette");
}

export function isNearbyDeliveryArea(deliveryArea: string) {
  return nearbyDeliveryAreas.includes(deliveryArea);
}

export function isFixedDeliveryArea(deliveryArea: string) {
  return deliveryArea === "Abidjan" || isNearbyDeliveryArea(deliveryArea);
}

export function getDeliveryFee(deliveryArea: string, hasRollingBag: boolean) {
  if (isNearbyDeliveryArea(deliveryArea)) {
    return deliveryAreaFees[deliveryArea] || nearbyDeliveryFee;
  }

  if (deliveryArea === "Abidjan") {
    return hasRollingBag ? rollingBagDeliveryFee : standardDeliveryFee;
  }

  return 0;
}

export function getDeliveryLabel(deliveryArea: string, hasRollingBag: boolean) {
  const fee = getDeliveryFee(deliveryArea, hasRollingBag);

  if (fee <= 0) {
    return "Frais de livraison à confirmer";
  }

  return `${fee.toLocaleString("fr-FR")} FCFA`;
}
