import CatalogueClient from "@/app/catalogue/CatalogueClient";
import {
  getSchoolOfferCategoryBySlug,
  schoolOfferCategories,
} from "@/lib/schoolOffer";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type SchoolCategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return schoolOfferCategories.map((category) => ({ slug: category.slug }));
}

export default async function SchoolCategoryPage({
  params,
}: SchoolCategoryPageProps) {
  const { slug } = await params;
  const category = getSchoolOfferCategoryBySlug(slug);

  if (!category) notFound();

  const variant =
    category.group === "bags" || category.group === "snacks"
      ? "play"
      : "school";

  return (
    <Suspense fallback={<main className="min-h-screen bg-[#e9fbfc]" />}>
      <CatalogueClient
        initialCategory={category.label}
        theme={{
          eyebrow: "Offre scolaire 2026",
          title: category.label,
          description: category.description,
          variant,
        }}
      />
    </Suspense>
  );
}
