export default function YapSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card bg-base-200 mb-3 animate-pulse">
          <div className="card-body p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-base-300 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 bg-base-300 rounded" />
                  <div className="h-3 w-16 bg-base-300 rounded" />
                </div>
                <div className="h-4 w-full bg-base-300 rounded" />
                <div className="h-4 w-3/4 bg-base-300 rounded" />
                <div className="flex gap-4 mt-2">
                  <div className="h-6 w-12 bg-base-300 rounded" />
                  <div className="h-6 w-8 bg-base-300 rounded" />
                  <div className="h-6 w-8 bg-base-300 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
