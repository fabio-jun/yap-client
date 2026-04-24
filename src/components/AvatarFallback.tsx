import { cn } from "../lib/utils";

const AVATAR_PALETTES = [
  "bg-[oklch(72%_0.17_18)] text-[oklch(24%_0.05_18)]",
  "bg-[oklch(79%_0.16_78)] text-[oklch(26%_0.04_78)]",
  "bg-[oklch(76%_0.15_146)] text-[oklch(23%_0.04_146)]",
  "bg-[oklch(74%_0.14_214)] text-[oklch(98%_0.01_214)]",
  "bg-[oklch(71%_0.15_276)] text-[oklch(98%_0.01_276)]",
  "bg-[oklch(73%_0.14_332)] text-[oklch(24%_0.05_332)]",
];

function hashSeed(seed: string) {
  let hash = 0;

  for (const char of seed) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getInitial(label: string, fallback: string) {
  const trimmed = label.trim();
  return (trimmed[0] ?? fallback).toUpperCase();
}

export default function AvatarFallback({
  label,
  className,
  fallback = "Y",
}: {
  label: string;
  className?: string;
  fallback?: string;
}) {
  const palette = AVATAR_PALETTES[hashSeed(label || fallback) % AVATAR_PALETTES.length];

  return (
    <div className={cn("flex h-full w-full items-center justify-center font-bold", palette, className)}>
      {getInitial(label, fallback)}
    </div>
  );
}
