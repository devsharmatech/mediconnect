import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { lab_id } = await req.json();

    if (!lab_id) {
      return failure("lab_id required", null, 400, { headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from("lab_test_orders")
      .select("*, lab_test_order_items(*)")
      .eq("lab_id", lab_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return success("Lab orders fetched", data, 200, { headers: corsHeaders });
  } catch (err) {
    return failure("Failed fetching", err.message, 500, { headers: corsHeaders });
  }
}
