const DEFAULT_UNI_CODE = "usmp";

type SupabaseQueryClient = {
  from: (...args: any[]) => any;
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
