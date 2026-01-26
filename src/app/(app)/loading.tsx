export default function AppLoading() {
  return (
    <div className="relative min-h-screen w-full text-white">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 70% 30%, rgba(255,255,255,0.10) 0%, transparent 55%),
            radial-gradient(circle at 30% 70%, rgba(176,196,222,0.14) 0%, transparent 55%),
            linear-gradient(135deg, #2c3e50 0%, #3a506b 30%, #435e79 55%, #516b87 78%, #5f7995 100%)
          `,
          backgroundBlendMode: "soft-light, screen, normal",
          filter: "brightness(1.02) contrast(1.04)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-8 w-8 rounded-full border border-white/40 border-t-transparent animate-spin" />
          <p className="text-sm text-white/80">Cargando tu panel...</p>
        </div>
      </div>
    </div>
  );
}
