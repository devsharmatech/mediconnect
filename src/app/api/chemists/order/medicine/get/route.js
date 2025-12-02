import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { chemist_id } = await req.json();

    if (!chemist_id) {
      return failure("chemist_id required", null, 400, { headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from("medicine_orders")
      .select("*, medicine_order_items(*)")
      .eq("chemist_id", chemist_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return success("Chemist orders fetched", data, 200, { headers: corsHeaders });
  } catch (err) {
    return failure("Error fetching orders", err.message, 500, { headers: corsHeaders });
  }
}
