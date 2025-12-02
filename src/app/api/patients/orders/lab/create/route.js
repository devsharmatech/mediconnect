import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { prescription_id, patient_id, lab_id, tests, patient_notes } = await req.json();

    if (!patient_id) {
      return failure("patient_id required", null, 400, { headers: corsHeaders });
    }

    const { data: order, error } = await supabase
      .from("lab_test_orders")
      .insert([
        {
          prescription_id,
          patient_id,
          lab_id,
          status: lab_id ? "sent_to_lab" : "pending",
          patient_notes,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    if (Array.isArray(tests)) {
      const items = tests.map((t) => ({
        order_id: order.id,
        test_name: t.name,
        price: t.price || null,
      }));

      const { error: itemErr } = await supabase
        .from("lab_test_order_items")
        .insert(items);

      if (itemErr) throw itemErr;
    }

    return success("Lab test order created", order, 201, { headers: corsHeaders });
  } catch (err) {
    return failure("Failed creating test order", err.message, 500, { headers: corsHeaders });
  }
}
