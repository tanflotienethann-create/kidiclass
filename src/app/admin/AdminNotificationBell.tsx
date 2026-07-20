"use client";

import { supabase } from "@/lib/supabase";
import {
  getServiceWorkerRegistration,
  isPushSupported,
  urlBase64ToUint8Array,
} from "@/lib/pushClient";
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type NotificationPermissionState =
  | NotificationPermission
  | "unsupported";

type AdminOrderNotification = {
  id: number;
  order_reference: string | null;
  customer_name: string | null;
  total_amount: number | null;
  status: string | null;
  created_at: string;
};

type OutOfStockProduct = {
  id: number;
  name: string;
  stock: number | null;
};

const SEEN_ORDER_KEY = "kidiclass_admin_seen_order_id";
const KNOWN_OUT_OF_STOCK_KEY = "kidiclass_admin_known_out_of_stock_ids";

function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

async function showBrowserNotification(
  title: string,
  options: NotificationOptions,
) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: "/icon-192.png?v=8",
        badge: "/icon-96.png?v=8",
        ...options,
      });
      return;
    } catch {
      // The standard Notification constructor is a useful fallback here.
    }
  }

  new Notification(title, {
    icon: "/icon-192.png?v=8",
    ...options,
  });
}

function parseStoredIds(value: string | null) {
  if (!value) return new Set<number>();

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return new Set<number>();
    return new Set(parsed.map((id) => Number(id)).filter(Boolean));
  } catch {
    return new Set<number>();
  }
}

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermissionState>(
    () => getNotificationPermission(),
  );
  const [orders, setOrders] = useState<AdminOrderNotification[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<
    OutOfStockProduct[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushMessage, setPushMessage] = useState("");
  const firstLoadDone = useRef(false);

  const alertCount = useMemo(
    () => Math.min(99, orders.length + outOfStockProducts.length),
    [orders.length, outOfStockProducts.length],
  );

  const loadNotifications = useCallback(async () => {
    const [ordersResult, productsResult] = await Promise.all([
      supabase
        .from("orders")
        .select("id,order_reference,customer_name,total_amount,status,created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("products")
        .select("id,name,stock")
        .or("is_archived.is.false,is_archived.is.null")
        .lte("stock", 0)
        .order("id", { ascending: false })
        .limit(10),
    ]);

    const nextOrders =
      ((ordersResult.data as AdminOrderNotification[] | null) || []).filter(
        Boolean,
      );
    const nextOutOfStock =
      ((productsResult.data as OutOfStockProduct[] | null) || []).filter(
        Boolean,
      );

    setOrders(nextOrders);
    setOutOfStockProducts(nextOutOfStock);
    setLoading(false);

    if (typeof window === "undefined") return;

    const latestOrder = nextOrders[0];
    const storedOrderId = Number(localStorage.getItem(SEEN_ORDER_KEY) || 0);
    const nextOutOfStockIds = new Set(nextOutOfStock.map((product) => product.id));
    const knownOutOfStockIds = parseStoredIds(
      localStorage.getItem(KNOWN_OUT_OF_STOCK_KEY),
    );

    if (!firstLoadDone.current) {
      if (latestOrder) {
        localStorage.setItem(SEEN_ORDER_KEY, String(latestOrder.id));
      }

      localStorage.setItem(
        KNOWN_OUT_OF_STOCK_KEY,
        JSON.stringify(Array.from(nextOutOfStockIds)),
      );
      firstLoadDone.current = true;
      return;
    }

    if (latestOrder && latestOrder.id !== storedOrderId) {
      localStorage.setItem(SEEN_ORDER_KEY, String(latestOrder.id));
      await showBrowserNotification("Nouvelle commande KidiClass", {
        body: `${latestOrder.customer_name || "Client"} • ${
          latestOrder.order_reference || "Nouvelle commande"
        }`,
        tag: `kidiclass-order-${latestOrder.id}`,
        data: { url: "/admin/commandes" },
      });
    }

    const newOutOfStockProducts = nextOutOfStock.filter(
      (product) => !knownOutOfStockIds.has(product.id),
    );

    if (newOutOfStockProducts.length > 0) {
      localStorage.setItem(
        KNOWN_OUT_OF_STOCK_KEY,
        JSON.stringify(Array.from(nextOutOfStockIds)),
      );

      await showBrowserNotification("Produit en rupture de stock", {
        body:
          newOutOfStockProducts.length === 1
            ? newOutOfStockProducts[0].name
            : `${newOutOfStockProducts.length} produits sont en rupture`,
        tag: "kidiclass-stock-alert",
        data: { url: "/admin/produits" },
      });
    }
  }, []);

  useEffect(() => {
    const firstLoadTimeoutId = window.setTimeout(() => {
      void loadNotifications();
    }, 0);
    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 30_000);

    return () => {
      window.clearTimeout(firstLoadTimeoutId);
      window.clearInterval(intervalId);
    };
  }, [loadNotifications]);

  useEffect(() => {
    let active = true;

    async function checkSubscription() {
      if (!isPushSupported()) return;

      try {
        const registration = await getServiceWorkerRegistration();
        const subscription =
          await registration?.pushManager.getSubscription();

        if (active) {
          setPushSubscribed(Boolean(subscription));
        }
      } catch {
        if (active) setPushSubscribed(false);
      }
    }

    void checkSubscription();

    return () => {
      active = false;
    };
  }, []);

  async function subscribeAdminDevice() {
    setPushLoading(true);
    setPushMessage("");

    if (!isPushSupported()) {
      setPermission("unsupported");
      setPushLoading(false);
      return;
    }

    try {
      const nextPermission =
        Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();

      setPermission(nextPermission);

      if (nextPermission !== "granted") {
        setPushMessage(
          "Les notifications doivent être autorisées pour recevoir les alertes.",
        );
        return;
      }

      const keyResponse = await fetch("/api/admin-notifications/vapid-key", {
        cache: "no-store",
      });
      const keyData = (await keyResponse.json()) as {
        configured?: boolean;
        publicKey?: string;
        error?: string;
      };

      if (!keyResponse.ok || !keyData.configured || !keyData.publicKey) {
        setPushMessage(
          keyData.error ||
            "Les notifications téléphone ne sont pas encore configurées.",
        );
        return;
      }

      const registration = await getServiceWorkerRegistration();
      if (!registration) {
        setPushMessage("Impossible de préparer l'application sur ce téléphone.");
        return;
      }

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
        });
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setPushMessage(
          "Reconnectez-vous à l'espace admin pour activer ce téléphone.",
        );
        return;
      }

      const response = await fetch("/api/admin-notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPushMessage(
          result.error ||
            "Impossible d'enregistrer ce téléphone pour les notifications.",
        );
        return;
      }

      setPushSubscribed(true);
      setPushMessage("Notifications activées sur ce téléphone.");
    } catch {
      setPushMessage(
        "Impossible d'activer les notifications sur ce téléphone pour le moment.",
      );
    } finally {
      setPushLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#e9fbfc] text-[#087f83] transition hover:bg-[#1db7bd] hover:text-white"
        aria-label="Notifications admin"
        aria-expanded={open}
      >
        {alertCount > 0 ? (
          <BellRing size={21} strokeWidth={2.6} />
        ) : (
          <Bell size={21} strokeWidth={2.6} />
        )}

        {alertCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f36f45] px-1 text-[10px] font-black text-white ring-2 ring-white">
            {alertCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-3 w-[min(92vw,390px)] overflow-hidden rounded-[1.6rem] border border-[#b9ecee] bg-white shadow-[0_24px_60px_rgba(8,127,131,0.22)]">
          <div className="flex items-start justify-between gap-3 bg-[#e9fbfc] px-4 py-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087f83]">
                Notifications
              </p>
              <p className="mt-1 text-xl font-black text-gray-950">
                Suivi admin
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-600"
              aria-label="Fermer les notifications"
            >
              <X size={18} strokeWidth={2.6} />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-4">
            {permission !== "unsupported" && permission !== "denied" && (
              <button
                type="button"
                onClick={subscribeAdminDevice}
                disabled={pushLoading || pushSubscribed}
                className={`mb-3 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black shadow-sm transition disabled:cursor-default ${
                  pushSubscribed
                    ? "bg-green-50 text-green-600"
                    : "bg-[#f36f45] text-white hover:bg-[#e85e33]"
                }`}
              >
                {pushSubscribed ? (
                  <CheckCircle2 size={18} strokeWidth={2.6} />
                ) : (
                  <BellRing size={18} strokeWidth={2.6} />
                )}
                {pushSubscribed
                  ? "Notifications actives sur ce téléphone"
                  : pushLoading
                    ? "Activation..."
                    : "Activer sur ce téléphone"}
              </button>
            )}

            {pushMessage && (
              <p className="mb-4 rounded-2xl bg-[#fff9cf] p-3 text-xs font-bold leading-5 text-[#8b7100]">
                {pushMessage}
              </p>
            )}

            {permission === "denied" && (
              <p className="mb-4 rounded-2xl bg-red-50 p-3 text-xs font-bold leading-5 text-red-500">
                Les notifications sont bloquées dans le navigateur. Il faut les
                autoriser dans les réglages du site.
              </p>
            )}

            {permission === "unsupported" && (
              <p className="mb-4 rounded-2xl bg-[#fff3bf] p-3 text-xs font-bold leading-5 text-[#8b7100]">
                Ce navigateur ne prend pas en charge les notifications.
              </p>
            )}

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-black text-gray-950">
                  <PackageCheck
                    size={18}
                    className="text-[#087f83]"
                    strokeWidth={2.6}
                  />
                  Dernières commandes
                </h3>

                <Link
                  href="/admin/commandes"
                  onClick={() => setOpen(false)}
                  className="text-xs font-black text-[#f36f45]"
                >
                  Voir
                </Link>
              </div>

              <div className="space-y-2">
                {orders.slice(0, 4).map((order) => (
                  <Link
                    key={order.id}
                    href="/admin/commandes"
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl bg-[#fffdf7] p-3 hover:bg-[#e9fbfc]"
                  >
                    <p className="truncate text-sm font-black text-gray-950">
                      {order.order_reference || `Commande #${order.id}`}
                    </p>
                    <p className="mt-1 truncate text-xs font-bold text-gray-500">
                      {order.customer_name || "Client non renseigné"} •{" "}
                      {Number(order.total_amount || 0).toLocaleString("fr-FR")}{" "}
                      FCFA
                    </p>
                  </Link>
                ))}

                {!loading && orders.length === 0 && (
                  <p className="rounded-2xl bg-[#fffdf7] p-3 text-sm font-bold text-gray-500">
                    Aucune commande récente.
                  </p>
                )}
              </div>
            </section>

            <section className="mt-5 border-t border-gray-100 pt-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-black text-gray-950">
                  <AlertTriangle
                    size={18}
                    className="text-[#f36f45]"
                    strokeWidth={2.6}
                  />
                  Ruptures de stock
                </h3>

                <Link
                  href="/admin/produits"
                  onClick={() => setOpen(false)}
                  className="text-xs font-black text-[#f36f45]"
                >
                  Gérer
                </Link>
              </div>

              <div className="space-y-2">
                {outOfStockProducts.slice(0, 5).map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/produits/${product.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-2xl bg-red-50 p-3 text-red-600 hover:bg-red-100"
                  >
                    <ShoppingBag size={18} strokeWidth={2.6} />
                    <span className="min-w-0 flex-1 truncate text-sm font-black">
                      {product.name}
                    </span>
                  </Link>
                ))}

                {!loading && outOfStockProducts.length === 0 && (
                  <p className="flex items-center gap-2 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-600">
                    <CheckCircle2 size={18} strokeWidth={2.6} />
                    Aucun produit en rupture.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
