export type SchoolOfferGroup = "levels" | "packs" | "bags" | "snacks";

export type SchoolOfferCategory = {
  label: string;
  slug: string;
  group: SchoolOfferGroup;
  description: string;
  productType?: string;
  schoolLevel?: string;
};

export const schoolOfferCategories: SchoolOfferCategory[] = [
  {
    label: "Spécial PS/MS",
    slug: "special-ps-ms",
    group: "levels",
    schoolLevel: "PS/MS",
    description: "Des formats légers et faciles à manipuler pour les premières années de maternelle.",
  },
  {
    label: "Maternelle taille standard",
    slug: "maternelle-taille-standard",
    group: "levels",
    schoolLevel: "Maternelle",
    description: "Des essentiels adaptés au quotidien des enfants en maternelle.",
  },
  {
    label: "Maternelle / CP",
    slug: "maternelle-cp",
    group: "levels",
    schoolLevel: "Maternelle/CP",
    description: "Des articles évolutifs pour accompagner le passage de la maternelle au primaire.",
  },
  {
    label: "CP",
    slug: "cp",
    group: "levels",
    schoolLevel: "CP",
    description: "Tout le nécessaire pour commencer l'école primaire bien équipé.",
  },
  {
    label: "CE",
    slug: "ce",
    group: "levels",
    schoolLevel: "CE",
    description: "Des sacs et accessoires solides pour suivre le rythme des classes de CE.",
  },
  {
    label: "CE / CM",
    slug: "ce-cm",
    group: "levels",
    schoolLevel: "CE/CM",
    description: "Des modèles spacieux et pratiques pour les dernières années du primaire.",
  },
  {
    label: "Collège / Lycée",
    slug: "college-lycee",
    group: "levels",
    schoolLevel: "Collège/Lycée",
    description: "Des formats plus grands et actuels pour les collégiens et lycéens.",
  },
  {
    label: "Packs scolaires",
    slug: "packs-scolaires",
    group: "packs",
    productType: "Pack scolaire",
    description: "Des ensembles coordonnés pour préparer la rentrée en une seule fois.",
  },
  {
    label: "Sacs à dos",
    slug: "sacs-a-dos",
    group: "bags",
    productType: "Sac à dos",
    description: "Des sacs confortables, résistants et adaptés à chaque âge.",
  },
  {
    label: "Trousses",
    slug: "trousses",
    group: "bags",
    productType: "Trousse",
    description: "Des trousses pratiques aux couleurs des personnages préférés des enfants.",
  },
  {
    label: "Sacs à goûter",
    slug: "sacs-a-gouter",
    group: "bags",
    productType: "Sac à goûter",
    description: "Des formats compacts pour transporter facilement le goûter.",
  },
  {
    label: "Sets gourde & boîte à goûter",
    slug: "sets-gourde-boite-gouter",
    group: "snacks",
    productType: "Set gourde et boîte à goûter",
    description: "Des ensembles assortis pour les repas et les pauses de la journée.",
  },
  {
    label: "Gourdes",
    slug: "gourdes",
    group: "snacks",
    productType: "Gourde",
    description: "Des gourdes faciles à utiliser et à emporter partout.",
  },
  {
    label: "Boîtes à goûter",
    slug: "boites-a-gouter",
    group: "snacks",
    productType: "Boîte à goûter",
    description: "Des boîtes pratiques pour conserver les goûters bien rangés.",
  },
];

export const schoolOfferGroups = [
  {
    id: "levels" as const,
    label: "Par niveau",
    shortDescription: "De la maternelle au lycée",
  },
  {
    id: "packs" as const,
    label: "Packs scolaires",
    shortDescription: "Les ensembles complets",
  },
  {
    id: "bags" as const,
    label: "Sacs & trousses",
    shortDescription: "Pour transporter et organiser",
  },
  {
    id: "snacks" as const,
    label: "Goûter & gourdes",
    shortDescription: "Pour les pauses de la journée",
  },
];

export const schoolOfferCategoryLabels = schoolOfferCategories.map(
  (category) => category.label,
);

export const schoolProductTypes = [
  "Pack scolaire",
  "Sac à dos",
  "Sac à roulette",
  "Trousse",
  "Sac à goûter",
  "Set gourde et boîte à goûter",
  "Gourde",
  "Boîte à goûter",
  "Accessoire scolaire",
  "Autre",
];

export const characterThemes = [
  "Ariel",
  "Avengers",
  "Barbie",
  "Batman",
  "Bluey",
  "Cars",
  "Dora",
  "Elena d'Avalor",
  "Gabby's Dollhouse",
  "Hello Kitty",
  "Hot Wheels",
  "Ladybug",
  "LOL Surprise",
  "Mario",
  "Mickey",
  "Minions",
  "Minnie",
  "My Little Pony",
  "Pat Patrouille",
  "Peppa Pig",
  "Pokémon",
  "Princesses Disney",
  "Pyjamasques",
  "Reine des Neiges",
  "Roi Lion / Simba",
  "Sam le Pompier",
  "Shimmer and Shine",
  "Sofia",
  "Sonic",
  "Spiderman",
  "Stitch",
  "Toy Story",
  "Vaiana",
  "Wish / Asha",
  "Sans thème",
];

export const schoolLevels = [
  "Non concerné",
  "PS/MS",
  "Maternelle",
  "Maternelle/CP",
  "CP",
  "CE",
  "CE/CM",
  "Collège/Lycée",
];

export function getSchoolOfferCategoryBySlug(slug: string) {
  return schoolOfferCategories.find((category) => category.slug === slug);
}

export function getSchoolOfferCategory(label: string) {
  return schoolOfferCategories.find((category) => category.label === label);
}
