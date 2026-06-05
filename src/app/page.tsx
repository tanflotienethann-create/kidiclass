import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { MessageCircle, PackageCheck, Shirt } from "lucide-react";

export default async function Home() {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  const latestProducts = products || [];

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-[#e9fbfc]">
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-[#ffe773]/60 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-[#f36f45]/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-20">
          <div>
            <div className="mb-6 inline-flex rounded-full bg-white px-5 py-2 text-sm font-black uppercase tracking-wide text-[#1db7bd] shadow-sm">
              Les enfants sapés comme jamais
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-tight text-gray-950 md:text-7xl">
              Des looks colorés pour les petits styles.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-700">
              KidiClass sélectionne des vêtements, sacs, chaussures et
              accessoires pour enfants, avec une touche joyeuse, pratique et
              tendance.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/catalogue"
                className="rounded-full bg-[#f36f45] px-8 py-4 font-black text-white shadow-sm hover:bg-[#e85e33]"
              >
                Voir le catalogue
              </Link>

              <Link
                href="/catalogue?category=Scolaire"
                className="rounded-full border-2 border-[#1db7bd] bg-white px-8 py-4 font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white"
              >
                Spécial rentrée
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-[#1db7bd]">100%</p>
                <p className="mt-1 text-xs font-bold text-gray-500">
                  sélection enfant
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-[#f36f45]">1 000</p>
                <p className="mt-1 text-xs font-bold text-gray-500">
                  livraison Abidjan
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-[#d7b800]">Mode</p>
                <p className="mt-1 text-xs font-bold text-gray-500">
                  colorée & pratique
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2.5rem] bg-white p-4 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                {latestProducts.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    href={`/produit/${product.id}`}
                    className="group overflow-hidden rounded-[1.7rem] bg-gray-100"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-56 w-full object-cover object-top transition duration-300 group-hover:scale-105 md:h-64"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-gray-100 text-sm font-bold text-gray-400 md:h-64">
                        Aucune image
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 rounded-3xl bg-[#ffe773] px-6 py-4 shadow-lg">
              <p className="text-sm font-black uppercase text-gray-950">
                Nouveau
              </p>
              <p className="text-xs font-bold text-gray-700">
                Articles ajoutés récemment
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#f36f45]">
              Univers KidiClass
            </p>

            <h2 className="text-4xl font-black text-gray-950">
              Acheter par catégorie
            </h2>

            <p className="mt-3 max-w-2xl text-gray-600">
              Trouvez rapidement les articles selon l’âge, le style ou le besoin
              de votre enfant.
            </p>
          </div>

          <Link
            href="/catalogue"
            className="font-black text-[#1db7bd] hover:text-[#f36f45]"
          >
            Tout voir →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              label: "Filles",
              href: "/catalogue?category=Filles",
              color: "bg-[#fff1f5]",
              text: "text-[#f36f45]",
            },
            {
              label: "Garçons",
              href: "/catalogue?category=Garçons",
              color: "bg-[#e9fbfc]",
              text: "text-[#1db7bd]",
            },
            {
              label: "Bébés",
              href: "/catalogue?category=Bébés",
              color: "bg-[#fff9cf]",
              text: "text-[#c7a900]",
            },
            {
              label: "Scolaire",
              href: "/catalogue?category=Scolaire",
              color: "bg-[#edf7ff]",
              text: "text-[#1a8fcf]",
            },
            {
              label: "Sacs",
              href: "/catalogue?productType=Sac",
              color: "bg-[#e9fbfc]",
              text: "text-[#1db7bd]",
            },
            {
              label: "Robes",
              href: "/catalogue?productType=Robe",
              color: "bg-[#fff1f5]",
              text: "text-[#f36f45]",
            },
            {
              label: "Chaussures",
              href: "/catalogue?category=Chaussures",
              color: "bg-[#fff9cf]",
              text: "text-[#c7a900]",
            },
            {
              label: "Accessoires",
              href: "/catalogue?category=Accessoires",
              color: "bg-[#f4f4f5]",
              text: "text-gray-900",
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`${item.color} group rounded-[2rem] p-7 transition hover:-translate-y-1 hover:shadow-lg`}
            >
              <p className={`text-2xl font-black ${item.text}`}>
                {item.label}
              </p>

              <p className="mt-3 text-sm font-bold text-gray-600 group-hover:text-gray-900">
                Découvrir →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#fff9cf]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#1db7bd]">
              Sélection spéciale
            </p>

            <h2 className="text-4xl font-black text-gray-950">
              La rentrée avec style.
            </h2>

            <p className="mt-4 max-w-xl text-gray-700">
              Sacs, trousses, gourdes, vêtements et accessoires pour préparer la
              rentrée avec des articles pratiques, colorés et adaptés aux
              enfants.
            </p>

            <Link
              href="/catalogue?category=Scolaire"
              className="mt-7 inline-block rounded-full bg-[#1db7bd] px-8 py-4 font-black text-white hover:bg-[#159ca1]"
            >
              Découvrir la sélection scolaire
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Sacs", href: "/catalogue?productType=Sac" },
              { label: "Trousses", href: "/catalogue?productType=Trousse" },
              { label: "Gourdes", href: "/catalogue?productType=Gourde" },
              { label: "CP à CM2", href: "/catalogue?category=Scolaire" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-[2rem] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-2xl font-black text-gray-950">
                  {item.label}
                </p>

                <p className="mt-3 text-sm font-bold text-[#f36f45]">
                  Voir les articles →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#1db7bd]">
              Nouveautés
            </p>

            <h2 className="text-4xl font-black text-gray-950">
              Derniers articles ajoutés
            </h2>

            <p className="mt-3 text-gray-600">
              Découvrez les nouveautés disponibles dans la boutique.
            </p>
          </div>

          <Link
            href="/catalogue"
            className="font-black text-[#1db7bd] hover:text-[#f36f45]"
          >
            Voir tout →
          </Link>
        </div>

        {latestProducts.length === 0 ? (
          <div className="rounded-[2rem] bg-gray-50 p-10 text-center">
            <p className="font-bold text-gray-600">
              Aucun produit ajouté pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {latestProducts.map((product) => (
              <Link
                key={product.id}
                href={`/produit/${product.id}`}
                className="group"
              >
                <div className="overflow-hidden rounded-[1.6rem] bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-64 w-full object-cover object-top transition duration-300 group-hover:scale-105 md:h-80"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-gray-100 text-sm font-bold text-gray-400 md:h-80">
                      Aucune image
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {product.category && (
                      <span className="rounded-full bg-[#e9fbfc] px-3 py-1 text-xs font-black text-[#1db7bd]">
                        {product.category}
                      </span>
                    )}

                    {product.product_type && (
                      <span className="rounded-full bg-[#fff1f5] px-3 py-1 text-xs font-black text-[#f36f45]">
                        {product.product_type}
                      </span>
                    )}
                  </div>

                  <h3 className="line-clamp-2 font-black text-gray-950">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-lg font-black text-[#f36f45]">
                    {Number(product.price).toLocaleString("fr-FR")} FCFA
                  </p>

                  {Number(product.stock || 0) <= 0 ? (
                    <p className="mt-1 text-sm font-bold text-red-500">
                      Rupture de stock
                    </p>
                  ) : (
                    <p className="mt-1 text-sm font-bold text-gray-500">
                      Disponible
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-12 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-7 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
              <PackageCheck size={30} strokeWidth={2.5} />
            </div>

            <h3 className="mt-4 text-xl font-black text-gray-950">
              Livraison à Abidjan
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Livraison à 1 000 FCFA dans Abidjan. Les autres destinations sont
              confirmées sur WhatsApp.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-7 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f5] text-[#f36f45]">
              <Shirt size={30} strokeWidth={2.5} />
            </div>

            <h3 className="mt-4 text-xl font-black text-gray-950">
              Sélection enfant
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Des articles pensés pour le confort, le style et le quotidien des
              enfants.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-7 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff9cf] text-[#c7a900]">
              <MessageCircle size={30} strokeWidth={2.5} />
            </div>

            <h3 className="mt-4 text-xl font-black text-gray-950">
              Contact WhatsApp
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Pour les livraisons spéciales, KidiClass vous contacte directement
              afin de confirmer les frais.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}