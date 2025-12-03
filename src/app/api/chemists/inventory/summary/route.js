import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { chemist_id } = await req.json();

    const { data, error } = await supabase
      .from("chemist_inventory")
      .select("*, chemist_medicines(*)")
      .eq("chemist_id", chemist_id);

    if (error) throw error;

    return success("Inventory summary", data, 200, { headers: corsHeaders });
  } catch (err) {
    return failure("Failed", err.message, 500, { headers: corsHeaders });
  }
}
