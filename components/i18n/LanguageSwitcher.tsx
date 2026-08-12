"use client";

import { usePathname, useRouter } from "next/navigation";
import { localeFromPath, stripLocale, ES_ROUTES } from "@/app/i18n/locale";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = localeFromPath(pathname);

  const go = () => {
    if (locale === "es") {
      router.push(stripLocale(pathname));
    } else {
      const base = pathname || "/";
      const target = ES_ROUTES.has(base) ? (base === "/" ? "/es" : "/es" + base) : "/es";
      router.push(target);
    }
  };

  return (
    <button
      type="button"
      onClick={go}
      className={`lang-switch ${className}`}
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a español"}
      title={locale === "es" ? "English" : "Español"}
      style={{
        background: "transparent",
        border: "1px solid currentColor",
        borderRadius: "999px",
        padding: "5px 10px",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.5px",
        color: "inherit",
        cursor: "pointer",
        lineHeight: 1,
      }}
    >
      {locale === "es" ? "EN" : "ES"}
    </button>
  );
}
