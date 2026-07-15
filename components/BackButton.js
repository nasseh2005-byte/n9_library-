"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ fallback = "/library", label = "العودة" }) {
  const router = useRouter();

  function goBack() {
    try {
      const previous = document.referrer ? new URL(document.referrer) : null;
      if (previous?.origin === window.location.origin) {
        router.back();
        return;
      }
    } catch { }
    router.push(fallback);
  }

  return (
    <button type="button" onClick={goBack} className="btn-ghost w-fit gap-2 text-sm" aria-label={label}>
      <span aria-hidden="true" className="text-base">←</span>
      {label}
    </button>
  );
}
