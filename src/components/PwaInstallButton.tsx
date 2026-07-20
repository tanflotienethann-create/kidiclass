"use client";

import { getServiceWorkerRegistration } from "@/lib/pushClient";
import { Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

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

export default function PwaInstallButton({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandaloneMode());
  const [manualHelpVisible, setManualHelpVisible] = useState(false);

  useEffect(() => {
    void getServiceWorkerRegistration();

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (installed) return null;

  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }

    setManualHelpVisible((current) => !current);
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleInstall}
        className={`inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#1db7bd] bg-white font-black text-[#087f83] shadow-sm transition hover:bg-[#1db7bd] hover:text-white ${
          compact ? "h-11 px-3 text-xs" : "px-5 py-3 text-sm"
        }`}
      >
        {installPrompt ? (
          <Download size={18} strokeWidth={2.6} />
        ) : (
          <Smartphone size={18} strokeWidth={2.6} />
        )}
        <span>{compact ? "Installer" : "Installer KidiClass"}</span>
      </button>

      {manualHelpVisible && (
        <div className="absolute right-0 top-full z-[120] mt-2 w-[min(86vw,300px)] rounded-2xl border border-[#b9ecee] bg-white p-3 text-xs font-bold leading-5 text-gray-600 shadow-xl">
          {isIosDevice()
            ? `Sur iPhone, ouvrez le partage Safari, puis choisissez "Ajouter à l'écran d'accueil".`
            : `Ouvrez le menu du navigateur, puis choisissez "Installer l'application" ou "Ajouter à l'écran d'accueil".`}
        </div>
      )}
    </div>
  );
}
