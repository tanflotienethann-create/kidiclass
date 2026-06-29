import { NextResponse } from "next/server";
import { getNextOnlinePaymentAmount } from "@/lib/paymentWorkflow";
import { createPaydunyaInvoice } from "@/lib/server/paydunya";
import { verifyAdminRequest } from "@/lib/server/notifications";

type BalanceLinkBody = {
  orderId?: number;
};

type OrderForPayment = {
  id: number;
  order_reference: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  payment_method: string | null;
  total_amount: number | null;
};

export async function POST(request: Request) {
  const verification = await verifyAdminRequest(request);
  if (!verification.authorized) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.status },
    );
  }

  let body: BalanceLinkBody;
  try {
    body = (await request.json()) as BalanceLinkBody;
  } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  if (!body.orderId) {
    return NextResponse.json({ error: "Commande manquante." }, { status: 400 });
  }

  const { data, error } = await verification.supabase
    .from("orders")
    .select("id,order_reference,customer_name,customer_phone,payment_method,total_amount")
    .eq("id", body.orderId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Commande introuvable." },
      { status: 404 },
    );
  }

  const order = data as OrderForPayment;
  const nextPaymentAmount = getNextOnlinePaymentAmount(
    Number(order.total_amount || 0),
    order.payment_method,
  );

  if (nextPaymentAmount <= 0) {
    return NextResponse.json(
      { error: "Cette commande n'a pas de paiement en ligne à relancer." },
      { status: 400 },
    );
  }

  const orderReference = order.order_reference || `KDC-${order.id}`;
  const result = await createPaydunyaInvoice({
    orderReference,
    amount: nextPaymentAmount,
    description: `Paiement complémentaire commande KidiClass ${orderReference}`,
    customerName: order.customer_name || "",
    customerPhone: order.customer_phone || "",
    customData: {
      payment_kind: "second_installment",
      payment_method: order.payment_method || "",
      total_amount: Number(order.total_amount || 0),
    },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({
    checkoutUrl: result.checkoutUrl,
    token: result.token,
  });
}
