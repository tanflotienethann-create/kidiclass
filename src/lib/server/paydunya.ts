import "server-only";

import { createHash } from "crypto";
import { SITE_URL } from "@/lib/site";

type PaydunyaCustomData = Record<string, string | number | boolean | null>;

export type PaydunyaInvoiceRequest = {
  orderReference: string;
  amount: number;
  description: string;
  customerName?: string;
  customerPhone?: string;
  customData?: PaydunyaCustomData;
};

type PaydunyaCreateResponse = {
  response_code?: string;
  response_text?: string;
  description?: string;
  token?: string;
};

function getPaydunyaConfig() {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
  const token = process.env.PAYDUNYA_TOKEN;
  const mode = (process.env.PAYDUNYA_MODE || "sandbox").toLowerCase();

  if (!masterKey || !privateKey || !token) {
    return {
      configured: false as const,
      error:
        "PayDunya n'est pas encore configuré. Ajoutez PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY et PAYDUNYA_TOKEN dans Vercel.",
    };
  }

  return {
    configured: true as const,
    masterKey,
    privateKey,
    token,
    baseUrl:
      mode === "live"
        ? "https://app.paydunya.com/api/v1"
        : "https://app.paydunya.com/sandbox-api/v1",
  };
}

export function getPaydunyaIpnUrl() {
  return `${SITE_URL}/api/payments/paydunya/ipn`;
}

export function verifyPaydunyaHash(hash?: string | null) {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  if (!masterKey || !hash) return false;

  const expectedHash = createHash("sha512").update(masterKey).digest("hex");
  return hash.toLowerCase() === expectedHash.toLowerCase();
}

export async function createPaydunyaInvoice({
  orderReference,
  amount,
  description,
  customerName,
  customerPhone,
  customData,
}: PaydunyaInvoiceRequest) {
  const config = getPaydunyaConfig();
  if (!config.configured) {
    return { ok: false as const, error: config.error };
  }

  const cleanAmount = Math.max(Math.round(Number(amount || 0)), 0);
  if (cleanAmount <= 0) {
    return {
      ok: false as const,
      error: "Le montant du paiement PayDunya est invalide.",
    };
  }

  const paymentDescription =
    description || `Commande KidiClass ${orderReference}`;

  const payload = {
    invoice: {
      total_amount: cleanAmount,
      description: paymentDescription,
      customer: {
        name: customerName || "",
        phone: customerPhone || "",
      },
    },
    store: {
      name: "KidiClass",
      tagline: "Les enfants sapés comme jamais",
      phone: "0779311555",
      postal_address: "Abidjan",
      website_url: SITE_URL,
      logo_url: `${SITE_URL}/logo-kidiclass.png`,
    },
    actions: {
      cancel_url: `${SITE_URL}/paiement/retour?status=cancelled&reference=${encodeURIComponent(
        orderReference,
      )}`,
      return_url: `${SITE_URL}/paiement/retour?status=success&reference=${encodeURIComponent(
        orderReference,
      )}`,
      callback_url: getPaydunyaIpnUrl(),
    },
    custom_data: {
      order_reference: orderReference,
      customer_name: customerName || "",
      customer_phone: customerPhone || "",
      ...customData,
    },
  };

  const response = await fetch(`${config.baseUrl}/checkout-invoice/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "PAYDUNYA-MASTER-KEY": config.masterKey,
      "PAYDUNYA-PRIVATE-KEY": config.privateKey,
      "PAYDUNYA-TOKEN": config.token,
    },
    body: JSON.stringify(payload),
  });

  let data: PaydunyaCreateResponse = {};
  try {
    data = (await response.json()) as PaydunyaCreateResponse;
  } catch {
    data = {};
  }

  if (!response.ok || data.response_code !== "00" || !data.response_text) {
    return {
      ok: false as const,
      error:
        data.description ||
        data.response_text ||
        "PayDunya n'a pas pu créer le lien de paiement.",
    };
  }

  return {
    ok: true as const,
    checkoutUrl: data.response_text,
    token: data.token || "",
  };
}
