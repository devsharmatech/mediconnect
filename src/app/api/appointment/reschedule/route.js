import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { appointment_id, new_date, new_time, user_id } = await req.json();

    if (!appointment_id || !new_date || !new_time || !user_id) {
      return failure("appointment_id, new_date, new_time, and user_id are required.", null, 400, { headers: corsHeaders });
    }

    // ✅ Fetch appointment
    const { data: appointment, error: fetchErr } = await supabase
      .from("appointments")
      .select("*")
      .eq("id",appointment_id)
      .single();

    if (fetchErr || !appointment) throw new Error("Appointment not found.");

    // ✅ Check slot already booked
    const { data: slot, error: slotErr } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", appointment.doctor_id)
      .eq("appointment_date", new_date)
      .eq("appointment_time", new_time)
      .eq("status", "booked")
      .maybeSingle();

    if (slotErr) throw slotErr;
    if (slot) return failure("This new slot is already booked.", null, 409, { headers: corsHeaders });

    // ✅ Update appointment
    const { data: updated, error: updateErr } = await supabase
      .from("appointments")
      .update({
        appointment_date: new_date,
        appointment_time: new_time,
        updated_at: new Date(),
        status: "booked"
      })
      .eq("id", appointment_id)
      .select("*")
      .single();

    if (updateErr) throw updateErr;

    // ✅ Notifications
    const notifications = [
      {
        user_id: appointment.doctor_id,
        title: "Appointment Rescheduled",
        message: `Appointment has been rescheduled to ${new_date} at ${new_time}.`,
        type: "appointment_reschedule",
        metadata: { appointment_id, new_date, new_time, by_user: user_id }
      },
      {
        user_id: appointment.patient_id,
        title: "Appointment Rescheduled",
        message: `Your appointment has been moved to ${new_date} at ${new_time}.`,
        type: "appointment_reschedule",
        metadata: { appointment_id, new_date, new_time, by_user: user_id }
      }
    ];

    await supabase.from("notifications").insert(notifications);

    return success("Appointment rescheduled successfully.", updated, 200, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return failure("Failed to reschedule appointment.", error.message, 500, { headers: corsHeaders });
  }
}
