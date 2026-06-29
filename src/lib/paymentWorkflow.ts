export const preorderPaymentOptions = [
  "Précommande - acompte 50%, solde en ligne avant livraison",
  "Précommande - acompte 50%, solde à la livraison",
];

export const available24hPaymentOptions = [
  "Paiement à la livraison",
  "Paiement en ligne intégral",
  "Paiement en deux fois",
];

export function isPreorderAvailability(availabilityStatus?: string | null) {
  return availabilityStatus?.startsWith("Disponible en précommande") || false;
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
    paymentMethod.includes("Paiement en deux fois")
  ) {
    return Math.ceil(Number(total || 0) / 2);
  }

  if (
    paymentMethod.includes("Paiement en ligne intégral") ||
    paymentMethod.includes("Paiement Mobile Money intégral")
  ) {
    return Number(total || 0);
  }

  return 0;
}

export function getRemainingAmount(total: number, paymentMethod?: string | null) {
  return Math.max(Number(total || 0) - getDepositAmount(total, paymentMethod), 0);
}

export function needsOnlinePayment(paymentMethod?: string | null) {
  if (!paymentMethod) return false;
  if (paymentMethod.includes("Paiement à la livraison")) return false;
  if (paymentMethod.includes("À confirmer")) return false;
  return (
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
  const method = order.payment_method || "";
  const remaining = getRemainingAmount(Number(order.total_amount || 0), method);
  if (remaining <= 0) return false;

  return (
    (order.status === "Arrivée à Abidjan" &&
      method.includes("solde en ligne avant livraison")) ||
    method.includes("Paiement en deux fois")
  );
}

export function getPaymentInstruction(total: number, paymentMethod?: string | null) {
  const deposit = getDepositAmount(total, paymentMethod);
  const remaining = getRemainingAmount(total, paymentMethod);

  if (!paymentMethod) return "Paiement à confirmer.";

  if (
    paymentMethod.includes("solde en ligne avant livraison") ||
    paymentMethod.includes("solde avant livraison")
  ) {
    return `Acompte à régler : ${deposit.toLocaleString(
      "fr-FR"
    )} FCFA. Le solde de ${remaining.toLocaleString(
      "fr-FR"
    )} FCFA sera réglé en ligne avant la livraison.`;
  }

  if (paymentMethod.includes("solde à la livraison")) {
    return `Acompte à régler : ${deposit.toLocaleString(
      "fr-FR"
    )} FCFA. Solde à payer à la livraison : ${remaining.toLocaleString(
      "fr-FR"
    )} FCFA.`;
  }

  if (
    paymentMethod.includes("Paiement en ligne intégral") ||
    paymentMethod.includes("Paiement Mobile Money intégral")
  ) {
    return `Total à régler en ligne avec PayDunya : ${deposit.toLocaleString(
      "fr-FR"
    )} FCFA.`;
  }

  if (paymentMethod.includes("Paiement en deux fois")) {
    return `Premier paiement en ligne pour réserver : ${deposit.toLocaleString(
      "fr-FR"
    )} FCFA. Deuxième paiement en ligne : ${remaining.toLocaleString(
      "fr-FR"
    )} FCFA.`;
  }

  return "Paiement total à la livraison.";
}

export function getAdminWhatsappMessage(order: {
  order_reference?: string | null;
  customer_name?: string | null;
  payment_method?: string | null;
  total_amount?: number | null;
  status?: string | null;
}, paymentLink?: string) {
  const name = order.customer_name || "cher client";
  const reference = order.order_reference || "";
  const method = order.payment_method || "";
  const total = Number(order.total_amount || 0);
  const remaining = getRemainingAmount(Number(order.total_amount || 0), method);
  const intro = `Bonjour ${name},\n\nNous vous contactons de la part de KidiClass concernant votre commande ${
    reference ? `n° ${reference}` : ""
  }.`;
  const outro =
    "\n\nMerci pour votre confiance.\nL’équipe KidiClass";

  if (
    order.status === "Arrivée à Abidjan" &&
    (method.includes("solde en ligne avant livraison") ||
      method.includes("solde avant livraison"))
  ) {
    const linkLine = paymentLink
      ? `Voici votre lien de paiement sécurisé PayDunya :\n${paymentLink}`
      : "Nous préparons votre lien de paiement sécurisé PayDunya et vous le transmettons dans un instant.";

    return `${intro}\n\nBonne nouvelle : votre précommande est arrivée à Abidjan.\n\nLe solde restant à régler est de ${remaining.toLocaleString(
      "fr-FR"
    )} FCFA.\n\n${linkLine}\n\nUne fois le paiement confirmé, votre commande sera programmée pour une livraison le lendemain.${outro}`;
  }

  if (order.status === "Arrivée à Abidjan" && method.includes("solde à la livraison")) {
    return `${intro}\n\nBonne nouvelle : votre précommande est arrivée à Abidjan.\n\nVotre livraison sera programmée pour demain. Vous pourrez régler le solde restant de ${remaining.toLocaleString(
      "fr-FR"
    )} FCFA directement au moment de la livraison.${outro}`;
  }

  if (
    method.includes("Paiement en ligne intégral") ||
    method.includes("Paiement Mobile Money intégral")
  ) {
    return `${intro}\n\nVotre commande est prête à être confirmée. Le montant total à régler est de ${total.toLocaleString(
      "fr-FR"
    )} FCFA via PayDunya.\n\nAprès confirmation du paiement en ligne, votre commande sera livrée sous 24h.${outro}`;
  }

  if (method.includes("Paiement en deux fois")) {
    const linkLine = paymentLink
      ? `Voici votre lien de paiement sécurisé PayDunya pour régler le solde :\n${paymentLink}`
      : "Nous préparons votre lien de paiement sécurisé PayDunya pour le solde et vous le transmettons dans un instant.";

    return `${intro}\n\nVotre commande a bien été réservée avec un premier paiement. Le solde restant est de ${remaining.toLocaleString(
      "fr-FR"
    )} FCFA.\n\n${linkLine}\n\nAprès confirmation du deuxième paiement, votre commande sera livrée le lendemain.${outro}`;
  }

  if (method.includes("Paiement à la livraison")) {
    return `${intro}\n\nVotre commande est confirmée et sera livrée sous 24h.\n\nLe montant total de ${total.toLocaleString(
      "fr-FR"
    )} FCFA sera à régler directement au moment de la livraison.${outro}`;
  }

  return `${intro}\n\nVotre commande est actuellement au statut : ${
    order.status || "En attente"
  }.\n\nNous reviendrons vers vous dès qu’une nouvelle étape sera disponible.${outro}`;
}
