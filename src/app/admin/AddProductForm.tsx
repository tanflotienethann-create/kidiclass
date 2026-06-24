"use client";

import KidiclassSelect from "@/components/KidiclassSelect";
import {
  availabilityOptions,
} from "@/lib/productAvailability";
import {
  characterThemes,
  getSchoolOfferCategory,
  schoolLevels,
} from "@/lib/schoolOffer";
import {
  getDefaultProductType,
  shopCategoryLabels,
  shopProductTypes,
} from "@/lib/shopNavigation";
import { supabase } from "@/lib/supabase";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import {
  ImagePlus,
  Loader2,
  PackagePlus,
  Plus,
  Trash2,
  Boxes,
  Star,
  Sparkles,
  Tag,
} from "lucide-react";

type Variant = {
  size: string;
  color: string;
  stock: string;
};

type PackItem = {
  componentType: string;
  customComponentName: string;
  componentDescription: string;
  componentStock: string;
  requiredQuantity: string;
};

const categories = shopCategoryLabels;
const productTypes = shopProductTypes;

const packComponentOptions = [
  "Sac à dos",
  "Sac à roulette",
  "Sac à goûter",
  "Set gourde et boîte à goûter",
  "Boîte à goûter",
  "Gourde",
  "Trousse",
  "Autre",
];

const genderOptions = ["Fille", "Garçon", "Mixte"];

function getPackComponentName(item: PackItem) {
  if (item.componentType === "Autre") {
    return item.customComponentName.trim();
  }

  return item.componentType.trim();
}

export default function AddProductForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState(
    availabilityOptions[0]
  );

  const [category, setCategory] = useState("");
  const [productType, setProductType] = useState("");
  const [characterTheme, setCharacterTheme] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");

  const [brand, setBrand] = useState("");
  const [colors, setColors] = useState("");
  const [targetAge, setTargetAge] = useState("");
  const [gender, setGender] = useState("");

  const [sizes, setSizes] = useState("");

  const [isPromo, setIsPromo] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isNew, setIsNew] = useState(true);

  const [images, setImages] = useState<File[]>([]);

  const [variants, setVariants] = useState<Variant[]>([
    {
      size: "",
      color: "",
      stock: "",
    },
  ]);

  const [packItems, setPackItems] = useState<PackItem[]>([
    {
      componentType: "",
      customComponentName: "",
      componentDescription: "",
      componentStock: "",
      requiredQuantity: "1",
    },
  ]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [loading, setLoading] = useState(false);

  const isPack = category === "Packs scolaires" || category === "PACK";

  function handleImageSelection(e: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    setImages((currentImages) => [...currentImages, ...selectedFiles]);
  }

  function removeImage(index: number) {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index)
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function addVariant() {
    setVariants((currentVariants) => [
      ...currentVariants,
      {
        size: "",
        color: "",
        stock: "",
      },
    ]);
  }

  function updateVariant(index: number, field: keyof Variant, value: string) {
    setVariants((currentVariants) =>
      currentVariants.map((variant, variantIndex) => {
        if (variantIndex !== index) return variant;

        return {
          ...variant,
          [field]: value,
        };
      })
    );
  }

  function removeVariant(index: number) {
    setVariants((currentVariants) =>
      currentVariants.filter((_, variantIndex) => variantIndex !== index)
    );
  }

  function addPackItem() {
    setPackItems((currentItems) => [
      ...currentItems,
      {
        componentType: "",
        customComponentName: "",
        componentDescription: "",
        componentStock: "",
        requiredQuantity: "1",
      },
    ]);
  }

  function updatePackItem(index: number, field: keyof PackItem, value: string) {
    setPackItems((currentItems) =>
      currentItems.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          [field]: value,
        };
      })
    );
  }

  function removePackItem(index: number) {
    setPackItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function calculatePackStock() {
    const validPackItems = packItems.filter((item) => {
      return getPackComponentName(item) !== "";
    });

    if (validPackItems.length === 0) return 0;

    const possiblePackQuantities = validPackItems.map((item) => {
      const componentStock = Number(item.componentStock || 0);
      const requiredQuantity = Number(item.requiredQuantity || 1);

      if (componentStock <= 0 || requiredQuantity <= 0) return 0;

      return Math.floor(componentStock / requiredQuantity);
    });

    return Math.min(...possiblePackQuantities);
  }

  function calculateClassicStock() {
    const validVariants = variants.filter((variant) => {
      return variant.size.trim() !== "" || variant.color.trim() !== "";
    });

    if (validVariants.length === 0) {
      return Number(stock || 0);
    }

    return validVariants.reduce((sum, variant) => {
      return sum + Number(variant.stock || 0);
    }, 0);
  }

  async function uploadImages() {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, image);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  }

  function resetForm() {
    setName("");
    setReference("");
    setDescription("");
    setPrice("");
    setOldPrice("");
    setStock("");
    setAvailabilityStatus(availabilityOptions[0]);
    setCategory("");
    setProductType("");
    setCharacterTheme("");
    setSchoolLevel("");
    setBrand("");
    setColors("");
    setTargetAge("");
    setGender("");
    setSizes("");
    setIsPromo(false);
    setIsFavorite(false);
    setIsNew(true);
    setImages([]);

    setVariants([
      {
        size: "",
        color: "",
        stock: "",
      },
    ]);

    setPackItems([
      {
        componentType: "",
        customComponentName: "",
        componentDescription: "",
        componentStock: "",
        requiredQuantity: "1",
      },
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!name.trim()) {
        setMessageType("error");
        setMessage("Le nom du produit est obligatoire.");
        setLoading(false);
        return;
      }

      if (!price || Number(price) <= 0) {
        setMessageType("error");
        setMessage("Le prix du produit est obligatoire.");
        setLoading(false);
        return;
      }

      if (!category) {
        setMessageType("error");
        setMessage("La catégorie du produit est obligatoire.");
        setLoading(false);
        return;
      }

      if (isPack) {
        const hasInvalidOther = packItems.some((item) => {
          return item.componentType === "Autre" && !item.customComponentName.trim();
        });

        if (hasInvalidOther) {
          setMessageType("error");
          setMessage(
            "Pour un composant “Autre”, renseignez le nom du composant."
          );
          setLoading(false);
          return;
        }

        const validPackItems = packItems.filter((item) => {
          return getPackComponentName(item) !== "";
        });

        if (validPackItems.length === 0) {
          setMessageType("error");
          setMessage("Ajoutez au moins un composant dans le pack.");
          setLoading(false);
          return;
        }
      }

      const uploadedUrls = await uploadImages();

      const finalStock = isPack ? calculatePackStock() : calculateClassicStock();

      const { data: product, error: productError } = await supabase
        .from("products")
        .insert([
          {
            name,
            reference,
            description,
            price: Number(price),
            old_price: oldPrice ? Number(oldPrice) : null,
            stock: finalStock,
            availability_status: availabilityStatus,
            category,
            product_type: productType,
            character_theme: characterTheme,
            school_level: schoolLevel,
            brand,
            colors,
            target_age: targetAge,
            gender,
            sizes: isPack ? "" : sizes,
            image_url: uploadedUrls[0] || "",
            images: uploadedUrls,
            is_promo: isPromo,
            is_favorite: isFavorite,
            is_new: isNew,
            is_pack: isPack,
          },
        ])
        .select()
        .single();

      if (productError) {
        setMessageType("error");
        setMessage("Erreur produit : " + productError.message);
        setLoading(false);
        return;
      }

      if (!isPack) {
        const validVariants = variants.filter((variant) => {
          return variant.size.trim() !== "" || variant.color.trim() !== "";
        });

        if (validVariants.length > 0) {
          const variantsToInsert = validVariants.map((variant) => ({
            product_id: product.id,
            size: variant.size,
            color: variant.color,
            stock: Number(variant.stock || 0),
          }));

          const { error: variantsError } = await supabase
            .from("product_variants")
            .insert(variantsToInsert);

          if (variantsError) {
            setMessageType("error");
            setMessage(
              "Produit ajouté, mais erreur variantes : " +
                variantsError.message
            );
            setLoading(false);
            return;
          }
        }
      }

      if (isPack) {
        const validPackItems = packItems.filter((item) => {
          return getPackComponentName(item) !== "";
        });

        const packItemsToInsert = validPackItems.map((item) => ({
          pack_product_id: product.id,
          component_name: getPackComponentName(item),
          component_description: item.componentDescription,
          component_stock: Number(item.componentStock || 0),
          required_quantity: Number(item.requiredQuantity || 1),
        }));

        const { error: packItemsError } = await supabase
          .from("product_pack_items")
          .insert(packItemsToInsert);

        if (packItemsError) {
          setMessageType("error");
          setMessage(
            "Produit ajouté, mais erreur composants du pack : " +
              packItemsError.message
          );
          setLoading(false);
          return;
        }
      }

      setMessageType("success");
      setMessage("Produit ajouté avec succès.");
      resetForm();
      setLoading(false);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? "Erreur image : " + error.message
          : "Une erreur est survenue."
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <p
          className={`rounded-2xl p-4 font-bold ${
            messageType === "success"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {message}
        </p>
      )}

      <section className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
              <ImagePlus size={30} strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl font-black text-gray-950">
              Images du produit
            </h2>

            <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
              Ajoutez une ou plusieurs photos du produit. La première image sera
              utilisée comme image principale.
            </p>

            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#1db7bd] bg-[#e9fbfc] p-8 text-center hover:bg-[#dff7f8]">
              <ImagePlus
                size={38}
                className="text-[#1db7bd]"
                strokeWidth={2.5}
              />

              <span className="mt-3 font-black text-[#1db7bd]">
                Ajouter des images
              </span>

              <span className="mt-1 text-sm font-bold text-gray-500">
                PNG, JPG ou WEBP
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelection}
              />
            </label>

            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {images.map((image, index) => (
                  <div
                    key={`${image.name}-${index}`}
                    className="rounded-2xl border border-gray-100 bg-white p-2"
                  >
                    <div className="overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={image.name}
                        className="h-32 w-full object-cover object-top"
                      />
                    </div>

                    <p className="mt-2 truncate text-xs font-bold text-gray-500">
                      {index === 0 ? "Image principale" : "Image secondaire"}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-500 hover:bg-red-100"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff9cf] text-[#c7a900]">
              <Tag size={30} strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl font-black text-gray-950">
              Mise en avant
            </h2>

            <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
              Activez les badges visibles sur la boutique.
            </p>

            <div className="mt-6 space-y-3">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-[#fffdf7] p-4">
                <div>
                  <p className="flex items-center gap-2 font-black text-gray-950">
                    <Tag
                      size={18}
                      className="text-[#f36f45]"
                      strokeWidth={2.5}
                    />
                    Produit en promo
                  </p>

                  <p className="mt-1 text-xs font-bold text-gray-500">
                    Affiche un prix barré si l’ancien prix est renseigné.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isPromo}
                  onChange={(e) => setIsPromo(e.target.checked)}
                  className="h-5 w-5 accent-[#f36f45]"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-[#fffdf7] p-4">
                <div>
                  <p className="flex items-center gap-2 font-black text-gray-950">
                    <Star
                      size={18}
                      className="text-[#c7a900]"
                      strokeWidth={2.5}
                    />
                    Coup de cœur
                  </p>

                  <p className="mt-1 text-xs font-bold text-gray-500">
                    Met en avant le produit dans les sélections.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="h-5 w-5 accent-[#c7a900]"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-[#fffdf7] p-4">
                <div>
                  <p className="flex items-center gap-2 font-black text-gray-950">
                    <Sparkles
                      size={18}
                      className="text-[#1db7bd]"
                      strokeWidth={2.5}
                    />
                    Nouveauté
                  </p>

                  <p className="mt-1 text-xs font-bold text-gray-500">
                    Affiche le produit comme nouveauté.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="h-5 w-5 accent-[#1db7bd]"
                />
              </label>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
              <PackagePlus size={30} strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl font-black text-gray-950">
              Informations produit
            </h2>

            <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
              Renseignez les informations principales du produit.
            </p>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-gray-700">
                  Nom du produit
                </span>

                <input
                  type="text"
                  placeholder="Ex : Pack rentrée Barbie"
                  className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-gray-700">
                  Référence produit
                </span>

                <input
                  type="text"
                  placeholder="Ex : KDC-PACK-001"
                  className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-gray-700">
                  Description
                </span>

                <textarea
                  placeholder="Description courte du produit"
                  className="min-h-32 w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-700">
                    Prix actuel
                  </span>

                  <input
                    type="number"
                    placeholder="Prix en FCFA"
                    className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-700">
                    Ancien prix
                  </span>

                  <input
                    type="number"
                    placeholder="Optionnel"
                    className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                  />
                </label>
              </div>

              {!isPack && (
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-700">
                    Stock général
                  </span>

                  <input
                    type="number"
                    placeholder="Utilisé si aucune variante n’est renseignée"
                    className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </label>
              )}

              <KidiclassSelect
                label="Disponibilité affichée au client"
                value={availabilityStatus}
                options={availabilityOptions}
                onChange={setAvailabilityStatus}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <KidiclassSelect
                  label="Catégorie principale"
                  value={category}
                  options={categories}
                  placeholder="Choisir une catégorie"
                  onChange={(value) => {
                    setCategory(value);
                    const offerCategory = getSchoolOfferCategory(value);
                    setProductType(
                      offerCategory?.productType || getDefaultProductType(value),
                    );
                    setSchoolLevel(
                      offerCategory?.schoolLevel || "Non concerné",
                    );
                  }}
                />

                <KidiclassSelect
                  label="Type de produit"
                  value={productType}
                  options={productTypes}
                  placeholder="Choisir un type"
                  onChange={setProductType}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-700">
                    Marque
                  </span>

                  <input
                    type="text"
                    placeholder="Ex : Disney, Barbie..."
                    className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-700">
                    Couleurs
                  </span>

                  <input
                    type="text"
                    placeholder="Ex : rose, bleu, violet"
                    className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-700">
                    Âge de l’enfant
                  </span>

                  <input
                    type="text"
                    placeholder="Ex : 3-6 ans, 6-10 ans"
                    className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                    value={targetAge}
                    onChange={(e) => setTargetAge(e.target.value)}
                  />
                </label>

                <KidiclassSelect
                  label="Sexe"
                  value={gender}
                  options={genderOptions}
                  placeholder="Choisir"
                  onChange={setGender}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <KidiclassSelect
                  label="Personnage / thème"
                  value={characterTheme}
                  options={characterThemes}
                  placeholder="Choisir un thème"
                  onChange={setCharacterTheme}
                />

                <KidiclassSelect
                  label="Classe / niveau scolaire"
                  value={schoolLevel}
                  options={schoolLevels}
                  placeholder="Choisir un niveau"
                  onChange={setSchoolLevel}
                />
              </div>

              {!isPack && (
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-700">
                    Tailles / pointures disponibles
                  </span>

                  <input
                    type="text"
                    placeholder="Ex : 2 ans, 4 ans, 6 ans ou 28, 29, 30"
                    className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                  />

                  <p className="mt-2 text-xs font-bold text-gray-500">
                    Sépare les tailles par des virgules.
                  </p>
                </label>
              )}
            </div>
          </div>

          {!isPack && (
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f5] text-[#f36f45]">
                <Boxes size={30} strokeWidth={2.5} />
              </div>

              <h2 className="text-2xl font-black text-gray-950">
                Stock par taille / couleur
              </h2>

              <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
                Optionnel. Si vous remplissez cette partie, le stock général sera
                calculé automatiquement.
              </p>

              <div className="mt-6 space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-2xl bg-[#fffdf7] p-4 md:grid-cols-[1fr_1fr_120px_auto]"
                  >
                    <input
                      type="text"
                      placeholder="Taille"
                      className="rounded-[1.2rem] border-2 border-[#bfedf0] bg-white p-3 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                      value={variant.size}
                      onChange={(e) =>
                        updateVariant(index, "size", e.target.value)
                      }
                    />

                    <input
                      type="text"
                      placeholder="Couleur"
                      className="rounded-[1.2rem] border-2 border-[#bfedf0] bg-white p-3 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                      value={variant.color}
                      onChange={(e) =>
                        updateVariant(index, "color", e.target.value)
                      }
                    />

                    <input
                      type="number"
                      placeholder="Stock"
                      className="rounded-[1.2rem] border-2 border-[#bfedf0] bg-white p-3 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(index, "stock", e.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="flex items-center justify-center rounded-2xl bg-red-50 px-4 py-3 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 size={19} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="mt-5 flex items-center gap-2 rounded-full border-2 border-[#1db7bd] px-5 py-3 font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white"
              >
                <Plus size={19} strokeWidth={2.5} />
                Ajouter une taille / couleur
              </button>
            </div>
          )}

          {isPack && (
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff9cf] text-[#c7a900]">
                <Boxes size={30} strokeWidth={2.5} />
              </div>

              <h2 className="text-2xl font-black text-gray-950">
                Composants du pack
              </h2>

              <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
                Choisissez les éléments du pack. Si vous choisissez “Autre”, vous
                pourrez écrire le nom du composant.
              </p>

              <div className="mt-6 space-y-4">
                {packItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-[1.5rem] bg-[#fffdf7] p-4"
                  >
                    <div className="grid gap-3 md:grid-cols-[1fr_130px_130px_auto]">
                      <KidiclassSelect
                        label="Composant"
                        value={item.componentType}
                        options={packComponentOptions}
                        placeholder="Choisir un composant"
                        onChange={(value) =>
                          updatePackItem(index, "componentType", value)
                        }
                      />

                      <label className="block">
                        <span className="mb-2 block text-sm font-black text-gray-700">
                          Stock
                        </span>

                        <input
                          type="number"
                          placeholder="Stock"
                          className="w-full rounded-[1.2rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                          value={item.componentStock}
                          onChange={(e) =>
                            updatePackItem(
                              index,
                              "componentStock",
                              e.target.value
                            )
                          }
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-black text-gray-700">
                          Qté requise
                        </span>

                        <input
                          type="number"
                          placeholder="Qté"
                          className="w-full rounded-[1.2rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                          value={item.requiredQuantity}
                          onChange={(e) =>
                            updatePackItem(
                              index,
                              "requiredQuantity",
                              e.target.value
                            )
                          }
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => removePackItem(index)}
                        className="mt-7 flex h-[58px] items-center justify-center rounded-2xl bg-red-50 px-4 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 size={19} strokeWidth={2.5} />
                      </button>
                    </div>

                    {item.componentType === "Autre" && (
                      <input
                        type="text"
                        placeholder="Nom du composant"
                        className="mt-3 w-full rounded-[1.2rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                        value={item.customComponentName}
                        onChange={(e) =>
                          updatePackItem(
                            index,
                            "customComponentName",
                            e.target.value
                          )
                        }
                      />
                    )}

                    <textarea
                      placeholder="Description du composant, optionnelle"
                      className="mt-3 min-h-20 w-full rounded-[1.2rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                      value={item.componentDescription}
                      onChange={(e) =>
                        updatePackItem(
                          index,
                          "componentDescription",
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-[#e9fbfc] p-4 text-sm font-bold leading-6 text-[#1db7bd]">
                Stock estimé du pack : {calculatePackStock()} pack(s)
                disponible(s).
              </div>

              <button
                type="button"
                onClick={addPackItem}
                className="mt-5 flex items-center gap-2 rounded-full border-2 border-[#1db7bd] px-5 py-3 font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white"
              >
                <Plus size={19} strokeWidth={2.5} />
                Ajouter un composant
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f36f45] px-8 py-5 text-lg font-black text-white shadow-sm hover:bg-[#e85e33] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={22} className="animate-spin" strokeWidth={2.5} />
                Ajout du produit...
              </>
            ) : (
              <>
                <PackagePlus size={22} strokeWidth={2.5} />
                Ajouter le produit
              </>
            )}
          </button>
        </section>
      </section>
    </form>
  );
}
