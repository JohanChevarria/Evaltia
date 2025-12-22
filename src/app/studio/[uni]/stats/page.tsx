export const dynamic = "force-dynamic";

export default function StudioStats({ params }: { params: { uni: string } }) {
  return <div className="text-xl font-bold">Stats — {params.uni.toUpperCase()}</div>;
}
