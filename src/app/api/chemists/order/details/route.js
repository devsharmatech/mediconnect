import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return failure("order_id required", null, 400, { headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from("medicine_orders")
      .select(`
        *,
        medicine_order_items(*),
        patient:patient_id(full_name, phone_number, address),
        prescription:prescription_id(medicines, special_message)
      `)
      .eq("id", order_id)
      .maybeSingle();

    if (error) throw error;

    return success("Order details fetched", data, 200, { headers: corsHeaders });
  } catch (err) {
    return failure("Error fetching order details", err.message, 500, { headers: corsHeaders });
  }
}
