import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { order_id, chemist_id } = await req.json();

    if (!order_id || !chemist_id) {
      return failure("order_id & chemist_id required", null, 400, {
        headers: corsHeaders,
      });
    }

    const { data, error } = await supabase
      .from("medicine_orders")
      .update({
        status: "completed",
        updated_at: new Date(),
      })
      .eq("id", order_id)
      .eq("chemist_id", chemist_id)
      .select()
      .single();

    if (error) throw error;

    return success("Payment verified, order completed", data, 200, {
      headers: corsHeaders,
    });

  } catch (err) {
    return failure("Failed to verify payment", err.message, 500, {
      headers: corsHeaders,
    });
  }
}
