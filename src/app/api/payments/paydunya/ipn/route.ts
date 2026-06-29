import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { markSecondInstallmentPaid } from "@/lib/paymentWorkflow";
import { getPaydunyaIpnUrl, verifyPaydunyaHash } from "@/lib/server/paydunya";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function setNestedValue(target: UnknownRecord, key: string, value: unknown) {
  const parts = Array.from(key.matchAll(/\[([^\]]+)\]/g)).map(
    (match) => match[1],
  );

  if (!key.startsWith("data[") || parts.length === 0) {
    target[key] = value;
    return;
  }

  let cursor = (target.data ||= {}) as UnknownRecord;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      cursor[part] = value;
      return;
    }

    cursor = (cursor[part] ||= {}) as UnknownRecord;
  });
}

async function readPayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return asRecord(await request.json());
  }

  const formData = await request.formData();
  const dataField = formData.get("data");
  if (typeof dataField === "string") {
    try {
      return asRecord(JSON.parse(dataField));
    } catch {
      return { data: dataField };
    }
  }

  const payload: UnknownRecord = {};
  formData.forEach((value, key) => {
    setNestedValue(payload, key, value);
  });

  return payload;
}

function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getNextOrderStatus(status: string) {
  if (status === "completed") return "Confirmée";
  if (status === "cancelled") return "Paiement annulé";
  if (status === "failed") return "Paiement échoué";
  return "En attente de paiement";
}

export async function GET() {
  return NextResponse.json({
    active: true,
    provider: "PayDunya",
    ipnUrl: getPaydunyaIpnUrl(),
  });
}

export async function POST(request: Request) {
  let payload: UnknownRecord;

  try {
    payload = await readPayload(request);
  } catch {
    return NextResponse.json({ error: "Payload PayDunya invalide." }, { status: 400 });
  }

  const data = Object.keys(asRecord(payload.data)).length > 0
    ? asRecord(payload.data)
    : payload;
  const customData = asRecord(data.custom_data);
  const hash = getString(data.hash || payload.hash);

  if (!verifyPaydunyaHash(hash)) {
    return NextResponse.json({ error: "Signature PayDunya invalide." }, { status: 401 });
  }

  const orderReference =
    getString(customData.order_reference) ||
    getString(customData.orderReference);
  const paymentKind = getString(customData.payment_kind);
  const status = getString(data.status).toLowerCase();

  if (!orderReference) {
    return NextResponse.json(
      { error: "Référence commande absente de la notification PayDunya." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Configuration Supabase serveur manquante." },
      { status: 500 },
    );
  }

  const updatePayload: Record<string, string> = {
    status: getNextOrderStatus(status),
  };

  if (status === "completed" && paymentKind === "second_installment") {
    const { data: order } = await supabase
      .from("orders")
      .select("payment_method")
      .eq("order_reference", orderReference)
      .maybeSingle();

    updatePayload.payment_method = markSecondInstallmentPaid(
      getString(asRecord(order).payment_method),
    );
  }

  const { error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("order_reference", orderReference);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
