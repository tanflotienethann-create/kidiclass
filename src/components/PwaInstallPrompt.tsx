"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Smartphone, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIosDevice() {
  if (typeof window === "undefined") return false;

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function PwaInstallPrompt() {
  const pathname = usePathname();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("kidiclass_install_prompt_closed") === "1";
  });
  const [installed, setInstalled] = useState(() => isStandaloneMode());

  const shouldHide = useMemo(() => {
    return pathname.startsWith("/admin") || pathname === "/login" || pathname === "/register";
  }, [pathname]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setDismissed(false);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setDismissed(true);
      localStorage.setItem("kidiclass_install_prompt_closed", "1");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (shouldHide || installed || dismissed) {
    return null;
  }

  const showIosHelp = isIosDevice() && !installPrompt;

  async function handleInstall() {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted" || choice.outcome === "dismissed") {
      setInstallPrompt(null);
      setDismissed(true);
      localStorage.setItem("kidiclass_install_prompt_closed", "1");
    }
  }

  function closePrompt() {
    setDismissed(true);
    localStorage.setItem("kidiclass_install_prompt_closed", "1");
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-[10001] mx-auto max-w-md md:hidden">
      <div className="rounded-3xl border border-[#b9ecee] bg-white p-3 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#087f83]">
            <Smartphone size={23} strokeWidth={2.6} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-gray-950">
              Ajouter KidiClass sur votre téléphone
            </p>
            <p className="mt-1 text-xs font-bold leading-5 text-gray-500">
              {showIosHelp
                ? "Sur iPhone : partagez la page, puis choisissez Ajouter à l’écran d’accueil."
                : "Installez le raccourci pour ouvrir la boutique plus vite."}
            </p>
          </div>

          <button
            type="button"
            onClick={closePrompt}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600"
            aria-label="Fermer"
          >
            <X size={18} strokeWidth={2.6} />
          </button>
        </div>

        {!showIosHelp && installPrompt && (
          <button
            type="button"
            onClick={handleInstall}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#f36f45] px-4 py-3 text-sm font-black text-white shadow-sm"
          >
            <Download size={18} strokeWidth={2.6} />
            Installer KidiClass
          </button>
        )}
      </div>
    </div>
  );
}
