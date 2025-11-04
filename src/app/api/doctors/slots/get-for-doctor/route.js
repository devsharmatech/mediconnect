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
      return failure("doctor_id and date are required", null, 400, { headers: corsHeaders });

    const { data: doctor, error: doctorErr } = await supabase
      .from("doctor_details")
      .select("available_days, available_time")
      .eq("id", doctor_id)
      .maybeSingle();

    if (doctorErr) throw doctorErr;
    if (!doctor) return failure("Doctor not found", null, 404, { headers: corsHeaders });

    const weekday = new Date(date).toLocaleString("en-US", { weekday: "short" });
    if (!doctor.available_days?.includes(weekday))
      return success("Doctor not available on this day.", [], 200, { headers: corsHeaders });

    const { start, end } = doctor.available_time || {};
    if (!start || !end)
      return failure("Doctor has no availability time set.", null, 400, { headers: corsHeaders });

    const slots = [];
    let current = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    while (current < endTime) {
      const time = current.toTimeString().slice(0, 5);
      slots.push({ time, status: "available" });
      current.setMinutes(current.getMinutes() + 30);
    }

    const { data: appointments, error: appErr } = await supabase
      .from("appointments")
      .select("appointment_time, status")
      .eq("doctor_id", doctor_id)
      .eq("appointment_date", date);

    if (appErr) throw appErr;

    const finalSlots = slots.map(slot => {
      const appt = appointments.find(a => a.appointment_time.slice(0, 5) === slot.time);
      if (appt) slot.status = appt.status;
      return slot;
    });

    return success("Doctor slots fetched successfully.", finalSlots, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("Get doctor slots error:", error);
    return failure("Failed to fetch doctor slots.", error.message, 500, { headers: corsHeaders });
  }
}
