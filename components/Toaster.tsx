"use client";
import { useEffect, useState } from "react";

type T = { message: string; kind: "ok" | "error" };

export function toast(message: string, kind: T["kind"] = "ok") {
  window.dispatchEvent(new CustomEvent<T>("toast", { detail: { message, kind } }));
}

export function Toaster() {
  const [t, setT] = useState<T | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const h = (e: Event) => { setT((e as CustomEvent<T>).detail); clearTimeout(timer); timer = setTimeout(() => setT(null), 3500); };
    window.addEventListener("toast", h);
    return () => { window.removeEventListener("toast", h); clearTimeout(timer); };
  }, []);
  if (!t) return null;
  return (
    <div role="status" aria-live="polite"
      className={`fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded border px-4 py-2 text-sm shadow-sm md:bottom-6 ${t.kind === "error" ? "border-red-300 bg-red-50 text-red-800" : "border-line bg-white"}`}>
      {t.kind === "error" ? "Error: " : "Done: "}{t.message}
    </div>
  );
}
