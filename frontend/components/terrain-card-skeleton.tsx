// frontend/components/terrain-card-skeleton.tsx
export function TerrainCardSkeleton() {
  return (
    <article className="animate-pulse overflow-hidden rounded-[28px] border border-white/80 bg-white/88 shadow-panel">
      <div className="relative aspect-[1.05/1] bg-[#ece5dd]"></div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 h-4 w-24 rounded-full bg-[#ece5dd]"></div>
            <div className="h-6 w-48 rounded-full bg-[#e4d9cf]"></div>
          </div>
          <div className="h-6 w-16 rounded-full bg-[#ece5dd]"></div>
        </div>

        <div className="h-4 w-full rounded-full bg-[#ece5dd]"></div>
        <div className="h-4 w-3/4 rounded-full bg-[#ece5dd]"></div>

        <div className="flex items-center justify-between gap-4 border-t border-line/60 pt-4">
          <div className="h-6 w-32 rounded-full bg-[#e4d9cf]"></div>
          <div className="h-4 w-20 rounded-full bg-[#ece5dd]"></div>
        </div>
      </div>
    </article>
  );
}
