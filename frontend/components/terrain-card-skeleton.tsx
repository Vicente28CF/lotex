export function TerrainCardSkeleton() {
  return (
    <article className="animate-pulse overflow-hidden rounded-2xl bg-white">
      <div className="aspect-[4/3] rounded-2xl bg-stone/10" />

      <div className="space-y-2 px-1 pt-3 pb-1">
        <div className="flex justify-between gap-4">
          <div className="h-4 w-32 rounded-full bg-stone/15" />
          <div className="h-4 w-16 rounded-full bg-stone/10" />
        </div>
        <div className="h-3.5 w-24 rounded-full bg-stone/10" />
        <div className="h-5 w-28 rounded-full bg-stone/15" />
      </div>
    </article>
  );
}