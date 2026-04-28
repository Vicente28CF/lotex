export function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <div className="hero-grid relative overflow-hidden rounded-[36px] border border-white/70 bg-white/[0.68] px-5 py-6 soft-ring sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="h-6 w-32 rounded-full bg-[#ece5dd]"></div>
            <div className="space-y-3">
              <div className="h-12 w-full max-w-xl rounded-2xl bg-[#ece5dd]"></div>
              <div className="h-12 w-3/4 max-w-lg rounded-2xl bg-[#ece5dd]"></div>
            </div>
            <div className="h-24 w-full rounded-2xl bg-[#ece5dd]"></div>
          </div>
          <div className="space-y-4">
            <div className="h-40 w-full rounded-[30px] bg-[#ece5dd]"></div>
            <div className="h-48 w-full rounded-[30px] bg-[#ece5dd]"></div>
          </div>
        </div>
      </div>
      {/* List Skeleton */}
      <div className="mt-14 space-y-6">
        <div className="h-8 w-64 rounded-xl bg-[#ece5dd]"></div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-[30px] bg-[#ece5dd]"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InfoTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white/90 px-5 py-5 shadow-[0_18px_35px_rgba(15,23,42,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">{label}</p>
      <p className="mt-3 text-lg font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-stone">{detail}</p>
    </div>
  );
}

export function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

export function MicroFeature({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-[22px] border border-line/80 bg-[#fcfaf7] px-4 py-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-6 text-stone">{copy}</p>
    </div>
  );
}
