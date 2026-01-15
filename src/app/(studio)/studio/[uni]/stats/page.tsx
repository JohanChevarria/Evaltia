export const dynamic = "force-dynamic";

export default async function StudioStats({ params }: { params: Promise<{ uni: string }> }) {
  const { uni } = await params;
  return <div className="text-xl font-bold">Stats — {uni.toUpperCase()}</div>;
}
