import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { chemist_id, name, brand, category, strength, type, description } = body;

    if (!chemist_id || !name) {
      return failure("chemist_id and name required", null, 400, { headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from("chemist_medicines")
      .insert([{ chemist_id, name, brand, category, strength, type, description }])
      .select()
      .single();

    if (error) throw error;

    return success("Medicine added successfully", data, 201, { headers: corsHeaders });
  } catch (err) {
    return failure("Medicine create failed", err.message, 500, { headers: corsHeaders });
  }
}
