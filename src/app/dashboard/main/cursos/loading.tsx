export default function LoadingCursos() {
  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6">
      <section className="rounded-2xl bg-white/70 backdrop-blur border border-black/5 shadow-sm p-5 sm:p-7">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-44 rounded bg-black/10" />
          <div className="h-4 w-72 rounded bg-black/10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-black/10" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}