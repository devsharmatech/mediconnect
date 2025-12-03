import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, ...updateFields } = body;

    if (!id) return failure("id required", null, 400, { headers: corsHeaders });

    const { data, error } = await supabase
      .from("chemist_medicines")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return success("Medicine updated", data, 200, { headers: corsHeaders });
  } catch (err) {
    return failure("Update failed", err.message, 500, { headers: corsHeaders });
  }
}
