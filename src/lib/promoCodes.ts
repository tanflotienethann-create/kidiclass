import { supabase } from "./supabase";

export const PROMO_CATEGORY = "__KIDICLASS_PROMO_CODE__";
export const PROMO_PRODUCT_TYPE = "promotion_interne";

export type ActivePromoCode = {
  code: string;
  percentage: number;
};

export function normalizePromoCode(code: string) {
  return code.trim().toUpperCase();
}

export function getPromoDiscount(subtotal: number, percentage: number) {
  const safePercentage = Math.min(Math.max(Number(percentage) || 0, 0), 100);
  return Math.round(Math.max(subtotal, 0) * (safePercentage / 100));
}

export async function getActivePromoCode(
  rawCode: string,
): Promise<ActivePromoCode | null> {
  const code = normalizePromoCode(rawCode);
  if (!code) return null;

  const { data, error } = await supabase
    .from("products")
    .select("name,price,is_active")
    .eq("category", PROMO_CATEGORY)
    .eq("name", code)
    .eq("is_archived", true)
    .eq("is_active", true)
    .limit(1);

  if (error || !data?.length) return null;

  const percentage = Number(data[0].price);
  if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
    return null;
  }

  return { code, percentage };
}
