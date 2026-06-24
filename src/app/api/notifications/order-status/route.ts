import { NextResponse } from "next/server";
import {
  normalizeSmsRecipient,
  sendBrevoSms,
  verifyAdminRequest,
} from "@/lib/server/notifications";

type StatusNotificationBody = {
  customerName?: string;
  customerPhone?: string;
  orderReference?: string;
  status?: string;
};

function buildStatusMessage({
  customerName,
  orderReference,
  status,
}: Required<Omit<StatusNotificationBody, "customerPhone">>) {
  const name = customerName || "cher client";
  const reference = orderReference || "votre commande";

  const details: Record<string, string> = {
    "En attente": "a bien été enregistrée et sera confirmée prochainement",
    Confirmée: "est confirmée",
    "En préparation": "est en cours de préparation",
    "Arrivée à Abidjan": "est arrivée à Abidjan",
    "En livraison": "est en cours de livraison",
    Expédiée: "a été expédiée",
    Livrée: "a été livrée",
    Annulée: "a été annulée",
    "En attente de paiement": "est en attente de paiement",
    "Expédition à confirmer": "attend la confirmation des frais d’expédition",
    "Frais de livraison à confirmer":
      "attend la confirmation des frais de livraison",
  };

  const update = details[status] || `a changé de statut : ${status}`;
  return `Bonjour ${name}, votre commande KidiClass ${reference} ${update}. Merci pour votre confiance. Contact : 0779311555.`;
}

export async function POST(request: Request) {
  const verification = await verifyAdminRequest(request);
  if (!verification.authorized) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.status },
    );
  }

  let body: StatusNotificationBody;
  try {
    body = (await request.json()) as StatusNotificationBody;
  } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const customerPhone = body.customerPhone?.trim() || "";
  const status = body.status?.trim() || "";
  if (!customerPhone || !status) {
    return NextResponse.json(
      { error: "Numéro de téléphone ou statut manquant." },
      { status: 400 },
    );
  }

  const recipient = normalizeSmsRecipient(customerPhone);
  if (!recipient) {
    return NextResponse.json(
      { error: "Numéro de téléphone invalide." },
      { status: 400 },
    );
  }

  const result = await sendBrevoSms(
    recipient,
    buildStatusMessage({
      customerName: body.customerName?.trim() || "cher client",
      orderReference: body.orderReference?.trim() || "votre commande",
      status,
    }),
  );

  if (!result.sent) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({ sent: true });
}
