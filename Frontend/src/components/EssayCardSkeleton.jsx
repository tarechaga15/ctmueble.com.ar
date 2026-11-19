export default function EssayCardSkeleton() {
  const lineClass = "skeleton-shimmer essay-skeleton-line";

  return (
    <div className="pointer-events-none flex h-full min-h-[180px] w-full flex-col">
      <div className="flex h-full flex-col gap-3 overflow-hidden rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between gap-2">
          <div className={`h-5 w-[70%] max-w-[180px] rounded-md ${lineClass}`} />
          <div className={`h-5 w-20 rounded-full ${lineClass}`} />
        </div>
        <div className="mt-2 flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`h-4 w-4 shrink-0 rounded ${lineClass}`} />
              <div className={`h-4 w-[140px] rounded ${lineClass}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
