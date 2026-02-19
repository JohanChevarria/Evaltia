export default function DashboardMainLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-2xl bg-white/55" />
      <div className="grid gap-6 md:grid-cols-[20rem,minmax(0,1fr)]">
        <div className="h-64 rounded-2xl bg-white/45" />
        <div className="h-64 rounded-2xl bg-white/45" />
      </div>
      <div className="h-40 rounded-2xl bg-white/45" />
    </div>
  );
}
