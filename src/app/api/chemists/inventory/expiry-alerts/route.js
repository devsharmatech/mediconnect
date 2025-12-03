import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  const { chemist_id } = await req.json();

  const today = new Date();
  today.setMonth(today.getMonth() + 1); 

  const expiryISO = today.toISOString();

  const { data } = await supabase
    .from("chemist_inventory_batches")
    .select("*, chemist_medicines(*)")
    .lt("expiry_date", expiryISO)
    .eq("chemist_id", chemist_id);

  return success("Low stock items", data, 200, { headers: corsHeaders });
}
