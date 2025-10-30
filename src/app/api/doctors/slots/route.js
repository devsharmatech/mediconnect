import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { doctor_id, date } = await req.json();
    if (!doctor_id || !date)
      return failure("doctor_id and date required", null, 400, { headers: corsHeaders });

    // ✅ Fetch doctor availability
    const { data: doctor, error: doctorErr } = await supabase
      .from("doctor_details")
      .select("available_days, available_time")
      .eq("id", doctor_id)
      .maybeSingle();

    if (doctorErr) throw doctorErr;
    if (!doctor) return failure("Doctor not found", null, 404, { headers: corsHeaders });

    // ✅ Check if doctor is available on that weekday
    const weekday = new Date(date).toLocaleString("en-US", { weekday: "short" });
    if (!doctor.available_days?.includes(weekday))
      return success("Doctor not available on this day.", [], 200, { headers: corsHeaders });

    // ✅ Get start and end times
    const { start, end } = doctor.available_time || {};
    if (!start || !end)
      return failure("Doctor has no availability time set.", null, 400, { headers: corsHeaders });

    // ✅ Generate slots every 30 minutes
    const slots = [];
    let current = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    while (current < endTime) {
      const time = current.toTimeString().slice(0, 5);
      slots.push({ time, slot_booked: false });
      current.setMinutes(current.getMinutes() + 30);
    }

    // ✅ Fetch booked appointments for that doctor & date
    const { data: bookedAppointments, error: appErr } = await supabase
      .from("appointments")
      .select("appointment_time")
      .eq("doctor_id", doctor_id)
      .eq("appointment_date", date)
      .in("status", ["booked", "approved", "completed"]);;

    if (appErr) throw appErr;

    const bookedTimes = bookedAppointments?.map(a => a.appointment_time.slice(0, 5)) || [];

    // ✅ Mark slots as booked
    const finalSlots = slots.map(slot => ({
      ...slot,
      slot_booked: bookedTimes.includes(slot.time)
    }));

    return success("Slots generated successfully.", finalSlots, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Generate slots error:", error);
    return failure("Failed to generate slots.", error.message, 500, { headers: corsHeaders });
  }
}
