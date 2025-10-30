import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { appointment_id, status, doctor_id } = await req.json();
    if (!appointment_id || !status || !doctor_id)
      return failure("appointment_id, status, and doctor_id required.", null, 400, { headers: corsHeaders });

    if (!["approved", "rejected"].includes(status))
      return failure("Invalid status. Must be approved or rejected.", null, 400, { headers: corsHeaders });

    const { data: appointment, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointment_id)
      .eq("doctor_id", doctor_id)
      .single();

    if (error || !appointment) throw new Error("Appointment not found.");

    const { data: updated, error: updateErr } = await supabase
      .from("appointments")
      .update({ status, updated_at: new Date() })
      .eq("id", appointment_id)
      .select("*")
      .single();

    if (updateErr) throw updateErr;

    // Notification for patient
    await supabase.from("notifications").insert({
      doctor_id: appointment.patient_id,
      title: `Appointment ${status === "approved" ? "Approved" : "Rejected"}`,
      message: `Your appointment for ${appointment.appointment_date} at ${appointment.appointment_time} has been ${status}.`,
      type: "appointment_status",
      metadata: { appointment_id, status, by_user: doctor_id }
    });

    return success(`Appointment ${status} successfully.`, updated, 200, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return failure("Failed to update appointment status.", error.message, 500, { headers: corsHeaders });
  }
}
