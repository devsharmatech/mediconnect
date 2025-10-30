import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { appointment_id, user_id } = await req.json();
    if (!appointment_id || !user_id)
      return failure("appointment_id and user_id are required.", null, 400, { headers: corsHeaders });

    const { data: appointment, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointment_id)
      .single();

    if (error || !appointment) throw new Error("Appointment not found.");

    if (![appointment.doctor_id, appointment.patient_id].includes(user_id))
      return failure("You do not have permission to delete this appointment.", null, 403, { headers: corsHeaders });

    const { error: deleteErr } = await supabase.from("appointments").delete().eq("id", appointment_id);
    if (deleteErr) throw deleteErr;

    const notifications = [
      {
        user_id: appointment.doctor_id,
        title: "Appointment Cancelled",
        message: `Appointment for ${appointment.appointment_date} at ${appointment.appointment_time} has been cancelled.`,
        type: "appointment_delete",
        metadata: { appointment_id, by_user: user_id }
      },
      {
        user_id: appointment.patient_id,
        title: "Appointment Cancelled",
        message: `Your appointment for ${appointment.appointment_date} at ${appointment.appointment_time} has been cancelled.`,
        type: "appointment_delete",
        metadata: { appointment_id, by_user: user_id }
      }
    ];

    await supabase.from("notifications").insert(notifications);

    return success("Appointment deleted successfully.", null, 200, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return failure("Failed to delete appointment.", error.message, 500, { headers: corsHeaders });
  }
}
