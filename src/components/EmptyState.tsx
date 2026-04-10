import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-base-content/40 animate-fade-in-up">
      <div className="mb-4 p-4 rounded-2xl bg-base-200">{icon}</div>
      <p className="font-semibold text-lg">{title}</p>
      {description && <p className="text-sm mt-1 max-w-xs text-center">{description}</p>}
    </div>
  );
}
