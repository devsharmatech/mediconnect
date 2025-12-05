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

        patient:patient_id(
          phone_number,
          patient_details (
            full_name,
            gender,
            date_of_birth,
            address
          )
        ),

        prescription:prescription_id(
          id,
          medicines,
          lab_tests,
          investigations,
          special_message,
          created_at,

          doctor:doctor_id(
            full_name,
            specialization,
            qualification,
            clinic_name,
            clinic_address,
            signature_url
          ),

          appointment:appointment_id(
            id,
            appointment_date,
            appointment_time,
            status,
            disease_info
          )
        )
      `)
      .eq("id", order_id)
      .maybeSingle();

    if (error) throw error;

    return success("Order details fetched", data, 200, { headers: corsHeaders });

  } catch (err) {
    return failure("Error fetching order details", err.message, 500, { headers: corsHeaders });
  }
}
