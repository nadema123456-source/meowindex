export default function CatsLoading() {
  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div className="h-12 w-72 animate-pulse rounded-2xl bg-white/80 shadow-soft" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-14 w-44 animate-pulse rounded-2xl bg-white/80 shadow-soft"
            />
          ))}
        </div>
      </div>
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-4xl bg-white shadow-soft"
          >
            <div className="h-52 w-full animate-pulse bg-gradient-to-br from-blossom/30 via-butter/30 to-babyblue/30" />
            <div className="space-y-2 p-4">
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-black/5" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-black/5" />
              <div className="flex gap-1.5 pt-2">
                <div className="h-5 w-14 animate-pulse rounded-full bg-butter/50" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-babyblue/50" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
