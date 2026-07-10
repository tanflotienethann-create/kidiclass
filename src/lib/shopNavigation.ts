import {
  characterThemes,
  schoolOfferCategories,
  schoolOfferCategoryLabels,
  schoolProductTypes,
} from "./schoolOffer";

export type ShopDepartment = {
  id: string;
  label: string;
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  variant: "school" | "meal" | "beach" | "play" | "characters";
  palette: {
    accent: string;
    soft: string;
    ink: string;
  };
  categories: string[];
};

export const outingCategories = ["Sacs de sortie"];
export const educationCategories = schoolOfferCategories
  .filter(
    (category) =>
      category.group !== "snacks" && category.label !== "Sacs à goûter",
  )
  .map((category) => category.label);
export const mealCategories = [
  "Gourdes",
  "Boîtes à goûter",
  "Sets gourde & boîte à goûter",
];
export const beachCategories = [
  "Maillots de bain",
  "Serviettes de plage",
  "Accessoires de plage",
];
export const playCategories = ["Sacs à main", "Horloges", "Jeux"];

export const shopCategoryLabels = Array.from(
  new Set([
    ...schoolOfferCategoryLabels,
    ...outingCategories,
    ...beachCategories,
    ...playCategories,
  ]),
);

export const shopProductTypes = Array.from(
  new Set([
    ...schoolProductTypes,
    "Sac de sortie",
    "Sac à main",
    "Maillot de bain",
    "Serviette de plage",
    "Accessoire de plage",
    "Horloge",
    "Jeu",
  ]),
);

export const shopDepartments: ShopDepartment[] = [
  {
    id: "ecole-sorties",
    label: "École et sorties",
    href: "/ecole-sorties",
    eyebrow: "École et sorties",
    title: "Bien équipé pour apprendre et découvrir le monde",
    description:
      "Retrouvez les offres scolaires par niveau, les packs, les sacs et les essentiels pour les sorties.",
    variant: "school",
    palette: { accent: "#e0a800", soft: "#fff3bf", ink: "#6f4e00" },
    categories: [...educationCategories, ...outingCategories],
  },
  {
    id: "repas-gouters",
    label: "Repas et goûters",
    href: "/repas-gouters",
    eyebrow: "Repas et goûters",
    title: "Des pauses bien préparées, partout",
    description:
      "Gourdes, boîtes à goûter et sets assortis pour l'école comme pour les sorties.",
    variant: "meal",
    palette: { accent: "#f36f45", soft: "#fff0e8", ink: "#9a3412" },
    categories: mealCategories,
  },
  {
    id: "piscine-plage",
    label: "Piscine et plage",
    href: "/piscine-plage",
    eyebrow: "Piscine et plage",
    title: "Prêts pour l'eau et le soleil",
    description:
      "Maillots de bain, serviettes et accessoires pratiques pour la piscine et la plage.",
    variant: "beach",
    palette: { accent: "#0089a7", soft: "#dff8ff", ink: "#075985" },
    categories: beachCategories,
  },
  {
    id: "accessoires-jeux",
    label: "Accessoires et jeux",
    href: "/accessoires-jeux",
    eyebrow: "Accessoires et jeux",
    title: "Des détails utiles et beaucoup de fun",
    description:
      "Sacs à main pour filles, horloges et jeux pour compléter le quotidien des enfants.",
    variant: "play",
    palette: { accent: "#e84a77", soft: "#fff1f5", ink: "#9d174d" },
    categories: playCategories,
  },
  {
    id: "personnages",
    label: "Personnages",
    href: "/personnages",
    eyebrow: "Personnages",
    title: "Leurs héros préférés réunis ici",
    description:
      "Choisissez un personnage et découvrez tous les articles disponibles dans son univers.",
    variant: "characters",
    palette: { accent: "#7c3aed", soft: "#f2edff", ink: "#5b21b6" },
    categories: [],
  },
];

export const schoolNavigationItems = [
  ...schoolOfferCategories
    .filter((category) => educationCategories.includes(category.label))
    .map((category) => ({
    label: category.label,
    href: `/ecole-sorties?category=${encodeURIComponent(category.label)}`,
    })),
  {
    label: "Sacs de sortie",
    href: `/ecole-sorties?category=${encodeURIComponent("Sacs de sortie")}`,
  },
];

export function getDepartmentNavigationItems(departmentId: string) {
  const department = shopDepartments.find((item) => item.id === departmentId);
  if (!department) return [];

  if (department.id === "personnages") {
    return characterThemes
      .filter((character) => character !== "Sans thème")
      .map((character) => ({
        label: character,
        href: `/personnages?character=${encodeURIComponent(character)}`,
      }));
  }

  if (department.id === "ecole-sorties") return schoolNavigationItems;

  return department.categories.map((category) => ({
    label: category,
    href: `${department.href}?category=${encodeURIComponent(category)}`,
  }));
}

export function getDepartment(id: string) {
  return shopDepartments.find((department) => department.id === id);
}

const categoryProductTypes: Record<string, string> = {
  Gourdes: "Gourde",
  "Boîtes à goûter": "Boîte à goûter",
  "Sets gourde & boîte à goûter": "Set gourde et boîte à goûter",
  "Sacs de sortie": "Sac de sortie",
  "Maillots de bain": "Maillot de bain",
  "Serviettes de plage": "Serviette de plage",
  "Accessoires de plage": "Accessoire de plage",
  "Sacs à main": "Sac à main",
  Horloges: "Horloge",
  Jeux: "Jeu",
};

export function getDefaultProductType(category: string) {
  return categoryProductTypes[category] || "";
}
