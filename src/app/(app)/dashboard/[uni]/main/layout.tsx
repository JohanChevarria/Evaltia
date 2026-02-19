import MainLayoutClient from "./MainLayoutClient";

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ uni: string }>;
}) {
  const { uni } = await params;

  return <MainLayoutClient uni={uni}>{children}</MainLayoutClient>;
}
