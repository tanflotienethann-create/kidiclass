import type { MetadataRoute } from "next";
import { schoolOfferCategories } from "@/lib/schoolOffer";
import { SITE_URL } from "@/lib/site";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

const publicPages = [
  { path: "", priority: 1, changeFrequency: "daily" as const },
  { path: "/catalogue", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/promotions", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/nouveautes", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/ecole-sorties", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/repas-gouters", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/piscine-plage", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/accessoires-jeux", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/personnages", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/offre-scolaire", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/packs-scolaires", priority: 0.8, changeFrequency: "weekly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = publicPages.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const schoolOfferEntries: MetadataRoute.Sitemap = schoolOfferCategories.map(
    (category) => ({
      url: `${SITE_URL}/offre-scolaire/${category.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  const { data: products } = await supabase
    .from("products")
    .select("id,created_at")
    .or("is_archived.is.false,is_archived.is.null")
    .order("created_at", { ascending: false });

  const productEntries: MetadataRoute.Sitemap = (products || []).map(
    (product) => ({
      url: `${SITE_URL}/produit/${product.id}`,
      lastModified: product.created_at
        ? new Date(product.created_at)
        : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  return [...staticEntries, ...schoolOfferEntries, ...productEntries];
}
