import {
  characterThemes,
  schoolLevels,
  schoolOfferCategories,
  schoolProductTypes,
  type SchoolOfferGroup,
} from "./schoolOffer";
import { supabase } from "./supabase";

export type TaxonomyDepartmentId =
  | "ecole-sorties"
  | "repas-gouters"
  | "piscine-plage"
  | "accessoires-jeux";

export type TaxonomyCategory = {
  label: string;
  departmentId: TaxonomyDepartmentId;
  productType?: string;
  schoolLevel?: string;
  schoolGroup?: SchoolOfferGroup;
};

export type TaxonomySettings = {
  categories: TaxonomyCategory[];
  productTypes: string[];
  characters: string[];
  schoolLevels: string[];
  packComponents: string[];
};

const SETTINGS_CATEGORY = "__KIDICLASS_SETTINGS__";
const SETTINGS_PRODUCT_TYPE = "taxonomy_settings";
const SETTINGS_NAME = "Réglages boutique";

const departmentDefaultProductTypes: Partial<
  Record<TaxonomyDepartmentId, string>
> = {
  "ecole-sorties": "Accessoire scolaire",
  "repas-gouters": "Gourde",
  "piscine-plage": "Accessoire de plage",
  "accessoires-jeux": "Accessoire",
};

const extraDefaultCategories: TaxonomyCategory[] = [
  {
    label: "Sacs de sortie",
    departmentId: "ecole-sorties",
    productType: "Sac de sortie",
  },
  {
    label: "Maillots de bain",
    departmentId: "piscine-plage",
    productType: "Maillot de bain",
  },
  {
    label: "Serviettes de plage",
    departmentId: "piscine-plage",
    productType: "Serviette de plage",
  },
  {
    label: "Accessoires de plage",
    departmentId: "piscine-plage",
    productType: "Accessoire de plage",
  },
  {
    label: "Sacs à main",
    departmentId: "accessoires-jeux",
    productType: "Sac à main",
  },
  {
    label: "Horloges",
    departmentId: "accessoires-jeux",
    productType: "Horloge",
  },
  {
    label: "Jeux",
    departmentId: "accessoires-jeux",
    productType: "Jeu",
  },
];

const defaultMealCategories: TaxonomyCategory[] = [
  {
    label: "Gourdes",
    departmentId: "repas-gouters",
    productType: "Gourde",
  },
  {
    label: "Boîtes à goûter",
    departmentId: "repas-gouters",
    productType: "Boîte à goûter",
  },
  {
    label: "Sacs à goûter",
    departmentId: "repas-gouters",
    productType: "Sac à goûter",
  },
  {
    label: "Sets gourde & boîte à goûter",
    departmentId: "repas-gouters",
    productType: "Set gourde et boîte à goûter",
  },
];

function uniqueStrings(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

function uniqueCategories(categories: TaxonomyCategory[]) {
  const seen = new Set<string>();

  return categories.filter((category) => {
    const label = category.label.trim();
    if (!label) return false;

    const key = label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);

    category.label = label;
    return true;
  });
}

export const defaultTaxonomySettings: TaxonomySettings = {
  categories: uniqueCategories([
    ...schoolOfferCategories.map((category) => ({
      label: category.label,
      departmentId: "ecole-sorties" as const,
      productType: category.productType,
      schoolLevel: category.schoolLevel,
      schoolGroup: category.group,
    })),
    ...defaultMealCategories,
    ...extraDefaultCategories,
  ]),
  productTypes: uniqueStrings([
    ...schoolProductTypes,
    "Sac de sortie",
    "Sac à main",
    "Maillot de bain",
    "Serviette de plage",
    "Accessoire de plage",
    "Horloge",
    "Jeu",
    "Accessoire",
  ]),
  characters: uniqueStrings(characterThemes),
  schoolLevels: uniqueStrings(schoolLevels),
  packComponents: uniqueStrings([
    "Sac à dos",
    "Sac à roulette",
    "Sac à goûter",
    "Set gourde et boîte à goûter",
    "Boîte à goûter",
    "Gourde",
    "Trousse",
    "Autre",
  ]),
};

export function sanitizeTaxonomySettings(
  settings: Partial<TaxonomySettings> | null | undefined,
): TaxonomySettings {
  const source = settings || {};

  const categories =
    Array.isArray(source.categories) && source.categories.length > 0
      ? source.categories
      : defaultTaxonomySettings.categories;

  return {
    categories: uniqueCategories(
      categories
        .map((category) => ({
          label: String(category.label || "").trim(),
          departmentId: [
            "ecole-sorties",
            "repas-gouters",
            "piscine-plage",
            "accessoires-jeux",
          ].includes(category.departmentId)
            ? category.departmentId
            : "ecole-sorties",
          productType: category.productType?.trim() || "",
          schoolLevel: category.schoolLevel?.trim() || "",
          schoolGroup: category.schoolGroup,
        }))
        .filter((category) => category.label),
    ),
    productTypes: uniqueStrings(
      Array.isArray(source.productTypes) && source.productTypes.length > 0
        ? source.productTypes
        : defaultTaxonomySettings.productTypes,
    ),
    characters: uniqueStrings(
      Array.isArray(source.characters) && source.characters.length > 0
        ? source.characters
        : defaultTaxonomySettings.characters,
    ),
    schoolLevels: uniqueStrings(
      Array.isArray(source.schoolLevels) && source.schoolLevels.length > 0
        ? source.schoolLevels
        : defaultTaxonomySettings.schoolLevels,
    ),
    packComponents: uniqueStrings(
      Array.isArray(source.packComponents) && source.packComponents.length > 0
        ? source.packComponents
        : defaultTaxonomySettings.packComponents,
    ),
  };
}

export function getTaxonomyCategoryLabels(settings: TaxonomySettings) {
  return settings.categories.map((category) => category.label);
}

export function getTaxonomyDepartmentCategories(
  settings: TaxonomySettings,
  departmentId: TaxonomyDepartmentId | "personnages" | string,
) {
  if (departmentId === "personnages") return [];

  return settings.categories
    .filter((category) => category.departmentId === departmentId)
    .map((category) => category.label);
}

export function getTaxonomyDefaultProductType(
  settings: TaxonomySettings,
  categoryLabel: string,
) {
  const category = settings.categories.find(
    (item) => item.label === categoryLabel,
  );

  return (
    category?.productType ||
    departmentDefaultProductTypes[category?.departmentId || "ecole-sorties"] ||
    ""
  );
}

export function getTaxonomySchoolLevel(
  settings: TaxonomySettings,
  categoryLabel: string,
) {
  return (
    settings.categories.find((category) => category.label === categoryLabel)
      ?.schoolLevel || "Non concerné"
  );
}

export function getTaxonomyNavigationItems(
  settings: TaxonomySettings,
  departmentId: string,
) {
  if (departmentId === "personnages") {
    return settings.characters
      .filter((character) => character !== "Sans thème")
      .map((character) => ({
        label: character,
        href: `/personnages?character=${encodeURIComponent(character)}`,
      }));
  }

  return getTaxonomyDepartmentCategories(settings, departmentId).map(
    (category) => ({
      label: category,
      href: `/${departmentId}?category=${encodeURIComponent(category)}`,
    }),
  );
}

export async function loadTaxonomySettings() {
  const { data, error } = await supabase
    .from("products")
    .select("id,description")
    .eq("category", SETTINGS_CATEGORY)
    .eq("product_type", SETTINGS_PRODUCT_TYPE)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.description) {
    return defaultTaxonomySettings;
  }

  try {
    return sanitizeTaxonomySettings(JSON.parse(data.description));
  } catch {
    return defaultTaxonomySettings;
  }
}

export async function saveTaxonomySettings(settings: TaxonomySettings) {
  const sanitizedSettings = sanitizeTaxonomySettings(settings);
  const description = JSON.stringify(sanitizedSettings);

  const { data: existing, error: existingError } = await supabase
    .from("products")
    .select("id")
    .eq("category", SETTINGS_CATEGORY)
    .eq("product_type", SETTINGS_PRODUCT_TYPE)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("products")
      .update({
        description,
        is_archived: true,
      })
      .eq("id", existing.id);

    if (error) throw error;
    return sanitizedSettings;
  }

  const { error } = await supabase.from("products").insert([
    {
      name: SETTINGS_NAME,
      reference: "KIDI_SETTINGS_TAXONOMY",
      description,
      price: 1,
      old_price: null,
      stock: 0,
      availability_status: "",
      category: SETTINGS_CATEGORY,
      product_type: SETTINGS_PRODUCT_TYPE,
      character_theme: "",
      school_level: "",
      brand: "",
      colors: "",
      target_age: "",
      gender: "",
      sizes: "",
      image_url: "",
      images: [],
      is_promo: false,
      is_favorite: false,
      is_new: false,
      is_pack: false,
      is_archived: true,
    },
  ]);

  if (error) throw error;
  return sanitizedSettings;
}
