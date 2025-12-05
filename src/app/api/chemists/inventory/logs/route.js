import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { chemist_id, medicine_id, limit = 50, cursor } = await req.json();

    if (!chemist_id) {
      return failure("chemist_id required", null, 400, { headers: corsHeaders });
    }

    // Build base query
    let query = supabase
      .from("chemist_stock_logs")
      .select(`
        id,
        chemist_id,
        medicine_id,
        batch_id,
        change_type,
        qty_changed,
        reason,
        created_at,
        medicine:chemist_medicines (id, name, strength, category)
      `)
      .eq("chemist_id", chemist_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (medicine_id) query = query.eq("medicine_id", medicine_id);
    if (cursor) query = query.lt("created_at", cursor);

    const { data, error } = await query;

    if (error) throw error;

    return success("Stock logs fetched", data, 200, { headers: corsHeaders });
  } catch (err) {
    console.error("logs fetch error:", err);
    return failure("Error fetching stock logs", err.message, 500, { headers: corsHeaders });
  }
}
