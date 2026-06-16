export const preorderPaymentOptions = [
  "Précommande - acompte 50%, solde avant livraison",
  "Précommande - acompte 50%, solde à la livraison",
];

export const available24hPaymentOptions = [
  "Paiement à la livraison",
  "Paiement Mobile Money intégral",
  "Paiement en deux fois",
];

export function isPreorderAvailability(availabilityStatus?: string | null) {
  return availabilityStatus === "Disponible en précommande";
}

export function getPaymentOptions(hasPreorder: boolean) {
  return hasPreorder ? preorderPaymentOptions : available24hPaymentOptions;
}

export function getDefaultPaymentOption(hasPreorder: boolean) {
  return getPaymentOptions(hasPreorder)[0];
}

export function getDepositAmount(total: number, paymentMethod?: string | null) {
  if (!paymentMethod) return 0;

  if (
    paymentMethod.includes("acompte 50%") ||
    paymentMethod === "Paiement en deux fois"
  ) {
    return Math.ceil(Number(total || 0) / 2);
  }

  if (paymentMethod === "Paiement Mobile Money intégral") {
    return Number(total || 0);
  }

  return 0;
}

export function getRemainingAmount(total: number, paymentMethod?: string | null) {
  return Math.max(Number(total || 0) - getDepositAmount(total, paymentMethod), 0);
}

export function getPaymentInstruction(total: number, paymentMethod?: string | null) {
  const deposit = getDepositAmount(total, paymentMethod);
  const remaining = getRemainingAmount(total, paymentMethod);

  if (!paymentMethod) return "Paiement à confirmer.";

  if (paymentMethod.includes("solde avant livraison")) {
    return `Acompte à régler : ${deposit.toLocaleString(
      "fr-FR"
    )} FCFA. Solde avant livraison : ${remaining.toLocaleString("fr-FR")} FCFA.`;
  }

  if (paymentMethod.includes("solde à la livraison")) {
    return `Acompte à régler : ${deposit.toLocaleString(
      "fr-FR"
    )} FCFA. Solde à payer à la livraison : ${remaining.toLocaleString(
      "fr-FR"
    )} FCFA.`;
  }

  if (paymentMethod === "Paiement Mobile Money intégral") {
    return `Total à régler par Mobile Money : ${deposit.toLocaleString(
      "fr-FR"
    )} FCFA.`;
  }

  if (paymentMethod === "Paiement en deux fois") {
    return `Premier paiement pour réserver : ${deposit.toLocaleString(
      "fr-FR"
    )} FCFA. Deuxième paiement : ${remaining.toLocaleString("fr-FR")} FCFA.`;
  }

  return "Paiement total à la livraison.";
}

export function getAdminWhatsappMessage(order: {
  order_reference?: string | null;
  customer_name?: string | null;
  payment_method?: string | null;
  total_amount?: number | null;
  status?: string | null;
}) {
  const name = order.customer_name || "client";
  const reference = order.order_reference || "";
  const method = order.payment_method || "";
  const remaining = getRemainingAmount(Number(order.total_amount || 0), method);

  if (order.status === "Arrivée à Abidjan" && method.includes("solde avant livraison")) {
    return `Bonjour ${name}, votre commande KidiClass ${reference} est arrivée à Abidjan. Le solde restant est de ${remaining.toLocaleString(
      "fr-FR"
    )} FCFA. Cliquez sur ce lien pour effectuer votre paiement : `;
  }

  if (order.status === "Arrivée à Abidjan" && method.includes("solde à la livraison")) {
    return `Bonjour ${name}, votre commande KidiClass ${reference} est arrivée à Abidjan. Elle sera livrée demain. Vous pourrez payer le solde restant de ${remaining.toLocaleString(
      "fr-FR"
    )} FCFA au moment de la livraison.`;
  }

  if (method === "Paiement Mobile Money intégral") {
    return `Bonjour ${name}, pour finaliser votre commande KidiClass ${reference}, Cliquez sur ce lien pour effectuer votre paiement : `;
  }

  if (method === "Paiement en deux fois") {
    return `Bonjour ${name}, votre commande KidiClass ${reference} est réservée. Après le deuxième paiement de ${remaining.toLocaleString(
      "fr-FR"
    )} FCFA, votre commande sera livrée le lendemain. Cliquez sur ce lien pour effectuer votre paiement : `;
  }

  if (method === "Paiement à la livraison") {
    return `Bonjour ${name}, votre commande KidiClass ${reference} sera livrée sous 24h. Vous réglerez la totalité au moment de la livraison.`;
  }

  return `Bonjour ${name}, votre commande KidiClass ${reference} est actuellement au statut : ${
    order.status || "En attente"
  }.`;
}
