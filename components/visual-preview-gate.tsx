"use client";
import MagicExperience from './magic-experience';
import type { Lang } from '@/lib/locales';
export default function VisualPreviewGate({lang}:{lang:Lang}) {
  return <MagicExperience lang={lang}/>;
}
