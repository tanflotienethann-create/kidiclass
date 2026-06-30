"use client";

import {
  defaultTaxonomySettings,
  loadTaxonomySettings,
  type TaxonomySettings,
} from "@/lib/taxonomySettings";
import { useEffect, useState } from "react";

let cachedTaxonomySettings: TaxonomySettings | null = null;

export function cacheTaxonomySettings(settings: TaxonomySettings) {
  cachedTaxonomySettings = settings;
}

export function useTaxonomySettings() {
  const [settings, setSettings] = useState<TaxonomySettings>(
    cachedTaxonomySettings || defaultTaxonomySettings,
  );
  const [loading, setLoading] = useState(!cachedTaxonomySettings);

  useEffect(() => {
    let active = true;

    async function fetchSettings() {
      try {
        const loadedSettings = await loadTaxonomySettings();
        cachedTaxonomySettings = loadedSettings;

        if (active) {
          setSettings(loadedSettings);
        }
      } catch (error) {
        console.error("Erreur chargement réglages boutique :", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchSettings();

    return () => {
      active = false;
    };
  }, []);

  return { settings, loading };
}
