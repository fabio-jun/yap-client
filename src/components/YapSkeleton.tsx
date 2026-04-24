export default function YapSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse border-b border-base-300 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-full bg-base-300 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 rounded bg-base-300" />
                <div className="h-3 w-16 rounded bg-base-300" />
              </div>
              <div className="h-4 w-full rounded bg-base-300" />
              <div className="h-4 w-3/4 rounded bg-base-300" />
              <div className="mt-3 flex gap-4">
                <div className="h-5 w-10 rounded bg-base-300" />
                <div className="h-5 w-10 rounded bg-base-300" />
                <div className="h-5 w-10 rounded bg-base-300" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
