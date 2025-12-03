import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  const { chemist_id } = await req.json();

  const { data } = await supabase
    .from("chemist_inventory")
    .select("*, chemist_medicines(*)")
    .eq("chemist_id", chemist_id)
    .lt("total_stock", "low_stock_threshold");

  return success("Low stock items", data, 200, { headers: corsHeaders });
}
