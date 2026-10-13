"use client";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/magia-data";
import { portalCopy } from "@/lib/portal-copy";

export default function DailyClock({ lang, nextAt }: { lang: Lang; nextAt?: string }) {
  const [left, setLeft] = useState<string>("--:--:--");
  useEffect(() => {
    const update = () => {
      const next = nextAt ? Date.parse(nextAt) : (Math.floor(Date.now() / 86400000) + 1) * 86400000;
      const seconds = Math.max(0, Math.floor((next - Date.now()) / 1000));
      setLeft([Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(x => String(x).padStart(2, "0")).join(":"));
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [nextAt]);
  return <span className="daily-clock" aria-label={portalCopy[lang].next}>{left}</span>;
}
