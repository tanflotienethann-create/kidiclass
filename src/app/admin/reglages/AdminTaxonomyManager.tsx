"use client";

import {
  defaultTaxonomySettings,
  saveTaxonomySettings,
  type TaxonomyCategory,
  type TaxonomyDepartmentId,
  type TaxonomySettings,
} from "@/lib/taxonomySettings";
import {
  cacheTaxonomySettings,
  useTaxonomySettings,
} from "@/hooks/useTaxonomySettings";
import {
  LayoutGrid,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const departmentOptions: Array<{
  label: string;
  value: TaxonomyDepartmentId;
}> = [
  { label: "École et sorties", value: "ecole-sorties" },
  { label: "Repas et goûters", value: "repas-gouters" },
  { label: "Piscine et plage", value: "piscine-plage" },
  { label: "Accessoires et jeux", value: "accessoires-jeux" },
];

function cloneSettings(settings: TaxonomySettings): TaxonomySettings {
  return JSON.parse(JSON.stringify(settings)) as TaxonomySettings;
}

function makeEmptyCategory(): TaxonomyCategory {
  return {
    label: "",
    departmentId: "ecole-sorties",
    productType: "",
    schoolLevel: "Non concerné",
  };
}

function updateArrayItem(
  values: string[],
  index: number,
  value: string,
) {
  return values.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function removeArrayItem(values: string[], index: number) {
  return values.filter((_, itemIndex) => itemIndex !== index);
}

type StringListEditorProps = {
  title: string;
  description: string;
  values: string[];
  accentClass: string;
  onChange: (values: string[]) => void;
};

function StringListEditor({
  title,
  description,
  values,
  accentClass,
  onChange,
}: StringListEditorProps) {
  return (
    <section className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className={`text-2xl font-black ${accentClass}`}>{title}</h2>
        <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
          {description}
        </p>
      </div>

      <div className="space-y-3">
        {values.map((value, index) => (
          <div key={`${title}-${index}`} className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(event) =>
                onChange(updateArrayItem(values, index, event.target.value))
              }
              className="min-w-0 flex-1 rounded-[1.2rem] border-2 border-[#bfedf0] bg-white px-4 py-3 font-bold text-gray-950 outline-none focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
            />
            <button
              type="button"
              onClick={() => onChange(removeArrayItem(values, index))}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-red-50 text-red-500 transition hover:bg-red-100"
              aria-label={`Retirer ${value || "cette ligne"}`}
            >
              <Trash2 size={18} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e9fbfc] px-5 py-3 text-sm font-black text-[#087f83] transition hover:bg-[#1db7bd] hover:text-white"
      >
        <Plus size={18} strokeWidth={2.5} />
        Ajouter
      </button>
    </section>
  );
}

export default function AdminTaxonomyManager() {
  const { settings: loadedSettings, loading } = useTaxonomySettings();
  const [settings, setSettings] = useState<TaxonomySettings>(
    cloneSettings(defaultTaxonomySettings),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSettings(cloneSettings(loadedSettings));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadedSettings]);

  const categoryCountByDepartment = useMemo(() => {
    return departmentOptions.map((department) => ({
      ...department,
      count: settings.categories.filter(
        (category) => category.departmentId === department.value,
      ).length,
    }));
  }, [settings.categories]);

  function updateCategory(
    index: number,
    field: keyof TaxonomyCategory,
    value: string,
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      categories: currentSettings.categories.map((category, categoryIndex) =>
        categoryIndex === index
          ? {
              ...category,
              [field]: value,
            }
          : category,
      ),
    }));
  }

  function addCategory() {
    setSettings((currentSettings) => ({
      ...currentSettings,
      categories: [...currentSettings.categories, makeEmptyCategory()],
    }));
  }

  function removeCategory(index: number) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      categories: currentSettings.categories.filter(
        (_, categoryIndex) => categoryIndex !== index,
      ),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const savedSettings = await saveTaxonomySettings(settings);
      cacheTaxonomySettings(savedSettings);
      setSettings(cloneSettings(savedSettings));
      setMessageType("success");
      setMessage("Réglages enregistrés. La boutique utilisera ces listes automatiquement.");
    } catch (error) {
      console.error(error);
      setMessageType("error");
      setMessage("Impossible d’enregistrer les réglages pour le moment.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-sm">
        <Loader2
          className="mx-auto animate-spin text-[#1db7bd]"
          size={34}
          strokeWidth={2.5}
        />
        <p className="mt-4 font-black text-gray-600">
          Chargement des réglages boutique...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-[1.5rem] px-5 py-4 text-sm font-black ${
            messageType === "success"
              ? "bg-[#e9fbfc] text-[#087f83]"
              : "bg-red-50 text-red-500"
          }`}
        >
          {message}
        </div>
      )}

      <section className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff3bf] text-[#9a6b00]">
              <LayoutGrid size={30} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-gray-950">
              Catégories principales
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-gray-500">
              Associez chaque catégorie à un univers. Elle apparaîtra dans les
              filtres, les pages spécialisées et le formulaire d’ajout produit.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[420px]">
            {categoryCountByDepartment.map((department) => (
              <div
                key={department.value}
                className="rounded-[1.2rem] bg-[#fffdf7] px-4 py-3"
              >
                <p className="text-xs font-black uppercase text-gray-500">
                  {department.label}
                </p>
                <p className="mt-1 text-2xl font-black text-[#087f83]">
                  {department.count}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {settings.categories.map((category, index) => (
            <div
              key={`${category.label}-${index}`}
              className="grid gap-3 rounded-[1.4rem] border border-gray-100 bg-[#fffdf7] p-4 lg:grid-cols-[1.2fr_1fr_1fr_auto]"
            >
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-gray-500">
                  Catégorie
                </span>
                <input
                  type="text"
                  value={category.label}
                  onChange={(event) =>
                    updateCategory(index, "label", event.target.value)
                  }
                  className="w-full rounded-[1.2rem] border-2 border-[#bfedf0] bg-white px-4 py-3 font-bold text-gray-950 outline-none focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-gray-500">
                  Univers
                </span>
                <select
                  value={category.departmentId}
                  onChange={(event) =>
                    updateCategory(index, "departmentId", event.target.value)
                  }
                  className="w-full rounded-[1.2rem] border-2 border-[#bfedf0] bg-white px-4 py-3 font-black text-gray-950 outline-none focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                >
                  {departmentOptions.map((department) => (
                    <option key={department.value} value={department.value}>
                      {department.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-gray-500">
                  Type par défaut
                </span>
                <input
                  type="text"
                  value={category.productType || ""}
                  onChange={(event) =>
                    updateCategory(index, "productType", event.target.value)
                  }
                  className="w-full rounded-[1.2rem] border-2 border-[#bfedf0] bg-white px-4 py-3 font-bold text-gray-950 outline-none focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
                  placeholder="Ex : Sac à dos"
                />
              </label>

              <button
                type="button"
                onClick={() => removeCategory(index)}
                className="flex h-12 w-12 items-center justify-center self-end rounded-[1.2rem] bg-red-50 text-red-500 transition hover:bg-red-100"
                aria-label={`Retirer ${category.label || "cette catégorie"}`}
              >
                <Trash2 size={18} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addCategory}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#fff3bf] px-5 py-3 text-sm font-black text-[#8b7100] transition hover:bg-[#e0a800] hover:text-white"
        >
          <Plus size={18} strokeWidth={2.5} />
          Ajouter une catégorie
        </button>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <StringListEditor
          title="Types de produit"
          description="Ex : sac à dos, gourde, maillot, jeu, trousse..."
          values={settings.productTypes}
          accentClass="text-[#f36f45]"
          onChange={(productTypes) =>
            setSettings((currentSettings) => ({
              ...currentSettings,
              productTypes,
            }))
          }
        />

        <StringListEditor
          title="Personnages"
          description="Ajoutez les héros, licences ou thèmes qui servent aux filtres."
          values={settings.characters}
          accentClass="text-[#7c3aed]"
          onChange={(characters) =>
            setSettings((currentSettings) => ({
              ...currentSettings,
              characters,
            }))
          }
        />

        <StringListEditor
          title="Classes / niveaux scolaires"
          description="Ces niveaux apparaissent dans le formulaire produit et les filtres."
          values={settings.schoolLevels}
          accentClass="text-[#087f83]"
          onChange={(schoolLevels) =>
            setSettings((currentSettings) => ({
              ...currentSettings,
              schoolLevels,
            }))
          }
        />

        <StringListEditor
          title="Composants de packs"
          description="Options utilisées quand l’admin compose un pack scolaire."
          values={settings.packComponents}
          accentClass="text-[#9a6b00]"
          onChange={(packComponents) =>
            setSettings((currentSettings) => ({
              ...currentSettings,
              packComponents,
            }))
          }
        />
      </div>

      <div className="sticky bottom-4 z-20 rounded-[2rem] border border-gray-100 bg-white/95 p-4 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-[#f36f45]" size={24} strokeWidth={2.5} />
            <p className="text-sm font-black text-gray-700">
              Enregistrez pour appliquer les changements sur la boutique.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setSettings(cloneSettings(defaultTaxonomySettings))}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-black text-gray-700 transition hover:border-[#f36f45] hover:text-[#f36f45]"
            >
              <Undo2 size={18} strokeWidth={2.5} />
              Valeurs par défaut
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1db7bd] px-6 py-3 text-sm font-black text-white transition hover:bg-[#087f83] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={18} strokeWidth={2.5} />
              ) : (
                <Save size={18} strokeWidth={2.5} />
              )}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
