export const dynamic = "force-dynamic";

export default async function StudioHistory({ params }: { params: Promise<{ uni: string }> }) {
  const { uni } = await params;
  return <div className="text-xl font-bold">Historial — {uni.toUpperCase()}</div>;
}
