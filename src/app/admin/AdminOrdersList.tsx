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

    setMessage(
      newStatus === "Livrée"
        ? "Commande déplacée dans l’historique."
        : "Statut de la commande mis à jour."
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
    const itemsTotal = Number(order.total_amount || 0) - Number(order.delivery_fee || 0);
    const deposit = getDepositAmount(Number(order.total_amount || 0), order.payment_method);
    const remaining = getRemainingAmount(
      Number(order.total_amount || 0),
      order.payment_method
    );
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

    const receiptWindow = window.open("", "_blank", "width=900,height=1100");
    if (!receiptWindow) return;

    receiptWindow.document.write(`<!doctype html>
      <html>
        <head>
          <title>Reçu ${order.order_reference || ""}</title>
          <style>
            @page { size: A5 portrait; margin: 5mm; }
            * { box-sizing: border-box; }
            html, body { margin: 0; min-height: 100%; background: #f4efe7; font-family: Arial, sans-serif; color: #17324d; }
            body { padding: 12px; }
            .receipt { width: 138mm; min-height: 200mm; margin: 0 auto; background: white; border: 3px solid #0f8f8d; border-radius: 16px; padding: 10mm; overflow: hidden; }
            .logo { display: block; width: 92mm; max-height: 30mm; object-fit: contain; margin: 0 auto 2mm; }
            .tagline { text-align: center; color: #ff6b00; font-size: 13px; font-weight: 900; margin-bottom: 7mm; }
            .phone { display: flex; align-items: center; justify-content: center; gap: 8px; color: #0f8f8d; font-size: 20px; font-weight: 900; border-top: 2px dotted #b8e3e1; border-bottom: 2px dotted #b8e3e1; padding: 3mm 0; }
            .info { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin: 5mm 0; }
            .box { border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,.12); padding: 5mm; min-height: 26mm; }
            .label { font-size: 10px; font-weight: 900; color: #17324d; text-transform: uppercase; }
            .value { margin-top: 2mm; font-size: 18px; font-weight: 900; color: #0f8f8d; line-height: 1.15; word-break: break-word; }
            .zone .value { color: #ff6b00; }
            .section-title { margin-top: 5mm; background: #0f9f9b; color: white; padding: 3mm 5mm; border-radius: 14px 14px 0 0; font-size: 17px; font-weight: 900; }
            .items { border: 1px solid #d8eeed; border-radius: 0 0 14px 14px; overflow: hidden; }
            .header, .item { display: grid; grid-template-columns: 18mm 1fr 28mm; gap: 4mm; align-items: center; padding: 3mm 5mm; }
            .header { color: #0f8f8d; font-size: 11px; font-weight: 900; border-bottom: 1px solid #d8eeed; text-transform: uppercase; }
            .item { border-bottom: 1px dotted #b8e3e1; min-height: 20mm; }
            .item:last-child { border-bottom: 0; }
            .item img, .placeholder { width: 15mm; height: 17mm; object-fit: cover; border-radius: 7px; background: #edf4f4; }
            .item-name { font-size: 16px; font-weight: 900; line-height: 1.2; }
            .item-price { text-align: right; color: #0f8f8d; font-size: 16px; font-weight: 900; white-space: nowrap; }
            .totals { margin-top: 5mm; border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,.12); padding: 5mm; }
            .line { display: flex; justify-content: space-between; gap: 8px; padding: 2.5mm 0; border-bottom: 1px solid #b8e3e1; font-size: 13px; font-weight: 800; }
            .line:last-child { border-bottom: 0; }
            .line strong { text-align: right; }
            .pay { display: flex; align-items: center; justify-content: space-between; gap: 4mm; margin-top: 3mm; color: #ff6b00; font-size: 19px; font-weight: 900; }
            .amount { background: #ff6b00; color: white; border-radius: 9px; padding: 3mm 6mm; font-size: 26px; white-space: nowrap; }
            .note { margin-top: 6mm; border: 2px solid #7ac8c8; border-radius: 14px; padding: 5mm; text-align: center; color: #0f8f8d; font-size: 16px; font-weight: 900; }
            .thanks { color: #ff6b00; font-size: 22px; margin-top: 3mm; }
            @media print { body { background: white; padding: 0; } .receipt { margin: 0 auto; box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <img class="logo" src="/logo-kidiclass.png" alt="KidiClass" />
            <div class="tagline">Les enfants sapés comme jamais...</div>
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
              <div class="line"><span>Option paiement</span><strong>${order.payment_method || ""}</strong></div>
              ${
                deposit > 0
                  ? `<div class="line"><span>Payé / à payer maintenant</span><strong>${deposit.toLocaleString("fr-FR")}F</strong></div>
                     <div class="line"><span>Solde restant</span><strong>${remaining.toLocaleString("fr-FR")}F</strong></div>`
                  : ""
              }
              <div class="pay"><span>A PAYER</span><span class="amount">${Number(order.total_amount || 0).toLocaleString("fr-FR")}F</span></div>
            </div>
            <div class="note">
              Vérifiez SVP votre colis avant le départ du livreur
              <div class="thanks">Merci pour votre achat!</div>
            </div>
          </div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>`);
    receiptWindow.document.close();
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
