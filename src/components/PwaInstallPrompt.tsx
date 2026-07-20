"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Home, Smartphone, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const PROMPT_SEEN_KEY = "kidiclass_mobile_install_prompt_seen";

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

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export default function PwaInstallPrompt() {
  const pathname = usePathname();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandaloneMode());
  const [visible, setVisible] = useState(false);
  const [manualHelpVisible, setManualHelpVisible] = useState(() =>
    isIosDevice(),
  );

  const shouldHide = useMemo(() => {
    return (
      pathname.startsWith("/admin") ||
      pathname === "/login" ||
      pathname === "/register"
    );
  }, [pathname]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setVisible(false);
      sessionStorage.setItem(PROMPT_SEEN_KEY, "1");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (shouldHide || installed || !isMobileViewport()) return;
    if (sessionStorage.getItem(PROMPT_SEEN_KEY) === "1") return;

    const timeoutId = window.setTimeout(() => {
      setVisible(true);
    }, 850);

    return () => window.clearTimeout(timeoutId);
  }, [installed, shouldHide]);

  if (shouldHide || installed || !visible) {
    return null;
  }

  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setVisible(false);
        sessionStorage.setItem(PROMPT_SEEN_KEY, "1");
      }

      setInstallPrompt(null);
      return;
    }

    setManualHelpVisible(true);
  }

  function closePrompt() {
    setVisible(false);
    sessionStorage.setItem(PROMPT_SEEN_KEY, "1");
  }

  return (
    <div className="fixed inset-0 z-[10001] flex items-end bg-gray-950/40 px-3 pb-3 pt-12 backdrop-blur-sm md:hidden">
      <div className="w-full rounded-[2rem] border border-[#b9ecee] bg-white p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#087f83]">
            <Smartphone size={25} strokeWidth={2.6} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-base font-black leading-tight text-gray-950">
              Ajouter KidiClass à l&apos;écran d&apos;accueil
            </p>
            <p className="mt-1.5 text-xs font-bold leading-5 text-gray-500">
              Ouvrez la boutique plus vite, comme une vraie application mobile.
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

        {manualHelpVisible && (
          <div className="mt-4 rounded-2xl bg-[#fffdf7] p-3 text-xs font-bold leading-5 text-gray-600">
            {isIosDevice()
              ? `Sur iPhone : appuyez sur le bouton de partage Safari, puis choisissez "Ajouter à l'écran d'accueil".`
              : `Si le bouton ne lance pas l'installation, ouvrez le menu du navigateur, puis choisissez "Installer l'application" ou "Ajouter à l'écran d'accueil".`}
          </div>
        )}

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f36f45] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#e85e33]"
          >
            {installPrompt ? (
              <Download size={18} strokeWidth={2.6} />
            ) : (
              <Home size={18} strokeWidth={2.6} />
            )}
            Ajouter
          </button>

          <button
            type="button"
            onClick={closePrompt}
            className="min-h-12 rounded-full border-2 border-[#1db7bd] px-4 py-3 text-sm font-black text-[#087f83]"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
