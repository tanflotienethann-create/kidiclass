import {
  availabilityOptions,
  normalizeAvailabilityStatus,
} from "@/lib/productAvailability";

export const paymentDelivery = "Paiement à la livraison";
export const paymentOnlineFull = "Paiement Mobile Money intégral";
export const paymentOnlinePartial = "Paiement Mobile Money partiel";
export const paymentTwoTimes = "Paiement en 2 fois";
export const paymentThreeTimes = "Paiement en 3 fois";
export const secondInstallmentPaidMarker = "Deuxième paiement réglé";

export const standardPaymentOptions = [
  paymentDelivery,
  paymentOnlineFull,
  paymentOnlinePartial,
];

export const preorderPaymentOptions = [paymentOnlineFull, paymentOnlinePartial];
export const longPreorderPaymentOptions = [paymentTwoTimes, paymentThreeTimes];

export function isPreorderAvailability(availabilityStatus?: string | null) {
  const status = normalizeAvailabilityStatus(availabilityStatus);
  return status !== availabilityOptions[0];
}

export function getPaymentOptions(availabilityStatusOrHasPreorder: string | boolean) {
  if (typeof availabilityStatusOrHasPreorder === "boolean") {
    return availabilityStatusOrHasPreorder
      ? preorderPaymentOptions
      : standardPaymentOptions;
  }

  const availabilityStatus = normalizeAvailabilityStatus(
    availabilityStatusOrHasPreorder,
  );

  if (availabilityStatus === availabilityOptions[2]) {
    return longPreorderPaymentOptions;
  }

  if (availabilityStatus === availabilityOptions[1]) {
    return preorderPaymentOptions;
  }

  return standardPaymentOptions;
}

export function getDefaultPaymentOption(availabilityStatusOrHasPreorder: string | boolean) {
  return getPaymentOptions(availabilityStatusOrHasPreorder)[0];
}

function splitAmountInTwo(total: number) {
  return Math.ceil(Number(total || 0) / 2);
}

function splitAmountInThree(total: number) {
  return Math.ceil(Number(total || 0) / 3);
}

export function hasSecondInstallmentPaid(paymentMethod?: string | null) {
  return Boolean(paymentMethod?.includes(secondInstallmentPaidMarker));
}

export function getDepositAmount(total: number, paymentMethod?: string | null) {
  if (!paymentMethod) return 0;

  if (
    paymentMethod.includes(paymentOnlinePartial) ||
    paymentMethod.includes(paymentTwoTimes) ||
    paymentMethod.includes("acompte 50%") ||
    paymentMethod.includes("Paiement en deux fois")
  ) {
    return splitAmountInTwo(total);
  }

  if (paymentMethod.includes(paymentThreeTimes)) {
    return splitAmountInThree(total);
  }

  if (
    paymentMethod.includes(paymentOnlineFull) ||
    paymentMethod.includes("Paiement en ligne intégral") ||
    paymentMethod.includes("Paiement Mobile Money intégral")
  ) {
    return Number(total || 0);
  }

  return 0;
}

export function getSecondInstallmentAmount(total: number, paymentMethod?: string | null) {
  if (!paymentMethod?.includes(paymentThreeTimes)) return 0;

  return splitAmountInThree(total);
}

export function getPaidAmount(total: number, paymentMethod?: string | null) {
  const firstPayment = getDepositAmount(total, paymentMethod);
  const secondPayment = hasSecondInstallmentPaid(paymentMethod)
    ? getSecondInstallmentAmount(total, paymentMethod)
    : 0;

  return Math.min(Number(total || 0), firstPayment + secondPayment);
}

export function getRemainingAmount(total: number, paymentMethod?: string | null) {
  return Math.max(Number(total || 0) - getPaidAmount(total, paymentMethod), 0);
}

export function getNextOnlinePaymentAmount(total: number, paymentMethod?: string | null) {
  if (!paymentMethod) return 0;

  if (
    paymentMethod.includes(paymentThreeTimes) &&
    !hasSecondInstallmentPaid(paymentMethod)
  ) {
    return getSecondInstallmentAmount(total, paymentMethod);
  }

  if (
    paymentMethod.includes("solde en ligne avant livraison") ||
    paymentMethod.includes("solde avant livraison") ||
    paymentMethod.includes("Paiement en deux fois")
  ) {
    return getRemainingAmount(total, paymentMethod);
  }

  return 0;
}

export function needsOnlinePayment(paymentMethod?: string | null) {
  if (!paymentMethod) return false;
  if (paymentMethod.includes(paymentDelivery)) return false;
  if (paymentMethod.includes("À confirmer")) return false;

  return (
    paymentMethod.includes(paymentOnlineFull) ||
    paymentMethod.includes(paymentOnlinePartial) ||
    paymentMethod.includes(paymentTwoTimes) ||
    paymentMethod.includes(paymentThreeTimes) ||
    paymentMethod.includes("Précommande") ||
    paymentMethod.includes("Paiement en ligne") ||
    paymentMethod.includes("Paiement Mobile Money") ||
    paymentMethod.includes("Paiement en deux fois")
  );
}

export function needsAdminBalancePaymentLink(order: {
  payment_method?: string | null;
  status?: string | null;
  total_amount?: number | null;
}) {
  const nextOnlinePayment = getNextOnlinePaymentAmount(
    Number(order.total_amount || 0),
    order.payment_method,
  );

  if (nextOnlinePayment <= 0) return false;

  if (order.payment_method?.includes(paymentThreeTimes)) return true;

  return (
    order.status === "Arrivée à Abidjan" &&
    Boolean(
      order.payment_method?.includes("solde en ligne avant livraison") ||
        order.payment_method?.includes("solde avant livraison"),
    )
  );
}

export function buildOrderPaymentMethod(availabilityStatus: string, paymentMethod: string) {
  return `Délai choisi : ${normalizeAvailabilityStatus(
    availabilityStatus,
  )} | ${paymentMethod}`;
}

export function getChosenAvailabilityFromPaymentMethod(paymentMethod?: string | null) {
  const match = paymentMethod?.match(/Délai choisi\s*:\s*([^|]+)/i);
  if (!match?.[1]) return "";

  return normalizeAvailabilityStatus(match?.[1]?.trim());
}

export function markSecondInstallmentPaid(paymentMethod?: string | null) {
  const method = paymentMethod || "";
  if (!method.includes(paymentThreeTimes) || hasSecondInstallmentPaid(method)) {
    return method;
  }

  return `${method} | ${secondInstallmentPaidMarker}`;
}

export function getPaymentInstruction(total: number, paymentMethod?: string | null) {
  const firstPayment = getDepositAmount(total, paymentMethod);
  const secondPayment = getSecondInstallmentAmount(total, paymentMethod);
  const remaining = getRemainingAmount(total, paymentMethod);

  if (!paymentMethod) return "Paiement à confirmer.";

  if (paymentMethod.includes(paymentDelivery)) {
    return `Paiement total à la livraison : ${Number(total || 0).toLocaleString(
      "fr-FR",
    )} FCFA.`;
  }

  if (paymentMethod.includes(paymentOnlineFull)) {
    return `Total à régler en ligne de façon sécurisée : ${firstPayment.toLocaleString(
      "fr-FR",
    )} FCFA.`;
  }

  if (paymentMethod.includes(paymentOnlinePartial)) {
    return `Premier paiement en ligne : ${firstPayment.toLocaleString(
      "fr-FR",
    )} FCFA. Solde à payer à la livraison : ${remaining.toLocaleString(
      "fr-FR",
    )} FCFA.`;
  }

  if (paymentMethod.includes(paymentTwoTimes)) {
    return `Premier paiement en ligne : ${firstPayment.toLocaleString(
      "fr-FR",
    )} FCFA. Solde à payer à la livraison : ${remaining.toLocaleString(
      "fr-FR",
    )} FCFA.`;
  }

  if (paymentMethod.includes(paymentThreeTimes)) {
    const finalPayment = Math.max(
      Number(total || 0) - firstPayment - secondPayment,
      0,
    );

    return `Premier paiement en ligne : ${firstPayment.toLocaleString(
      "fr-FR",
    )} FCFA. Deuxième paiement à partir du 15e jour : ${secondPayment.toLocaleString(
      "fr-FR",
    )} FCFA. Dernier paiement à la livraison : ${finalPayment.toLocaleString(
      "fr-FR",
    )} FCFA.`;
  }

  if (
    paymentMethod.includes("solde en ligne avant livraison") ||
    paymentMethod.includes("solde avant livraison")
  ) {
    return `Acompte à régler : ${firstPayment.toLocaleString(
      "fr-FR",
    )} FCFA. Le solde de ${remaining.toLocaleString(
      "fr-FR",
    )} FCFA sera réglé en ligne avant la livraison.`;
  }

  return "Paiement à confirmer.";
}

export function getAdminWhatsappMessage(
  order: {
    order_reference?: string | null;
    customer_name?: string | null;
    payment_method?: string | null;
    total_amount?: number | null;
    status?: string | null;
  },
  paymentLink?: string,
) {
  const name = order.customer_name || "cher client";
  const reference = order.order_reference || "";
  const method = order.payment_method || "";
  const total = Number(order.total_amount || 0);
  const firstPayment = getDepositAmount(total, method);
  const secondPayment = getSecondInstallmentAmount(total, method);
  const paidAmount = getPaidAmount(total, method);
  const remaining = getRemainingAmount(total, method);
  const availability = getChosenAvailabilityFromPaymentMethod(method);
  const intro = `Bonjour ${name},\n\nNous vous contactons de la part de KidiClass concernant votre commande ${
    reference ? `n° ${reference}` : ""
  }.`;
  const delayLine = availability
    ? `\n\nDélai choisi : ${availability}.`
    : "";
  const outro = "\n\nMerci pour votre confiance.\nL’équipe KidiClass";

  if (method.includes(paymentThreeTimes) && paymentLink) {
    const finalPayment = Math.max(total - firstPayment - secondPayment, 0);

    return `${intro}${delayLine}\n\nPetit rappel pour votre commande : le deuxième paiement de ${secondPayment.toLocaleString(
      "fr-FR",
    )} FCFA peut être réglé à partir du 15e jour.\n\nLien de paiement sécurisé :\n${paymentLink}\n\nAprès ce paiement, il restera ${finalPayment.toLocaleString(
      "fr-FR",
    )} FCFA à régler à la livraison.${outro}`;
  }

  if (method.includes(paymentThreeTimes) && hasSecondInstallmentPaid(method)) {
    return `${intro}${delayLine}\n\nVotre deuxième paiement a bien été pris en compte. Vous avez déjà réglé ${paidAmount.toLocaleString(
      "fr-FR",
    )} FCFA.\n\nIl restera ${remaining.toLocaleString(
      "fr-FR",
    )} FCFA à régler au moment de la livraison.${outro}`;
  }

  if (method.includes(paymentOnlinePartial) || method.includes(paymentTwoTimes)) {
    return `${intro}${delayLine}\n\nVotre commande est bien confirmée. Vous avez déjà réglé ${paidAmount.toLocaleString(
      "fr-FR",
    )} FCFA en ligne.\n\nLe reste à payer à la livraison est de ${remaining.toLocaleString(
      "fr-FR",
    )} FCFA.${outro}`;
  }

  if (method.includes(paymentOnlineFull)) {
    return `${intro}${delayLine}\n\nVotre commande est bien confirmée et le paiement intégral de ${total.toLocaleString(
      "fr-FR",
    )} FCFA a été réglé en ligne.\n\nNous préparons la livraison selon le délai choisi.${outro}`;
  }

  if (method.includes(paymentDelivery)) {
    return `${intro}${delayLine}\n\nVotre commande est confirmée. Le montant total de ${total.toLocaleString(
      "fr-FR",
    )} FCFA sera à régler directement au moment de la livraison.${outro}`;
  }

  if (
    order.status === "Arrivée à Abidjan" &&
    (method.includes("solde en ligne avant livraison") ||
      method.includes("solde avant livraison"))
  ) {
    const linkLine = paymentLink
      ? `Voici votre lien de paiement sécurisé :\n${paymentLink}`
      : "Nous préparons votre lien de paiement sécurisé et vous le transmettons dans un instant.";

    return `${intro}\n\nBonne nouvelle : votre précommande est arrivée à Abidjan.\n\nLe solde restant à régler est de ${remaining.toLocaleString(
      "fr-FR",
    )} FCFA.\n\n${linkLine}\n\nUne fois le paiement confirmé, votre commande sera programmée pour une livraison le lendemain.${outro}`;
  }

  return `${intro}\n\nVotre commande est actuellement au statut : ${
    order.status || "En attente"
  }.\n\nNous reviendrons vers vous dès qu’une nouvelle étape sera disponible.${outro}`;
}
