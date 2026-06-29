import { NextResponse } from "next/server";
import { createPaydunyaInvoice } from "@/lib/server/paydunya";

type CreatePaymentBody = {
  orderReference?: string;
  amount?: number;
  totalAmount?: number;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
};

export async function POST(request: Request) {
  let body: CreatePaymentBody;

  try {
    body = (await request.json()) as CreatePaymentBody;
  } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const orderReference = body.orderReference?.trim() || "";
  const amount = Number(body.amount || 0);

  if (!orderReference || amount <= 0) {
    return NextResponse.json(
      { error: "Référence ou montant de paiement manquant." },
      { status: 400 },
    );
  }

  const result = await createPaydunyaInvoice({
    orderReference,
    amount,
    description: `Paiement commande KidiClass ${orderReference}`,
    customerName: body.customerName?.trim() || "",
    customerPhone: body.customerPhone?.trim() || "",
    customData: {
      payment_kind: "initial",
      payment_method: body.paymentMethod || "",
      total_amount: Number(body.totalAmount || 0),
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
