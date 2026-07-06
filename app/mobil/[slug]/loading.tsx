export default function CarDetailLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <div className="animate-pulse">
        <div className="h-3.5 w-64 rounded-lg bg-slate-100 dark:bg-slate-800" />

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="aspect-[16/10] rounded-[2rem] bg-slate-100 dark:bg-slate-800" />
            <div className="mt-3 grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
            <div className="mt-8 h-10 w-2/3 rounded-2xl bg-slate-200 dark:bg-slate-700" />
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-[1.75rem] bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-44 rounded-[2rem] bg-slate-100 dark:bg-slate-800" />
            <div className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-96 rounded-[2rem] bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </section>
  );
}
