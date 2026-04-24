import { cn } from "../lib/utils";

interface ScreenBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScreenBadge({ children, className }: ScreenBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex h-7 items-center rounded-full border border-primary/25 bg-primary/14 px-5 text-[10px] font-bold uppercase tracking-[0.34em] text-primary/90",
        className,
      )}
    >
      {children}
    </div>
  );
}
