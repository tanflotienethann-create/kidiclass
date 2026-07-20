import { NextResponse } from "next/server";
import {
  getSupabaseServiceClient,
  sendAdminPushNotification,
} from "@/lib/server/pushNotifications";

export const runtime = "nodejs";

type OrderCreatedBody = {
  orderReference?: string;
};

type OrderNotification = {
  id: number;
  order_reference: string | null;
  customer_name: string | null;
  total_amount: number | null;
};

type StockNotificationProduct = {
  id: number;
  name: string;
};

export async function POST(request: Request) {
  let body: OrderCreatedBody;

  try {
    body = (await request.json()) as OrderCreatedBody;
  } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const orderReference = body.orderReference?.trim() || "";

  if (!orderReference) {
    return NextResponse.json(
      { error: "Référence commande manquante." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Configuration Supabase serveur manquante." },
      { status: 500 },
    );
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,order_reference,customer_name,total_amount")
    .eq("order_reference", orderReference)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  if (!order) {
    return NextResponse.json(
      { error: "Commande introuvable." },
      { status: 404 },
    );
  }

  const typedOrder = order as OrderNotification;
  const totalAmount = Number(typedOrder.total_amount || 0).toLocaleString(
    "fr-FR",
  );

  const orderPush = await sendAdminPushNotification({
    title: "Nouvelle commande KidiClass",
    body: `${typedOrder.customer_name || "Client"} - ${totalAmount} FCFA`,
    url: "/admin/commandes",
    tag: `kidiclass-order-${typedOrder.id}`,
  });

  const { data: outOfStockProducts } = await supabase
    .from("products")
    .select("id,name")
    .or("is_archived.is.false,is_archived.is.null")
    .lte("stock", 0)
    .order("id", { ascending: false })
    .limit(3);

  const typedProducts =
    ((outOfStockProducts || []) as StockNotificationProduct[]).filter(Boolean);

  let stockPush = null;

  if (typedProducts.length > 0) {
    stockPush = await sendAdminPushNotification({
      title: "Rupture de stock KidiClass",
      body:
        typedProducts.length === 1
          ? typedProducts[0].name
          : `${typedProducts.length} produits sont en rupture`,
      url: "/admin/produits",
      tag: "kidiclass-stock-alert",
    });
  }

  return NextResponse.json({
    notified: true,
    orderPush,
    stockPush,
  });
}
