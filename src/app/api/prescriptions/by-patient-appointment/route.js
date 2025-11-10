import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { patient_id, appointment_id } = body || {};

    if (!patient_id || !appointment_id) {
      return failure("patient_id and appointment_id are required", null, 400, {
        headers: corsHeaders,
      });
    }

    // Fetch prescription
    const { data: prescription, error } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", patient_id)
      .eq("appointment_id", appointment_id)
      .maybeSingle();

    if (error) throw error;
    if (!prescription) {
      return failure("No prescription found for this patient and appointment.", null, 404, {
        headers: corsHeaders,
      });
    }

    // Fetch related info
    const [doctorRes, patientRes, appointmentRes] = await Promise.all([
      supabase.from("doctor_details").select("*").eq("id", prescription.doctor_id).maybeSingle(),
      supabase.from("patient_details").select("*").eq("id", prescription.patient_id).maybeSingle(),
      supabase.from("appointments").select("*").eq("id", prescription.appointment_id).maybeSingle(),
    ]);

    if (doctorRes.error) throw doctorRes.error;
    if (patientRes.error) throw patientRes.error;
    if (appointmentRes.error) throw appointmentRes.error;

    const response = {
      ...prescription,
      doctor_details: doctorRes.data || {},
      patient_details: patientRes.data || {},
      appointments: appointmentRes.data || {},
    };

    return success("Prescription fetched successfully.", response, 200, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Get prescription by patient+appointment error:", error);
    return failure("Failed to fetch prescription.", error.message, 500, {
      headers: corsHeaders,
    });
  }
}
