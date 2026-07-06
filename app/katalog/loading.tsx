export default function KatalogLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
      <div className="animate-pulse">
        <div className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 h-12 w-2/3 max-w-md rounded-2xl bg-slate-200 dark:bg-slate-700" />
        <div className="mt-5 h-5 w-1/2 max-w-sm rounded-xl bg-slate-100 dark:bg-slate-800" />

        <div className="mt-10 flex gap-3">
          <div className="h-12 flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-12 w-36 rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-12 w-28 rounded-full bg-slate-100 dark:bg-slate-800" />
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[2.5rem] border border-slate-100 dark:border-slate-800"
            >
              <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-4 p-6">
                <div className="h-5 w-2/3 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="h-3.5 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3.5 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3.5 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3.5 rounded-lg bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-9 w-32 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3.5 w-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
