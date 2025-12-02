import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { prescription_id, patient_id, chemist_id, medicines, patient_notes } = body;

    if (!prescription_id || !patient_id) {
      return failure("prescription_id & patient_id required", null, 400, { headers: corsHeaders });
    }

    const { data: order, error: orderErr } = await supabase
      .from("medicine_orders")
      .insert([
        {
          prescription_id,
          patient_id,
          chemist_id: chemist_id || null,
          status: chemist_id ? "sent_to_chemist" : "pending",
          patient_notes,
        },
      ])
      .select()
      .single();

    if (orderErr) throw orderErr;

    if (Array.isArray(medicines)) {
      const items = medicines.map((m) => ({
        order_id: order.id,
        medicine_name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        quantity: m.quantity || 1,
      }));

      const { error: itemsErr } = await supabase
        .from("medicine_order_items")
        .insert(items);

      if (itemsErr) throw itemsErr;
    }

    return success("Medicine order created", order, 201, { headers: corsHeaders });
  } catch (err) {
    return failure("Failed to create order", err.message, 500, { headers: corsHeaders });
  }
}
