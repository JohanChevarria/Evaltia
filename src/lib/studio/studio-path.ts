const DEFAULT_UNI_CODE = "usmp";

type SupabaseQueryClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ data: { code?: string | null } | null }>;
      };
    };
  };
};

export async function getStudioPathForUniversityId(
  supabase: SupabaseQueryClient,
  universityId: string
) {
  const { data: uni } = await supabase
    .from("universities")
    .select("code")
    .eq("id", universityId)
    .single();

  const uniCode = (uni?.code || DEFAULT_UNI_CODE).toLowerCase();
  return `/studio/${uniCode}`;
}
