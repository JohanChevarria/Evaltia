export default function LoadingCursos() {
  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6">
      <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-black/5 p-4 sm:p-6 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 rounded bg-black/10" />
          <div className="h-4 w-80 rounded bg-black/10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-black/5" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}