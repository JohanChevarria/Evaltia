export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ path: string[] }>;
};

export default async function AdminStudioLegacyCatchAll({ params }: PageProps) {
  const { path } = await params;
  redirect(`/studio/admin-studio/${path.join("/")}`);
}
