import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { item_id, status, price, quantity } = await req.json();

    if (!item_id || !status) {
      return failure("item_id and status required", null, 400, { headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from("medicine_order_items")
      .update({ status, price, quantity })
      .eq("id", item_id)
      .select()
      .maybeSingle();

    if (error) throw error;

    return success("Order item updated", data, 200, { headers: corsHeaders });
  } catch (err) {
    return failure("Error updating item", err.message, 500, { headers: corsHeaders });
  }
}
