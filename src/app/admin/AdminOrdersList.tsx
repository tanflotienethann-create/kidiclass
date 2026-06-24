"use client";

import KidiclassSelect from "@/components/KidiclassSelect";
import {
  getAdminWhatsappMessage,
  getDepositAmount,
  getRemainingAmount,
} from "@/lib/paymentWorkflow";
import { supabase } from "@/lib/supabase";
import {
  Banknote,
  Clock3,
  MapPin,
  MessageCircle,
  Navigation,
  PackageCheck,
  Phone,
  ReceiptText,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  id: number;
  quantity: number;
  selected_size: string | null;
  unit_price: number;
  products: {
    name: string;
    image_url: string | null;
  } | null;
};

type Order = {
  id: number;
  order_reference: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_city: string | null;
  customer_address: string | null;
  payment_method: string | null;
  status: string | null;
  total_amount: number | null;
  delivery_area: string | null;
  delivery_fee: number | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_map_address: string | null;
  google_maps_link: string | null;
  delivered_at: string | null;
  created_at: string;
  order_items: OrderItem[];
};

const statusOptions = [
  "En attente",
  "Confirmée",
  "En préparation",
  "Arrivée à Abidjan",
  "En livraison",
  "Expédition à confirmer",
  "Frais de livraison à confirmer",
  "En attente de paiement",
  "Expédiée",
  "Livrée",
  "Annulée",
];

export default function AdminOrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const activeOrders = useMemo(() => {
    return orders
      .filter((order) => order.status !== "Livrée")
      .sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  }, [orders]);

  async function fetchOrders() {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          quantity,
          selected_size,
          unit_price,
          products (
            name,
            image_url
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Erreur chargement commandes : " + error.message);
      setLoading(false);
      return;
    }

    setOrders((data as Order[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchOrders();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function updateOrderStatus(orderId: number, newStatus: string) {
    setMessage("");
    const selectedOrder = orders.find((order) => order.id === orderId);

    const deliveredAt =
      newStatus === "Livrée" ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        delivered_at: deliveredAt,
      })
      .eq("id", orderId);

    if (error) {
      setMessage("Erreur modification statut : " + error.message);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== orderId) return order;

        return {
          ...order,
          status: newStatus,
          delivered_at: deliveredAt,
        };
      })
    );

    let smsMessage = "";

    if (selectedOrder?.customer_phone) {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (accessToken) {
        try {
          const response = await fetch("/api/notifications/order-status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              customerName: selectedOrder.customer_name,
              customerPhone: selectedOrder.customer_phone,
              orderReference: selectedOrder.order_reference,
              status: newStatus,
            }),
          });
          const result = (await response.json()) as { error?: string };
          smsMessage = response.ok
            ? " SMS envoyé au client."
            : ` ${result.error || "Le SMS n’a pas pu être envoyé."}`;
        } catch {
          smsMessage = " Le service SMS est momentanément indisponible.";
        }
      } else {
        smsMessage = " SMS non envoyé : session administrateur introuvable.";
      }
    } else {
      smsMessage = " SMS non envoyé : numéro du client manquant.";
    }

    setMessage(
      `${
        newStatus === "Livrée"
          ? "Commande déplacée dans l’historique."
          : "Statut de la commande mis à jour."
      }${smsMessage}`,
    );
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusStyle(status: string | null) {
    if (status === "Annulée") return "bg-red-50 text-red-500";
    if (status === "Livrée") return "bg-green-50 text-green-600";

    if (status === "En livraison" || status === "Expédiée") {
      return "bg-[#e9fbfc] text-[#1db7bd]";
    }

    if (
      status === "En préparation" ||
      status === "Arrivée à Abidjan" ||
      status === "Frais de livraison à confirmer" ||
      status === "En attente de paiement"
    ) {
      return "bg-[#fff9cf] text-[#c7a900]";
    }

    if (status === "Confirmée" || status === "Expédition à confirmer") {
      return "bg-orange-50 text-orange-600";
    }

    return "bg-gray-100 text-gray-600";
  }

  function cleanPhoneNumber(phone: string | null) {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  }

  function getWhatsappLink(order: Order) {
    const cleanedPhone = cleanPhoneNumber(order.customer_phone);
    if (!cleanedPhone) return "";

    const text = encodeURIComponent(getAdminWhatsappMessage(order));

    return `https://wa.me/${cleanedPhone}?text=${text}`;
  }

  function getGoogleMapsLink(order: Order) {
    if (order.google_maps_link) return order.google_maps_link;

    if (order.delivery_latitude && order.delivery_longitude) {
      return `https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`;
    }

    const addressParts = [
      order.customer_address,
      order.delivery_map_address,
      order.customer_city,
      order.delivery_area,
    ].filter(Boolean);

    if (addressParts.length === 0) return "";

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      addressParts.join(", ")
    )}`;
  }

  function printReceipt(order: Order) {
    setMessage("");
    const totalAmount = Number(order.total_amount || 0);
    const itemsTotal = totalAmount - Number(order.delivery_fee || 0);
    const deposit = getDepositAmount(totalAmount, order.payment_method);
    const remaining = getRemainingAmount(totalAmount, order.payment_method);
    const amountToPayNow = deposit > 0 ? deposit : totalAmount;
    const receiptItems = (order.order_items || [])
      .map((item) => {
        const image = item.products?.image_url
          ? `<img src="${item.products.image_url}" alt="" />`
          : `<div class="placeholder"></div>`;

        return `<div class="item">
          <div class="item-image">${image}</div>
          <div class="item-name">${item.products?.name || "Produit"}</div>
          <div class="item-price">${Number(item.unit_price * item.quantity).toLocaleString(
            "fr-FR"
          )}F</div>
        </div>`;
      })
      .join("");

    const printFrame = document.createElement("iframe");
    printFrame.setAttribute("aria-hidden", "true");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    printFrame.style.opacity = "0";
    document.body.appendChild(printFrame);

    const receiptWindow = printFrame.contentWindow;
    const receiptDocument = printFrame.contentDocument;
    if (!receiptWindow || !receiptDocument) {
      printFrame.remove();
      setMessage("Impossible de préparer le reçu pour l’impression.");
      return;
    }

    const logoUrl = `${window.location.origin}/logo-kidiclass.png`;

    receiptDocument.open();
    receiptDocument.write(`<!doctype html>
      <html>
        <head>
          <base href="${window.location.origin}/" />
          <title>Reçu ${order.order_reference || ""}</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            * { box-sizing: border-box; }
            html, body { margin: 0; min-height: 100%; background: white; font-family: Arial, sans-serif; color: #17324d; }
            body { padding: 0; }
            .receipt { width: 146mm; height: 208mm; margin: 0 auto; background: white; border: 2px solid #0f8f8d; border-radius: 12px; padding: 5mm; overflow: hidden; display: flex; flex-direction: column; }
            .logo-frame { position: relative; height: 30mm; overflow: hidden; flex-shrink: 0; }
            .logo { position: absolute; left: 50%; top: 50%; display: block; width: 105mm; max-width: none; height: auto; transform: translate(-50%, -47%); }
            .logo-fallback { display: none; height: 30mm; align-items: center; justify-content: center; color: #0f8f8d; font-size: 28px; font-weight: 900; }
            .phone { display: flex; align-items: center; justify-content: center; gap: 6px; color: #0f8f8d; font-size: 16px; font-weight: 900; border-top: 2px dotted #b8e3e1; border-bottom: 2px dotted #b8e3e1; padding: 1.5mm 0; }
            .info { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin: 3mm 0; }
            .box { border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.12); padding: 3mm; min-height: 19mm; }
            .label { font-size: 8px; font-weight: 900; color: #17324d; text-transform: uppercase; }
            .value { margin-top: 1.2mm; font-size: 14px; font-weight: 900; color: #0f8f8d; line-height: 1.12; word-break: break-word; }
            .zone .value { color: #ff6b00; }
            .section-title { margin-top: 2mm; background: #0f9f9b; color: white; padding: 2mm 4mm; border-radius: 10px 10px 0 0; font-size: 13px; font-weight: 900; }
            .items { border: 1px solid #d8eeed; border-radius: 0 0 10px 10px; overflow: hidden; flex-shrink: 0; }
            .header, .item { display: grid; grid-template-columns: 15mm 1fr 24mm; gap: 3mm; align-items: center; padding: 2mm 4mm; }
            .header { color: #0f8f8d; font-size: 8px; font-weight: 900; border-bottom: 1px solid #d8eeed; text-transform: uppercase; }
            .item { border-bottom: 1px dotted #b8e3e1; min-height: 15mm; }
            .item:last-child { border-bottom: 0; }
            .item img, .placeholder { width: 12mm; height: 13mm; object-fit: cover; border-radius: 6px; background: #edf4f4; }
            .item-name { font-size: 12px; font-weight: 900; line-height: 1.15; }
            .item-price { text-align: right; color: #0f8f8d; font-size: 12px; font-weight: 900; white-space: nowrap; }
            .totals { margin-top: 3mm; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.12); padding: 3mm; flex-shrink: 0; }
            .line { display: flex; justify-content: space-between; gap: 8px; padding: 1.45mm 0; border-bottom: 1px solid #b8e3e1; font-size: 10px; font-weight: 800; }
            .line:last-child { border-bottom: 0; }
            .line strong { text-align: right; max-width: 72mm; }
            .line.payment strong { font-size: 8.5px; line-height: 1.15; }
            .pay { display: flex; align-items: center; justify-content: space-between; gap: 4mm; margin-top: 2.5mm; color: #ff6b00; font-size: 16px; font-weight: 900; }
            .amount { background: #ff6b00; color: white; border-radius: 8px; padding: 2mm 4mm; font-size: 22px; white-space: nowrap; }
            .note { margin-top: 3mm; border: 1.5px solid #7ac8c8; border-radius: 10px; padding: 3mm; text-align: center; color: #0f8f8d; font-size: 12px; font-weight: 900; flex-shrink: 0; }
            .thanks { color: #ff6b00; font-size: 17px; margin-top: 2mm; }
            @media print {
              html, body { width: auto; height: auto; min-height: 0; background: white; padding: 0; }
              .receipt { width: 146mm; height: 208mm; margin: 1mm auto; border-radius: 0; box-shadow: none; page-break-after: avoid; page-break-inside: avoid; break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="logo-frame">
              <img class="logo" src="${logoUrl}" alt="KidiClass" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div class="logo-fallback">KidiClass</div>
            </div>
            <div class="phone">☎ 0779311555</div>
            <div class="info">
              <div class="box">
                <div class="label">Client</div>
                <div class="value">${order.customer_name || ""}</div>
                <div class="label" style="margin-top:8px">Téléphone</div>
                <div class="value">${order.customer_phone || ""}</div>
              </div>
              <div class="box zone">
                <div class="label">Zone / Quartier</div>
                <div class="value">${order.customer_city || order.delivery_area || ""}</div>
              </div>
            </div>
            <div class="section-title">Détail de la commande</div>
            <div class="items">
              <div class="header"><div>Article</div><div></div><div>Prix</div></div>
              ${receiptItems}
            </div>
            <div class="totals">
              <div class="line"><span>Sous-total articles</span><strong>${itemsTotal.toLocaleString("fr-FR")}F</strong></div>
              <div class="line"><span>Livraison</span><strong>${Number(order.delivery_fee || 0).toLocaleString("fr-FR")}F</strong></div>
              <div class="line payment"><span>Option paiement</span><strong>${order.payment_method || ""}</strong></div>
              ${
                deposit > 0
                  ? `<div class="line"><span>Payé / à payer maintenant</span><strong>${deposit.toLocaleString("fr-FR")}F</strong></div>
                     <div class="line"><span>Solde restant</span><strong>${remaining.toLocaleString("fr-FR")}F</strong></div>`
                  : ""
              }
              <div class="pay"><span>A PAYER</span><span class="amount">${amountToPayNow.toLocaleString("fr-FR")}F</span></div>
            </div>
            <div class="note">
              Vérifiez SVP votre colis avant le départ du livreur
              <div class="thanks">Merci pour votre achat!</div>
            </div>
          </div>
        </body>
      </html>`);
    receiptDocument.close();

    const cleanup = () => printFrame.remove();
    receiptWindow.addEventListener("afterprint", cleanup, { once: true });

    const images = Array.from(receiptDocument.images);
    const imagesReady = Promise.all(
      images.map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete) {
              resolve();
              return;
            }

            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          }),
      ),
    );

    void Promise.race([
      imagesReady,
      new Promise<void>((resolve) => window.setTimeout(resolve, 3000)),
    ]).then(() => {
      receiptWindow.focus();
      receiptWindow.print();
      window.setTimeout(cleanup, 120000);
    });
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
        <Clock3
          size={34}
          className="mx-auto text-[#1db7bd]"
          strokeWidth={2.5}
        />

        <p className="mt-4 font-black text-[#1db7bd]">
          Chargement des commandes...
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {message && (
        <p
          className={`rounded-2xl p-4 font-bold ${
            message.includes("Erreur")
              ? "bg-red-50 text-red-500"
              : "bg-green-50 text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1db7bd]">
            Commandes actives
          </p>

          <h2 className="mt-2 text-3xl font-black text-gray-950">
            Commandes en cours
          </h2>
        </div>

        <span className="rounded-full bg-[#e9fbfc] px-5 py-2 text-sm font-black text-[#1db7bd]">
          {activeOrders.length} commande(s)
        </span>
      </div>

      {activeOrders.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
          <ReceiptText
            size={44}
            className="mx-auto text-[#1db7bd]"
            strokeWidth={2.5}
          />

          <h2 className="mt-4 text-2xl font-black text-gray-950">
            Aucune commande en cours
          </h2>

          <p className="mt-2 text-gray-500">
            Les nouvelles commandes apparaîtront ici.
          </p>
        </div>
      ) : (
        activeOrders.map((order) => {
          const whatsappLink = getWhatsappLink(order);
          const mapsLink = getGoogleMapsLink(order);

          return (
            <article
              key={order.id}
              className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-4 py-2 text-xs font-black ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status || "En attente"}
                    </span>

                    <span className="rounded-full bg-[#e9fbfc] px-4 py-2 text-xs font-black text-[#1db7bd]">
                      {order.order_reference || "Sans référence"}
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl font-black text-gray-950">
                    Commande de {order.customer_name || "Client"}
                  </h2>

                  <p className="mt-2 text-sm font-bold text-gray-500">
                    Passée le {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="w-full xl:max-w-xs">
                  <KidiclassSelect
                    label="Statut de la commande"
                    value={order.status || "En attente"}
                    options={statusOptions}
                    onChange={(value) => updateOrderStatus(order.id, value)}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#1db7bd]">
                    <User size={18} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Client
                    </span>
                  </div>

                  <p className="font-black text-gray-950">
                    {order.customer_name || "Non renseigné"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#f36f45]">
                    <Phone size={18} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Téléphone
                    </span>
                  </div>

                  <p className="font-black text-gray-950">
                    {order.customer_phone || "Non renseigné"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#c7a900]">
                    <MapPin size={18} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Livraison
                    </span>
                  </div>

                  <p className="font-black text-gray-950">
                    {order.delivery_area || "Non renseigné"}
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-500">
                    {order.customer_city || ""}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-green-600">
                    <Banknote size={18} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Paiement
                    </span>
                  </div>

                  <p className="font-black text-gray-950">
                    {order.payment_method || "Non renseigné"}
                  </p>

                  {getDepositAmount(
                    Number(order.total_amount || 0),
                    order.payment_method
                  ) > 0 && (
                    <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
                      Paiement initial :{" "}
                      {getDepositAmount(
                        Number(order.total_amount || 0),
                        order.payment_method
                      ).toLocaleString("fr-FR")}{" "}
                      FCFA
                      <br />
                      Solde :{" "}
                      {getRemainingAmount(
                        Number(order.total_amount || 0),
                        order.payment_method
                      ).toLocaleString("fr-FR")}{" "}
                      FCFA
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] bg-[#e9fbfc] p-5">
                <p className="mb-2 text-sm font-black uppercase tracking-wide text-[#1db7bd]">
                  Adresse de livraison
                </p>

                <p className="font-bold leading-7 text-gray-700">
                  {order.customer_address || "Adresse non renseignée"}
                </p>

                {order.delivery_map_address && (
                  <p className="mt-2 text-sm font-bold text-gray-500">
                    Adresse carte : {order.delivery_map_address}
                  </p>
                )}

                {order.delivery_latitude && order.delivery_longitude && (
                  <p className="mt-2 text-sm font-bold text-gray-500">
                    Coordonnées : {order.delivery_latitude},{" "}
                    {order.delivery_longitude}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  {whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      className="flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white hover:bg-green-600"
                    >
                      <MessageCircle size={18} strokeWidth={2.5} />
                      Contacter sur WhatsApp
                    </a>
                  )}

                  {mapsLink && (
                    <a
                      href={mapsLink}
                      target="_blank"
                      className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white"
                    >
                      <Navigation size={18} strokeWidth={2.5} />
                      Ouvrir Google Maps
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => printReceipt(order)}
                    className="flex items-center gap-2 rounded-full bg-[#f36f45] px-5 py-3 text-sm font-black text-white hover:bg-[#e85e33]"
                  >
                    <ReceiptText size={18} strokeWidth={2.5} />
                    Imprimer reçu A5
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-950">
                  <PackageCheck size={22} strokeWidth={2.5} />
                  Articles commandés
                </h3>

                <div className="space-y-3">
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-4 rounded-[1.5rem] bg-[#fffdf7] p-4 md:grid-cols-[70px_1fr_auto]"
                    >
                      <div className="overflow-hidden rounded-2xl bg-gray-100">
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="h-20 w-full object-cover object-top"
                          />
                        ) : (
                          <div className="h-20 bg-gray-100" />
                        )}
                      </div>

                      <div>
                        <p className="font-black text-gray-950">
                          {item.products?.name || "Produit supprimé"}
                        </p>

                        {item.selected_size && (
                          <p className="mt-1 text-sm font-bold text-gray-500">
                            Taille / pointure : {item.selected_size}
                          </p>
                        )}

                        <p className="mt-1 text-sm font-bold text-gray-500">
                          Quantité : {item.quantity}
                        </p>
                      </div>

                      <p className="font-black text-[#f36f45] md:text-right">
                        {Number(item.unit_price * item.quantity).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        FCFA
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-500">
                      Frais de livraison
                    </p>

                    <p className="font-black text-gray-950">
                      {order.delivery_area === "Abidjan"
                        ? `${Number(order.delivery_fee || 0).toLocaleString(
                            "fr-FR"
                          )} FCFA`
                        : "À confirmer"}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm font-bold text-gray-500">
                      Total commande
                    </p>

                    <p className="text-3xl font-black text-[#f36f45]">
                      {Number(order.total_amount || 0).toLocaleString("fr-FR")}{" "}
                      FCFA
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
