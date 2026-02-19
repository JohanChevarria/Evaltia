export default function DashboardSegmentLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-full bg-white/20" />
        <div className="h-28 rounded-2xl bg-white/15" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-52 rounded-2xl bg-white/15" />
          <div className="h-52 rounded-2xl bg-white/15" />
        </div>
      </div>
    </main>
  );
}
