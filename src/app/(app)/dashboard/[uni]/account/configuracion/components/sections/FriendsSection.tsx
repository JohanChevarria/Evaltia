export default function FriendsSection() {
  return (
    <section id="amigos" className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Amigos</h2>
      </div>

      <div className="grid place-items-center rounded-3xl bg-slate-50 p-10 ring-1 ring-slate-200">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-200 text-slate-700">
          👥
        </div>
        <span className="mt-3 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
          PRÓXIMAMENTE
        </span>
        <p className="mt-3 text-center text-xs text-slate-600">
          Pronto podrás conectar con otros estudiantes y estudiar juntos
        </p>
      </div>
    </section>
  );
}
