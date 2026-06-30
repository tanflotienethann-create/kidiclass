"use client";

import AdminShell from "../../AdminShell";
import KidiclassSelect from "@/components/KidiclassSelect";
import { useTaxonomySettings } from "@/hooks/useTaxonomySettings";
import {
  availabilityOptions,
  encodeAvailabilityStatuses,
  getProductAvailabilityLabel,
  parseAvailabilityStatuses,
} from "@/lib/productAvailability";
import {
  getTaxonomyCategoryLabels,
  getTaxonomyDefaultProductType,
  getTaxonomySchoolLevel,
} from "@/lib/taxonomySettings";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  ImagePlus,
  Loader2,
  PackageCheck,
  Plus,
  Save,
  ShoppingBag,
  Star,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  reference: string | null;
  description: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  availability_status: string | null;
  category: string | null;
  image_url: string | null;
  images: string[] | null;
  sizes: string | null;
  product_type: string | null;
  character_theme: string | null;
  school_level: string | null;
  brand: string | null;
  colors: string | null;
  target_age: string | null;
  gender: string | null;
  is_promo: boolean | null;
  is_favorite: boolean | null;
  is_new: boolean | null;
  is_pack: boolean | null;
};

type Variant = {
  id?: number;
  size: string;
  color: string;
  stock: string;
};

type PackItem = {
  id?: number;
  componentType: string;
  customComponentName: string;
  componentDescription: string;
  componentStock: string;
  requiredQuantity: string;
};

type ProductVariantRow = {
  id: number;
  size: string | null;
  color: string | null;
  stock: number | null;
};

type ProductPackItemRow = {
  id: number;
  component_name: string;
  component_description: string | null;
  component_stock: number | null;
  required_quantity: number | null;
};

const genderOptions = ["Fille", "Garçon", "Mixte"];

function getPackComponentName(item: PackItem) {
  if (item.componentType === "Autre") {
    return item.customComponentName.trim();
  }

  return item.componentType.trim();
}

function keepOnlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function toggleAvailabilityStatus(
  currentStatuses: string[],
  status: string,
  updateStatuses: (statuses: string[]) => void,
) {
  const nextStatuses = currentStatuses.includes(status)
    ? currentStatuses.filter((currentStatus) => currentStatus !== status)
    : [...currentStatuses, status];

  updateStatuses(nextStatuses.length > 0 ? nextStatuses : [status]);
}

function convertComponentNameToPackItem(
  item: ProductPackItemRow,
  packComponentOptions: string[],
): PackItem {
  const existingOption = packComponentOptions.find((option) => {
    return option.toLowerCase() === item.component_name.toLowerCase();
  });

  if (existingOption) {
    return {
      id: item.id,
      componentType: existingOption,
      customComponentName: "",
      componentDescription: item.component_description || "",
      componentStock: String(item.component_stock || 0),
      requiredQuantity: String(item.required_quantity || 1),
    };
  }

  return {
    id: item.id,
    componentType: "Autre",
    customComponentName: item.component_name,
    componentDescription: item.component_description || "",
    componentStock: String(item.component_stock || 0),
    requiredQuantity: String(item.required_quantity || 1),
  };
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { settings: taxonomySettings } = useTaxonomySettings();
  const categories = getTaxonomyCategoryLabels(taxonomySettings);
  const productTypes = taxonomySettings.productTypes;
  const characterThemes = taxonomySettings.characters;
  const schoolLevels = taxonomySettings.schoolLevels;
  const packComponentOptions = taxonomySettings.packComponents;

  const productId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const [name, setName] = useState("");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("");
  const [availabilityStatuses, setAvailabilityStatuses] = useState<string[]>([
    availabilityOptions[0],
  ]);

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
  const [isNew, setIsNew] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

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

  const isPack =
    category === "Packs scolaires" ||
    category === "PACK" ||
    productType === "Pack scolaire";

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !data) {
        setMessageType("error");
        setMessage("Produit introuvable.");
        setLoading(false);
        return;
      }

      const product = data as Product;

      setName(product.name || "");
      setReference(product.reference || "");
      setDescription(product.description || "");
      setPrice(String(product.price || ""));
      setOldPrice(product.old_price ? String(product.old_price) : "");
      setStock(String(product.stock || ""));
      setAvailabilityStatuses(
        parseAvailabilityStatuses(product.availability_status)
      );
      setCategory(
        product.category === "PACK" || product.category === "Scolaire"
          ? "Packs scolaires"
          : product.category || ""
      );
      setProductType(product.product_type || "");
      setCharacterTheme(product.character_theme || "");
      setSchoolLevel(product.school_level || "");
      setBrand(product.brand || "");
      setColors(product.colors || "");
      setTargetAge(product.target_age || "");
      setGender(product.gender || "");
      setSizes(product.sizes || "");
      setIsPromo(Boolean(product.is_promo));
      setIsFavorite(Boolean(product.is_favorite));
      setIsNew(Boolean(product.is_new));
      setImageUrl(product.image_url || "");
      setExistingImages(product.images || []);

      if (product.category === "Packs scolaires" || product.category === "PACK" || product.is_pack) {
        const { data: packRows } = await supabase
          .from("product_pack_items")
          .select("*")
          .eq("pack_product_id", productId)
          .order("id", { ascending: true });

        const convertedPackItems = ((packRows as ProductPackItemRow[]) || []).map(
          (packRow) =>
            convertComponentNameToPackItem(packRow, packComponentOptions),
        );

        setPackItems(
          convertedPackItems.length > 0
            ? convertedPackItems
            : [
                {
                  componentType: "",
                  customComponentName: "",
                  componentDescription: "",
                  componentStock: "",
                  requiredQuantity: "1",
                },
              ]
        );
      } else {
        const { data: variantRows } = await supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", productId)
          .order("id", { ascending: true });

        const convertedVariants = ((variantRows as ProductVariantRow[]) || []).map(
          (variant) => ({
            id: variant.id,
            size: variant.size || "",
            color: variant.color || "",
            stock: String(variant.stock || 0),
          })
        );

        setVariants(
          convertedVariants.length > 0
            ? convertedVariants
            : [
                {
                  size: "",
                  color: "",
                  stock: "",
                },
              ]
        );
      }

      setLoading(false);
    }

    if (productId) {
      fetchProduct();
    }
  }, [packComponentOptions, productId]);

  function handleImageSelection(e: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    setNewImages((currentImages) => [...currentImages, ...selectedFiles]);
  }

  function removeExistingImage(imageToRemove: string) {
    const filteredImages = existingImages.filter((image) => {
      return image !== imageToRemove;
    });

    setExistingImages(filteredImages);

    if (imageUrl === imageToRemove) {
      setImageUrl(filteredImages[0] || "");
    }
  }

  function removeNewImage(index: number) {
    setNewImages((currentImages) =>
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

  async function uploadNewImages() {
    const uploadedUrls: string[] = [];

    for (const image of newImages) {
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

  async function saveVariants() {
    await supabase.from("product_variants").delete().eq("product_id", productId);

    const validVariants = variants.filter((variant) => {
      return variant.size.trim() !== "" || variant.color.trim() !== "";
    });

    if (validVariants.length === 0) return;

    const variantsToInsert = validVariants.map((variant) => ({
      product_id: productId,
      size: variant.size,
      color: variant.color,
      stock: Number(variant.stock || 0),
    }));

    const { error } = await supabase
      .from("product_variants")
      .insert(variantsToInsert);

    if (error) {
      throw new Error(error.message);
    }
  }

  async function savePackItems() {
    await supabase
      .from("product_pack_items")
      .delete()
      .eq("pack_product_id", productId);

    const validPackItems = packItems.filter((item) => {
      return getPackComponentName(item) !== "";
    });

    if (validPackItems.length === 0) return;

    const packItemsToInsert = validPackItems.map((item) => ({
      pack_product_id: productId,
      component_name: getPackComponentName(item),
      component_description: item.componentDescription,
      component_stock: Number(item.componentStock || 0),
      required_quantity: Number(item.requiredQuantity || 1),
    }));

    const { error } = await supabase
      .from("product_pack_items")
      .insert(packItemsToInsert);

    if (error) {
      throw new Error(error.message);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (!name.trim()) {
        setMessageType("error");
        setMessage("Le nom du produit est obligatoire.");
        setSaving(false);
        return;
      }

      if (!price || Number(price) <= 0) {
        setMessageType("error");
        setMessage("Le prix du produit est obligatoire.");
        setSaving(false);
        return;
      }

      if (!category) {
        setMessageType("error");
        setMessage("La catégorie du produit est obligatoire.");
        setSaving(false);
        return;
      }

      if (isPack) {
        const validPackItems = packItems.filter((item) => {
          return getPackComponentName(item) !== "";
        });

        if (validPackItems.length === 0) {
          setMessageType("error");
          setMessage("Ajoutez au moins un composant dans le pack.");
          setSaving(false);
          return;
        }

        const hasInvalidOther = validPackItems.some((item) => {
          return item.componentType === "Autre" && !item.customComponentName;
        });

        if (hasInvalidOther) {
          setMessageType("error");
          setMessage(
            "Pour un composant “Autre”, renseignez le nom du composant."
          );
          setSaving(false);
          return;
        }
      }

      const uploadedUrls = await uploadNewImages();

      const finalImages = [...existingImages, ...uploadedUrls];
      const finalMainImage = imageUrl || finalImages[0] || "";

      const finalStock = isPack ? calculatePackStock() : calculateClassicStock();

      const { error } = await supabase
        .from("products")
        .update({
          name,
          reference,
          description,
          price: Number(price),
          old_price: oldPrice ? Number(oldPrice) : null,
          stock: finalStock,
          availability_status: encodeAvailabilityStatuses(availabilityStatuses),
          category,
          product_type: productType,
          character_theme: characterTheme,
          school_level: schoolLevel,
          brand,
          colors,
          target_age: targetAge,
          gender,
          sizes: isPack ? "" : sizes,
          image_url: finalMainImage,
          images: finalImages,
          is_promo: isPromo,
          is_favorite: isFavorite,
          is_new: isNew,
          is_pack: isPack,
        })
        .eq("id", productId);

      if (error) {
        setMessageType("error");
        setMessage("Erreur : " + error.message);
        setSaving(false);
        return;
      }

      if (isPack) {
        await savePackItems();
        await supabase.from("product_variants").delete().eq("product_id", productId);
      } else {
        await saveVariants();
        await supabase
          .from("product_pack_items")
          .delete()
          .eq("pack_product_id", productId);
      }

      setExistingImages(finalImages);
      setImageUrl(finalMainImage);
      setNewImages([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessageType("success");
      setMessage("Produit modifié avec succès.");
      setSaving(false);

      setTimeout(() => {
        router.push("/admin/produits");
      }, 900);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? "Erreur : " + error.message
          : "Une erreur est survenue."
      );
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell
        title="Modifier le produit"
        subtitle="Chargement du produit sélectionné."
      >
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-[#1db7bd]"
            strokeWidth={2.5}
          />

          <p className="mt-4 font-black text-[#1db7bd]">
            Chargement du produit...
          </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Modifier le produit"
      subtitle="Mettez à jour les informations, les images, les stocks et les packs."
    >
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <Link
          href="/admin/produits"
          className="flex w-fit items-center gap-2 rounded-full border-2 border-[#1db7bd] px-5 py-3 font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
          Retour aux produits
        </Link>

        <Link
          href={`/produit/${productId}`}
          className="flex w-fit items-center gap-2 rounded-full bg-[#fff9cf] px-5 py-3 font-black text-[#c7a900] hover:bg-[#ffe773]"
        >
          <ShoppingBag size={20} strokeWidth={2.5} />
          Voir sur la boutique
        </Link>
      </div>

      {message && (
        <p
          className={`mb-6 rounded-2xl p-4 font-bold ${
            messageType === "success"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]"
      >
        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
              <PackageCheck size={30} strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl font-black text-gray-950">
              Aperçu produit
            </h2>

            <div className="mt-6 overflow-hidden rounded-[1.7rem] bg-gray-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="h-[420px] w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-sm font-bold text-gray-400">
                  Aucune image principale
                </div>
              )}
            </div>

            <div className="mt-5">
              <h3 className="text-2xl font-black text-gray-950">
                {name || "Nom du produit"}
              </h3>

              <p className="mt-2 text-2xl font-black text-[#f36f45]">
                {Number(price || 0).toLocaleString("fr-FR")} FCFA
              </p>

              {oldPrice && (
                <p className="mt-1 text-sm font-black text-gray-400 line-through">
                  {Number(oldPrice || 0).toLocaleString("fr-FR")} FCFA
                </p>
              )}

              <p className="mt-2 text-sm font-bold text-gray-500">
                {getProductAvailabilityLabel(
                  encodeAvailabilityStatuses(availabilityStatuses)
                )}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f5] text-[#f36f45]">
              <ImagePlus size={30} strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl font-black text-gray-950">
              Images du produit
            </h2>

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

            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {existingImages.map((image) => (
                  <div
                    key={image}
                    className={`rounded-2xl border bg-white p-2 ${
                      imageUrl === image
                        ? "border-[#1db7bd] ring-2 ring-[#1db7bd]/20"
                        : "border-gray-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setImageUrl(image)}
                      className="block w-full overflow-hidden rounded-xl bg-gray-100"
                    >
                      <img
                        src={image}
                        alt="Image produit"
                        className="h-32 w-full object-cover object-top"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeExistingImage(image)}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-500 hover:bg-red-100"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                      Retirer
                    </button>
                  </div>
                ))}

                {newImages.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="rounded-2xl border border-orange-100 bg-orange-50 p-2"
                  >
                    <div className="overflow-hidden rounded-xl bg-white">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-32 w-full object-cover object-top"
                      />
                    </div>

                    <p className="mt-2 truncate text-xs font-bold text-orange-700">
                      Nouvelle image
                    </p>

                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-orange-600 hover:bg-orange-100"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-gray-950">
              Informations produit
            </h2>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-gray-700">
                  Nom du produit
                </span>

                <input
                  type="text"
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
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                    value={price}
                    onChange={(e) => setPrice(keepOnlyDigits(e.target.value))}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-gray-700">
                    Ancien prix
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(keepOnlyDigits(e.target.value))}
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
                    className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </label>
              )}

              <div>
                <p className="mb-2 block text-sm font-black text-gray-700">
                  Disponibilités proposées au client
                </p>

                <div className="grid gap-3 md:grid-cols-3">
                  {availabilityOptions.map((status) => (
                    <label
                      key={status}
                      className={`flex cursor-pointer items-center gap-3 rounded-[1.4rem] border-2 p-4 text-sm font-black transition ${
                        availabilityStatuses.includes(status)
                          ? "border-[#1db7bd] bg-[#e9fbfc] text-[#087f83]"
                          : "border-[#bfedf0] bg-white text-gray-700 hover:border-[#1db7bd]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[#1db7bd]"
                        checked={availabilityStatuses.includes(status)}
                        onChange={() =>
                          toggleAvailabilityStatus(
                            availabilityStatuses,
                            status,
                            setAvailabilityStatuses,
                          )
                        }
                      />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <KidiclassSelect
                  label="Catégorie principale"
                  value={category}
                  options={categories}
                  placeholder="Choisir une catégorie"
                  onChange={(value) => {
                    setCategory(value);
                    setProductType(
                      getTaxonomyDefaultProductType(taxonomySettings, value),
                    );
                    setSchoolLevel(
                      getTaxonomySchoolLevel(taxonomySettings, value),
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
                    className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                  />
                </label>
              )}

              <div className="rounded-[2rem] bg-[#fffdf7] p-5">
                <h3 className="mb-4 text-lg font-black text-gray-950">
                  Mise en avant
                </h3>

                <div className="grid gap-3 md:grid-cols-3">
                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white p-4">
                    <span className="flex items-center gap-2 font-black text-gray-950">
                      <Tag
                        size={18}
                        className="text-[#f36f45]"
                        strokeWidth={2.5}
                      />
                      Promo
                    </span>

                    <input
                      type="checkbox"
                      checked={isPromo}
                      onChange={(e) => setIsPromo(e.target.checked)}
                      className="h-5 w-5 accent-[#f36f45]"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white p-4">
                    <span className="flex items-center gap-2 font-black text-gray-950">
                      <Star
                        size={18}
                        className="text-[#c7a900]"
                        strokeWidth={2.5}
                      />
                      Coup de cœur
                    </span>

                    <input
                      type="checkbox"
                      checked={isFavorite}
                      onChange={(e) => setIsFavorite(e.target.checked)}
                      className="h-5 w-5 accent-[#c7a900]"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white p-4">
                    <span className="flex items-center gap-2 font-black text-gray-950">
                      <Sparkles
                        size={18}
                        className="text-[#1db7bd]"
                        strokeWidth={2.5}
                      />
                      Nouveauté
                    </span>

                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="h-5 w-5 accent-[#1db7bd]"
                    />
                  </label>
                </div>
              </div>
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

              <div className="mt-5 rounded-2xl bg-[#e9fbfc] p-4 text-sm font-bold leading-6 text-[#1db7bd]">
                Stock estimé : {calculateClassicStock()} article(s)
                disponible(s).
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
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f36f45] px-8 py-5 text-lg font-black text-white shadow-sm hover:bg-[#e85e33] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={22} className="animate-spin" strokeWidth={2.5} />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={22} strokeWidth={2.5} />
                Enregistrer les modifications
              </>
            )}
          </button>
        </section>
      </form>
    </AdminShell>
  );
}
