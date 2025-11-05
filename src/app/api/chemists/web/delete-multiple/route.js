import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return failure("No chemist IDs provided.", null, 400, { headers: corsHeaders });
    }
    const { error } = await supabase.from("users").delete().in("id", ids);
    if (error) throw error;

    return success("Selected chemists deleted successfully.", null, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Bulk Delete Chemists Error:", error);
    return failure("Failed to delete chemists.", error.message, 500, { headers: corsHeaders });
  }
}
