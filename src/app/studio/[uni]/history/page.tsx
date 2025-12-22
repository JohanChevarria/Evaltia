export const dynamic = "force-dynamic";

export default function StudioHistory({ params }: { params: { uni: string } }) {
  return <div className="text-xl font-bold">Historial — {params.uni.toUpperCase()}</div>;
}
