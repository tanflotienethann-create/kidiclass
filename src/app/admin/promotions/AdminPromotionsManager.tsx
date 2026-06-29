"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgePercent, Power, Plus, Trash2 } from "lucide-react";
import {
  normalizePromoCode,
  PROMO_CATEGORY,
  PROMO_PRODUCT_TYPE,
} from "@/lib/promoCodes";
import { DATA_RESET_AT } from "@/lib/dataReset";
import { supabase } from "@/lib/supabase";

type PromoRecord = {
  id: number;
  name: string;
  price: number;
  is_active: boolean | null;
  created_at: string;
};

export default function AdminPromotionsManager() {
  const [promotions, setPromotions] = useState<PromoRecord[]>([]);
  const [code, setCode] = useState("");
  const [percentage, setPercentage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const loadPromotions = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("id,name,price,is_active,created_at")
      .eq("category", PROMO_CATEGORY)
      .eq("is_archived", true)
      .gte("created_at", DATA_RESET_AT)
      .order("created_at", { ascending: false });

    if (error) {
      setMessageType("error");
      setMessage("Impossible de charger les codes promo.");
    } else {
      setPromotions((data as PromoRecord[]) || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPromotions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadPromotions]);

  async function createPromotion(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const normalizedCode = normalizePromoCode(code);
    const numericPercentage = Number(percentage);

    if (!/^[A-Z0-9_-]{3,24}$/.test(normalizedCode)) {
      setMessageType("error");
      setMessage(
        "Le code doit contenir entre 3 et 24 lettres, chiffres, tirets ou underscores.",
      );
      return;
    }

    if (
      !Number.isFinite(numericPercentage) ||
      numericPercentage <= 0 ||
      numericPercentage > 100
    ) {
      setMessageType("error");
      setMessage("Le pourcentage doit être compris entre 1 et 100.");
      return;
    }

    if (
      promotions.some(
        (promotion) => normalizePromoCode(promotion.name) === normalizedCode,
      )
    ) {
      setMessageType("error");
      setMessage("Ce code promo existe déjà.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("products").insert([
      {
        name: normalizedCode,
        description: "Code promotionnel interne KidiClass",
        price: numericPercentage,
        stock: 0,
        category: PROMO_CATEGORY,
        reference: `PROMO-${normalizedCode}`,
        product_type: PROMO_PRODUCT_TYPE,
        is_promo: false,
        is_favorite: false,
        is_new: false,
        is_pack: false,
        is_active: true,
        is_archived: true,
        availability_status: "Disponible en 24h",
      },
    ]);

    if (error) {
      setSaving(false);
      setMessageType("error");
      setMessage(`Impossible de créer le code promo : ${error.message}`);
      return;
    }

    let notificationMessage = "";
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (accessToken) {
      try {
        const response = await fetch("/api/notifications/promo-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            code: normalizedCode,
            percentage: numericPercentage,
          }),
        });
        const result = (await response.json()) as {
          error?: string;
          recipientCount?: number;
        };

        notificationMessage = response.ok
          ? ` Email envoyé à ${result.recipientCount || 0} client(s).`
          : ` ${result.error || "L’email n’a pas pu être envoyé."}`;
      } catch {
        notificationMessage = " Le service email est momentanément indisponible.";
      }
    } else {
      notificationMessage = " Email non envoyé : session administrateur introuvable.";
    }

    setSaving(false);

    setCode("");
    setPercentage("");
    setMessageType("success");
    setMessage(`Le code ${normalizedCode} a été créé.${notificationMessage}`);
    await loadPromotions();
  }

  async function togglePromotion(promotion: PromoRecord) {
    setMessage("");

    const { error } = await supabase
      .from("products")
      .update({ is_active: !promotion.is_active })
      .eq("id", promotion.id)
      .eq("category", PROMO_CATEGORY);

    if (error) {
      setMessageType("error");
      setMessage("Impossible de modifier ce code promo.");
      return;
    }

    await loadPromotions();
  }

  async function deletePromotion(promotion: PromoRecord) {
    const confirmed = window.confirm(
      `Supprimer définitivement le code ${promotion.name} ?`,
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", promotion.id)
      .eq("category", PROMO_CATEGORY);

    if (error) {
      setMessageType("error");
      setMessage("Impossible de supprimer ce code promo.");
      return;
    }

    setMessageType("success");
    setMessage(`Le code ${promotion.name} a été supprimé.`);
    await loadPromotions();
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={createPromotion}
        className="grid gap-4 border-b border-gray-100 pb-8 md:grid-cols-[1fr_220px_auto] md:items-end"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-black text-gray-700">
            Code promo
          </span>
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Nouveau code"
            maxLength={24}
            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 font-black uppercase text-gray-950 outline-none transition focus:border-[#1db7bd]"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-black text-gray-700">
            Remise en pourcentage
          </span>
          <div className="flex items-center rounded-2xl border-2 border-gray-200 bg-white px-4 focus-within:border-[#1db7bd]">
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              value={percentage}
              onChange={(event) => setPercentage(event.target.value)}
              className="min-w-0 flex-1 bg-transparent py-4 font-black text-gray-950 outline-none"
              required
            />
            <BadgePercent size={22} className="text-[#f36f45]" />
          </div>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#1db7bd] px-6 py-4 font-black text-white transition hover:bg-[#159ca1] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={20} strokeWidth={2.5} />
          {saving ? "Création..." : "Créer"}
        </button>
      </form>

      {message && (
        <p
          className={`rounded-2xl p-4 text-sm font-black ${
            messageType === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p className="py-8 text-center font-black text-[#1db7bd]">
          Chargement des codes promo...
        </p>
      ) : promotions.length === 0 ? (
        <div className="border border-dashed border-gray-200 p-8 text-center">
          <BadgePercent
            size={36}
            className="mx-auto text-[#1db7bd]"
            strokeWidth={2.5}
          />
          <p className="mt-4 font-black text-gray-950">
            Aucun code promo actif ou archivé
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promotion) => (
            <article
              key={promotion.id}
              className="rounded-lg border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                      promotion.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {promotion.is_active ? "Actif" : "Désactivé"}
                  </span>
                  <h3 className="mt-3 break-words text-2xl font-black text-gray-950">
                    {promotion.name}
                  </h3>
                </div>

                <span className="shrink-0 text-3xl font-black text-[#f36f45]">
                  -{Number(promotion.price)}%
                </span>
              </div>

              <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => void togglePromotion(promotion)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e9fbfc] px-4 py-3 text-sm font-black text-[#1db7bd] hover:bg-[#d5f5f7]"
                >
                  <Power size={18} strokeWidth={2.5} />
                  {promotion.is_active ? "Désactiver" : "Activer"}
                </button>

                <button
                  type="button"
                  onClick={() => void deletePromotion(promotion)}
                  aria-label={`Supprimer ${promotion.name}`}
                  title={`Supprimer ${promotion.name}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <Trash2 size={19} strokeWidth={2.5} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
